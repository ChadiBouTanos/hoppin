import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // hmr trigger
import { HomePage } from "./components/HomePage";
import { LandingPage } from "./components/LandingPage";
import { SignUpPage } from "./components/SignUpPage";
import { LoginPage } from "./components/LoginPage";
import { MyTripsPage } from "./components/MyTripsPage";
import { AllTripsPage } from "./components/AllTripsPage";
import { CreateTripFlow } from "./components/CreateTripFlow";
import { AdminPage } from "./components/AdminPage";
import { QAPage } from "./components/QAPage";
import { User, Trip, TripMatch, HoppinEvent } from "./types";
import { api } from "./services/api";
import { EventPage } from "./components/EventPage";

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
  flexibilityBefore?: number | null;
  flexibilityAfter?: number | null;
  eventId?: string;
};

// ─── URL-based routing for event pages ───
function getInitialRoute(): { page: "landing" | "home" | "signup" | "login" | "mytrips" | "alltrips" | "create" | "admin" | "qa" | "event"; eventSlug?: string } {
  const path = window.location.pathname;
  const match = path.match(/^\/eventi\/([a-z0-9-]+)\/?$/i);
  if (match) {
    return { page: "event", eventSlug: match[1] };
  }
  return { page: "landing" };
}

export default function App() {
  const initialRoute = getInitialRoute();
  const [currentPage, setCurrentPage] = useState<"landing" | "home" | "signup" | "login" | "mytrips" | "alltrips" | "create" | "admin" | "qa" | "event">(initialRoute.page);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("hoppin_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [matches, setMatches] = useState<TripMatch[]>([]);
  const [events, setEvents] = useState<HoppinEvent[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(initialRoute.eventSlug || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper per ricaricare viaggi + abbinamenti
  const refreshData = async (token: string, isAdmin: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      // fetch all trips for AllTrips/Admin
      const allTripsPromise = api.getTrips(token, true);
      // fetch only user trips for MyTrips
      const userTripsPromise = api.getTrips(token, false);
      const matchesPromise = isAdmin ? api.getMatches(token, true) : Promise.resolve([]);

      const [fetchedAllTrips, fetchedUserTrips, fetchedMatches] =
        await Promise.all([allTripsPromise, userTripsPromise, matchesPromise]);

      setAllTrips(Array.isArray(fetchedAllTrips) ? fetchedAllTrips : []);
      setUserTrips(Array.isArray(fetchedUserTrips) ? fetchedUserTrips : []);
      setMatches(Array.isArray(fetchedMatches) ? fetchedMatches : []);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Errore nel recupero dei dati");
      setAllTrips([]);
      setUserTrips([]);
      setMatches([]);

      if (err.message?.includes("401") || err.message?.includes("Unauthorized") || err.message?.includes("Invalid token")) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Caricamento iniziale di viaggi + match quando cambia utente/token
  useEffect(() => {
    const fetchAll = async () => {
      if (user?.token) {
        await refreshData(user.token, user.isAdmin);
      } else {
        setAllTrips([]);
        setUserTrips([]);
        setMatches([]);
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [user?.token, user?.isAdmin]);

  // Fetch eventi (pubblico, no auth)
  useEffect(() => {
    api.getEvents().then(setEvents).catch(console.error);
  }, []);

  const handleNavigateToEvent = (slug: string) => {
    setSelectedEventSlug(slug);
    setCurrentPage("event");
    window.history.pushState({}, "", `/eventi/${slug}`);
  };

  const handleCreateEvent = async (data: { title: string; description: string; imageUrl: string; eventDates?: string[] }) => {
    if (!user?.token) { setError("Devi essere admin per creare eventi."); return; }
    setError(null);
    try {
      await api.createEvent(data, user.token);
      const updatedEvents = await api.getEvents();
      setEvents(updatedEvents);
    } catch (err: any) {
      console.error("Create event error:", err);
      setError(err.message || "Errore nella creazione dell'evento");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.token) { setError("Devi essere admin per eliminare eventi."); return; }
    setError(null);
    try {
      await api.deleteEvent(eventId, user.token);
      const updatedEvents = await api.getEvents();
      setEvents(updatedEvents);
    } catch (err: any) {
      console.error("Delete event error:", err);
      setError(err.message || "Errore nella eliminazione dell'evento");
    }
  };

  const handleUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem("hoppin_user", JSON.stringify(userData));
    setCurrentPage(userData.isAdmin ? "admin" : "home");
  };

  const handleSignUp = async (userData: Omit<User, "id" | "isAdmin" | "token"> & { password: string }) => {
    setError(null);
    setIsLoading(true);
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
    setAllTrips([]);
    setUserTrips([]);
    setMatches([]);
    localStorage.removeItem("hoppin_user");
    setCurrentPage("landing");
  };

  const handleCreateTrip = async (tripData: CreateTripPayload) => {
    if (!user?.token) { setError("You must be logged in to create a trip."); return; }
    setError(null); setIsLoading(true);
    try {
      await api.createTrip(tripData, user.token);
      await refreshData(user.token, user.isAdmin); // reload both lists
      setCurrentPage("mytrips");
    } catch (err: any) {
      console.error("Create trip error:", err);
      setError(err.message || "Failed to create trip");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user?.token) { setError("You must be logged in to delete a trip."); return; }
    if (!window.confirm("Sei sicuro di voler cancellare questo viaggio?")) return;
    setError(null); setIsLoading(true);
    try {
      await api.deleteTrip(tripId, user.token);
      await refreshData(user.token, user.isAdmin); // keep both lists accurate
    } catch (err: any) {
      console.error("Delete trip error:", err);
      setError(err.message || "Failed to delete trip");
    } finally {
      setIsLoading(false);
    }
  };


  // Creazione abbinamento (driverTrip + passengerTrip)
  const handleCreateMatch = async (driverTripId: string, passengerTripId: string) => {
    if (!user?.token) {
      setError("You must be logged in as admin to create a match.");
      return;
    }
    if (!user.isAdmin) {
      setError("Solo un amministratore può creare abbinamenti.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await api.createMatch(driverTripId, passengerTripId, user.token);
      await refreshData(user.token, user.isAdmin);
    } catch (err: any) {
      console.error("Create match error:", err);
      setError(err.message || "Errore nella creazione dell'abbinamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveMatch = async (matchId: string) => {
    if (!user?.token) {
      setError("You must be logged in as admin to archive a match.");
      return;
    }
    if (!user.isAdmin) {
      setError("Solo un amministratore può archiviare abbinamenti.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await api.archiveMatch(matchId, user.token);
      await refreshData(user.token, user.isAdmin);
    } catch (err: any) {
      console.error("Archive match error:", err);
      setError(err.message || "Errore nell'archiviazione dell'abbinamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!user?.token) {
      setError("You must be logged in as admin to delete a match.");
      return;
    }
    if (!user.isAdmin) {
      setError("Solo un amministratore può eliminare abbinamenti.");
      return;
    }

    const confirmed = window.confirm("Sei sicuro di voler eliminare definitivamente questo abbinamento?");
    if (!confirmed) return;

    setError(null);
    setIsLoading(true);
    try {
      await api.deleteMatch(matchId, user.token);
      await refreshData(user.token, user.isAdmin);
    } catch (err: any) {
      console.error("Delete match error:", err);
      setError(err.message || "Errore nella eliminazione dell'abbinamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        currentPage === "landing" || currentPage === "event"
          ? "public-shell"
          : user
            ? "logged-in-shell"
            : currentPage === "home" || currentPage === "qa" || currentPage === "login" || currentPage === "signup"
              ? "public-shell"
              : "bg-gray-50"
      }`}
    >
      {user && currentPage !== "event" && (
        <nav className="glass-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => {
                    setCurrentPage("home");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-brand font-bold text-lg tracking-tight"
                >
                  Hoppin
                </button>

                <div className="hidden md:flex gap-4">
                  <button
                    onClick={() => setCurrentPage("mytrips")}
                    className={`nav-link ${currentPage === "mytrips" ? "nav-link-active" : ""}`}
                  >
                    I miei Viaggi
                  </button>
                  <button
                    onClick={() => setCurrentPage("alltrips")}
                    className={`nav-link ${currentPage === "alltrips" ? "nav-link-active" : ""}`}
                  >
                    Trova viaggi disponibili
                  </button>
                  <button
                    onClick={() => setCurrentPage("create")}
                    className={`nav-link ${currentPage === "create" ? "nav-link-active" : ""}`}
                  >
                    Crea Percorso
                  </button>
                  <button onClick={() => setCurrentPage("qa")} className={`nav-link ${currentPage === "qa" ? "nav-link-active" : ""}`}>
                    Aiuto
                  </button>

                  {user.isAdmin && (
                    <button
                      onClick={() => setCurrentPage("admin")}
                      className={`nav-link ${currentPage === "admin" ? "nav-link-active" : ""}`}
                    >
                      Pannello Admin
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-muted hidden sm:inline">
                  {user.firstName} {user.lastName}
                </span>

                <button onClick={handleLogout} className="btn-ghost hidden md:inline-flex">
                  Sign Out
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-full hover:bg-white/60"
                  aria-label="Apri menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/60 bg-white/70 backdrop-blur-xl">
              <div className="px-4 pt-3 pb-4 space-y-2">
                <button
                  onClick={() => {
                    setCurrentPage("mytrips");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left nav-link ${currentPage === "mytrips" ? "nav-link-active" : ""}`}
                >
                  I miei Viaggi
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("alltrips");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left nav-link ${currentPage === "alltrips" ? "nav-link-active" : ""}`}
                >
                  Trova viaggi disponibili
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("create");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left nav-link ${currentPage === "create" ? "nav-link-active" : ""}`}
                >
                  Crea Percorso
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("qa");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left nav-link ${currentPage === "qa" ? "nav-link-active" : ""}`}
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
                    className={`block w-full text-left nav-link ${currentPage === "admin" ? "nav-link-active" : ""}`}
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
                  className="mt-2 block w-full text-left btn-ghost text-red-600"
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

      {isLoading && currentPage !== "home" && currentPage !== "landing" && currentPage !== "event" ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe6e5a]"></div>
          <p className="mt-2 text-muted">Loading...</p>
        </div>
      ) : (
        <>
          {currentPage === "landing" && !user && (
            <LandingPage
              onLogin={() => setCurrentPage("login")}
              onSignUp={() => setCurrentPage("signup")}
              events={events}
              onEventClick={handleNavigateToEvent}
            />
          )}
          {currentPage === "home" && (
            <HomePage
              onSignUp={() => setCurrentPage("signup")}
              onLogin={() => setCurrentPage("login")}
              onCreateRoute={() => setCurrentPage("create")}
              onLearnMore={() => setCurrentPage("qa")}
              isLoggedIn={!!user}
            />
          )}
          {currentPage === "signup" && <SignUpPage onSignUp={handleSignUp} onBack={() => setCurrentPage("landing")} />}
          {currentPage === "login" && <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage("landing")} />}
          {currentPage === "mytrips" && user && (
            <MyTripsPage
              trips={user.isAdmin ? allTrips : userTrips}
              onCreateTrip={() => setCurrentPage("create")}
              onDeleteTrip={handleDeleteTrip}
            />
          )}
          {currentPage === "alltrips" && <AllTripsPage trips={allTrips} user={user} />}
          {currentPage === "create" && user && <CreateTripFlow onComplete={handleCreateTrip} onCancel={() => setCurrentPage("mytrips")} />}
          {currentPage === "admin" && user?.isAdmin && (
            <AdminPage
              trips={allTrips}
              matches={matches}
              onCreateMatch={handleCreateMatch}
              onArchiveMatch={handleArchiveMatch}
              onDeleteMatch={handleDeleteMatch}
              onDeleteTrip={handleDeleteTrip}
              events={events}
              onCreateEvent={handleCreateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {currentPage === "event" && selectedEventSlug && (
            <EventPage
              slug={selectedEventSlug}
              onBack={() => {
                setCurrentPage("landing");
                window.history.pushState({}, "", "/");
              }}
            />
          )}

          {currentPage === "qa" && <QAPage onBack={() => setCurrentPage(user ? "home" : "landing")} />}
        </>
      )}
    </div>
  );
}
