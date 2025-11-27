import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { HomePage } from "./components/HomePage";
import { SignUpPage } from "./components/SignUpPage";
import { LoginPage } from "./components/LoginPage";
import { MyTripsPage } from "./components/MyTripsPage";
import { CreateTripFlow } from "./components/CreateTripFlow";
import { AdminPage } from "./components/AdminPage";
import { QAPage } from "./components/QAPage";
import { User, Trip } from "./types";
import { api } from "./services/api";

export type CreateTripPayload = {
  role: "driver" | "passenger" | "both";
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  arrivalTime: string;
  recurrence: "once" | "weekly" | "custom";
  recurringDays?: string[];
  availableSeats?: number;
  rules?: string;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "signup" | "login" | "mytrips" | "create" | "admin" | "qa">("home");
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("hoppin_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      if (user?.token) {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedTrips = await api.getTrips(user.token, user.isAdmin);
          // Ensure we always set an array
          setTrips(Array.isArray(fetchedTrips) ? fetchedTrips : []);
        } catch (err: any) {
          console.error("Failed to fetch trips:", err);
          setError(err.message);
          setTrips([]); // Set empty array on error

          // If token is invalid, log out user
          if (err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("Invalid token")) {
            handleLogout();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setTrips([]);
      }
    };
    fetchTrips();
  }, [user?.token]); // Only depend on token to avoid infinite loops

  const handleUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem("hoppin_user", JSON.stringify(userData));
    setCurrentPage(userData.isAdmin ? "admin" : "home");
  };

  const handleSignUp = async (userData: Omit<User, "id" | "isAdmin" | "token"> & { password: string }) => {
    setError(null);
    setIsLoading(true);
    console.log("SignUp data being sent:", userData); // Debug log
    try {
      const newUser = await api.signUp(userData);
      handleUserSession(newUser);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const loggedInUser = await api.login(email, password);
      handleUserSession(loggedInUser);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTrips([]);
    localStorage.removeItem("hoppin_user");
    setCurrentPage("home");
  };

  const handleCreateTrip = async (tripData: CreateTripPayload) => {
    if (!user?.token) {
      setError("You must be logged in to create a trip.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const newTrip = await api.createTrip(tripData, user.token);
      setTrips((prevTrips) => [...prevTrips, newTrip]);
      setCurrentPage("mytrips");
    } catch (err: any) {
      console.error("Create trip error:", err);
      setError(err.message || "Failed to create trip");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user?.token) {
      setError("You must be logged in to delete a trip.");
      return;
    }

    const confirmed = window.confirm("Sei sicuro di voler cancellare questo viaggio?");
    if (!confirmed) return;

    setError(null);
    setIsLoading(true);
    try {
      await api.deleteTrip(tripId, user.token);
      setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
    } catch (err: any) {
      console.error("Delete trip error:", err);
      setError(err.message || "Failed to delete trip");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMatched = async (tripId: string) => {
    if (!user?.token) {
      setError("You must be logged in to modify a trip.");
      return;
    }
    setError(null);
    try {
      const updatedTrip = await api.toggleMatched(tripId, user.token);
      setTrips((prevTrips) => prevTrips.map((trip) => (trip.id === tripId ? updatedTrip : trip)));
    } catch (err: any) {
      console.error("Toggle matched error:", err);
      setError(err.message || "Failed to update trip");
    }
  };

  const getUserTrips = () => {
    if (!user) return [];
    // Ensure trips is always an array
    const tripsArray = Array.isArray(trips) ? trips : [];
    // If admin, show all trips; otherwise filter by user
    return user.isAdmin ? tripsArray : tripsArray.filter((trip) => trip.userId === user.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: logo + desktop menu */}
              <div className="flex items-center gap-8">
                <button
                  onClick={() => {
                    setCurrentPage("home");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-primary font-bold text-lg"
                >
                  Hoppin
                </button>

                {/* Desktop nav (visibile da md in su) */}
                <div className="hidden md:flex gap-4">
                  <button
                    onClick={() => setCurrentPage("mytrips")}
                    className={`px-3 py-2 rounded-md ${currentPage === "mytrips" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    I miei Viaggi
                  </button>
                  <button
                    onClick={() => setCurrentPage("create")}
                    className={`px-3 py-2 rounded-md ${currentPage === "create" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    Crea Percorso
                  </button>
                  <button onClick={() => setCurrentPage("qa")} className={`px-3 py-2 rounded-md ${currentPage === "qa" ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                    Aiuto
                  </button>

                  {/* Solo per admin: voce extra */}
                  {user.isAdmin && (
                    <button
                      onClick={() => setCurrentPage("admin")}
                      className={`px-3 py-2 rounded-md ${currentPage === "admin" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                    >
                      Pannello Admin
                    </button>
                  )}
                </div>
              </div>

              {/* Right: user info + logout + hamburger mobile */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 hidden sm:inline">
                  {user.firstName} {user.lastName}
                </span>

                {/* Logout desktop */}
                <button onClick={handleLogout} className="px-4 py-2 text-gray-600 hover:text-gray-900 hidden md:inline-block">
                  Sign Out
                </button>

                {/* Hamburger mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
                  aria-label="Apri menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu (md:hidden) */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => {
                    setCurrentPage("mytrips");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${currentPage === "mytrips" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  I miei Viaggi
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("create");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${currentPage === "create" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Crea Percorso
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("qa");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${currentPage === "qa" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Aiuto
                </button>

                {/* Voce aggiuntiva visibile solo se admin */}
                {user.isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentPage("admin");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md ${currentPage === "admin" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    Pannello Admin
                  </button>
                )}

                {/* Logout mobile */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-2 block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </nav>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4 max-w-7xl mx-auto" role="alert">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {isLoading && currentPage !== "home" ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {currentPage === "home" && (
            <HomePage
              onSignUp={() => setCurrentPage("signup")}
              onLogin={() => setCurrentPage("login")}
              onCreateRoute={() => setCurrentPage("create")}
              onLearnMore={() => setCurrentPage("qa")}
              isLoggedIn={!!user}
            />
          )}
          {currentPage === "signup" && <SignUpPage onSignUp={handleSignUp} onBack={() => setCurrentPage("home")} />}
          {currentPage === "login" && <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage("home")} />}
          {currentPage === "mytrips" && user && (
            <MyTripsPage trips={getUserTrips()} onCreateTrip={() => setCurrentPage("create")} onDeleteTrip={handleDeleteTrip} />
          )}
          {currentPage === "create" && user && <CreateTripFlow onComplete={handleCreateTrip} onCancel={() => setCurrentPage("mytrips")} />}
          {currentPage === "admin" && user?.isAdmin && <AdminPage trips={trips} onToggleMatched={handleToggleMatched} onDeleteTrip={handleDeleteTrip} />}
          {currentPage === "qa" && <QAPage onBack={() => setCurrentPage(user ? "home" : "home")} />}
        </>
      )}
    </div>
  );
}
