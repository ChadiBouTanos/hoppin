import { Trip } from '../types';
import { Car, Users, MapPin, Calendar, Clock, Plus, Repeat } from 'lucide-react';

type MyTripsPageProps = {
  trips: Trip[];
  onCreateTrip: () => void;
};

export function MyTripsPage({ trips, onCreateTrip }: MyTripsPageProps) {
  const getRoleIcon = (role: string) => {
    if (role === 'driver') return <Car className="w-5 h-5" />;
    if (role === 'passenger') return <Users className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'driver') return 'Driver';
    if (role === 'passenger') return 'Passenger';
    return 'Driver / Passenger';
  };

  const getRoleColor = (role: string) => {
    if (role === 'driver') return 'bg-green-100 text-green-700';
    if (role === 'passenger') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getRecurrenceLabel = (trip: Trip) => {
    if (trip.recurrence === 'once') return 'One time';
    if (trip.recurrence === 'weekly') return 'Weekly';
    if (trip.recurrence === 'custom' && trip.recurringDays) {
      return trip.recurringDays.map(d => d.slice(0, 3)).join(', ');
    }
    return 'One time';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2 text-gray-900">My Trips</h1>
            <p className="text-gray-600">
              Manage and view your posted trips
            </p>
          </div>
          <button
            onClick={onCreateTrip}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-gray-900">No Trips Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't posted any trips yet. Create your first trip to get started.
            </p>
            <button
              onClick={onCreateTrip}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Create My First Trip
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getRoleColor(trip.role)}`}>
                      {getRoleIcon(trip.role)}
                      <span>{getRoleLabel(trip.role)}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      <span className="text-sm">{getRecurrenceLabel(trip)}</span>
                    </div>
                    {trip.isMatched && (
                      <div className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                        <span className="text-sm">Matched</span>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500">
                    Posted on {new Date(trip.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p className="text-gray-900">{trip.departureLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-gray-500">Arrival</p>
                        <p className="text-gray-900">{trip.arrivalLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="text-gray-900">
                          {new Date(trip.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-gray-500">Arrival Time</p>
                        <p className="text-gray-900">{trip.arrivalTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
