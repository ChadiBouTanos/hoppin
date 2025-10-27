import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { SignUpPage } from './components/SignUpPage';
import { LoginPage } from './components/LoginPage';
import { MyTripsPage } from './components/MyTripsPage';
import { CreateTripFlow } from './components/CreateTripFlow';
import { AdminPage } from './components/AdminPage';
import { QAPage } from './components/QAPage';
import { User, Trip } from './types';
import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'signup' | 'login' | 'mytrips' | 'create' | 'admin' | 'qa'>('home');
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('hoppin_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          console.error('Failed to fetch trips:', err);
          setError(err.message);
          setTrips([]); // Set empty array on error
          
          // If token is invalid, log out user
          if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
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
    localStorage.setItem('hoppin_user', JSON.stringify(userData));
    setCurrentPage(userData.isAdmin ? 'admin' : 'home');
  };

  const handleSignUp = async (userData: Omit<User, 'id' | 'isAdmin' | 'token'> & { password: string }) => {
    setError(null);
    setIsLoading(true);
    console.log('SignUp data being sent:', userData); // Debug log
    try {
      const newUser = await api.signUp(userData);
      handleUserSession(newUser);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up');
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
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTrips([]);
    localStorage.removeItem('hoppin_user');
    setCurrentPage('home');
  };

  const handleCreateTrip = async (tripData: Omit<Trip, 'id' | 'userId' | 'userName' | 'userEmail' | 'userPhone' | 'createdAt' | 'isMatched'>) => {
    if (!user?.token) {
      setError("You must be logged in to create a trip.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const newTrip = await api.createTrip(tripData, user.token);
      setTrips(prevTrips => [...prevTrips, newTrip]);
      setCurrentPage('mytrips');
    } catch (err: any) {
      console.error('Create trip error:', err);
      setError(err.message || 'Failed to create trip');
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
      setTrips(prevTrips => prevTrips.map(trip => 
        trip.id === tripId ? updatedTrip : trip
      ));
    } catch (err: any) {
      console.error('Toggle matched error:', err);
      setError(err.message || 'Failed to update trip');
    }
  };

  const getUserTrips = () => {
    if (!user) return [];
    // Ensure trips is always an array
    const tripsArray = Array.isArray(trips) ? trips : [];
    // If admin, show all trips; otherwise filter by user
    return user.isAdmin ? tripsArray : tripsArray.filter(trip => trip.userId === user.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="text-primary font-bold text-lg"
                >
                  Hoppin
                </button>
                {!user.isAdmin && (
                  <div className="flex gap-4">
                    <button onClick={() => setCurrentPage('mytrips')} className={`px-3 py-2 rounded-md ${currentPage === 'mytrips' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>My Trips</button>
                    <button onClick={() => setCurrentPage('create')} className={`px-3 py-2 rounded-md ${currentPage === 'create' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>Create Route</button>
                    <button onClick={() => setCurrentPage('qa')} className={`px-3 py-2 rounded-md ${currentPage === 'qa' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>Help</button>
                  </div>
                )}
                {user.isAdmin && (
                  <div className="flex gap-4">
                    <button onClick={() => setCurrentPage('admin')} className={`px-3 py-2 rounded-md ${currentPage === 'admin' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>Admin Panel</button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-700 hidden sm:inline">{user.firstName} {user.lastName}</span>
                <button onClick={handleLogout} className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign Out</button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4 max-w-7xl mx-auto" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
      
      {isLoading && currentPage !== 'home' ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {currentPage === 'home' && <HomePage onSignUp={() => setCurrentPage('signup')} onLogin={() => setCurrentPage('login')} onCreateRoute={() => setCurrentPage('create')} onLearnMore={() => setCurrentPage('qa')} isLoggedIn={!!user} />}
          {currentPage === 'signup' && <SignUpPage onSignUp={handleSignUp} onBack={() => setCurrentPage('home')} />}
          {currentPage === 'login' && <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage('home')} />}
          {currentPage === 'mytrips' && user && <MyTripsPage trips={getUserTrips()} onCreateTrip={() => setCurrentPage('create')} />}
          {currentPage === 'create' && user && <CreateTripFlow onComplete={handleCreateTrip} onCancel={() => setCurrentPage('mytrips')} />}
          {currentPage === 'admin' && user?.isAdmin && <AdminPage trips={trips} onToggleMatched={handleToggleMatched} />}
          {currentPage === 'qa' && <QAPage onBack={() => setCurrentPage(user ? 'home' : 'home')} />}
        </>
      )}
    </div>
  );
}