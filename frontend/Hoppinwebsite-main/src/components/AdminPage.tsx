import { useState } from 'react';
import { Trip } from '../types';
import { Car, Users, MapPin, Calendar, Clock, Search, Filter, Mail, Phone, Repeat } from 'lucide-react';

type AdminPageProps = {
  trips: Trip[];
  onToggleMatched: (tripId: string) => void;
};

export function AdminPage({ trips, onToggleMatched }: AdminPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'driver' | 'passenger' | 'both'>('all');
  const [sortBy, setSortBy] = useState<'datetime' | 'arrival' | 'departure'>('datetime');

  const getRoleIcon = (role: string) => {
    if (role === 'driver') return <Car className="w-4 h-4" />;
    if (role === 'passenger') return <Users className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'driver') return 'Driver';
    if (role === 'passenger') return 'Passenger';
    return 'Both';
  };

  const getRoleColor = (role: string) => {
    if (role === 'driver') return 'bg-green-100 text-green-700';
    if (role === 'passenger') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getRecurrenceLabel = (trip: Trip) => {
    if (trip.recurrence === 'once') return 'Once';
    if (trip.recurrence === 'weekly') return 'Weekly';
    if (trip.recurrence === 'custom' && trip.recurringDays) {
      return trip.recurringDays.map(d => d.slice(0, 3)).join(', ');
    }
    return 'Once';
  };

  const filteredTrips = trips
    .filter(trip => {
      const matchesSearch = 
        trip.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.departureLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.arrivalLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.userPhone.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || trip.role === filterRole;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'datetime':
          const dateTimeA = new Date(a.date + ' ' + a.arrivalTime).getTime();
          const dateTimeB = new Date(b.date + ' ' + b.arrivalTime).getTime();
          return dateTimeA - dateTimeB;
        case 'arrival':
          return a.arrivalLocation.localeCompare(b.arrivalLocation);
        case 'departure':
          return a.departureLocation.localeCompare(b.departureLocation);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">
            Manage all trips and match routes
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, location, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="driver">Drivers Only</option>
                <option value="passenger">Passengers Only</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="datetime">Sort by Date & Time</option>
                <option value="arrival">Sort by Arrival Location</option>
                <option value="departure">Sort by Departure Location</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Total Trips</p>
            <p className="text-primary">{trips.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Drivers</p>
            <p className="text-green-600">
              {trips.filter(t => t.role === 'driver' || t.role === 'both').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Passengers</p>
            <p className="text-purple-600">
              {trips.filter(t => t.role === 'passenger' || t.role === 'both').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Matched</p>
            <p className="text-gray-900">{trips.filter(t => t.isMatched).length}</p>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-gray-700">Departure</th>
                  <th className="px-6 py-4 text-left text-gray-700">Arrival</th>
                  <th className="px-6 py-4 text-left text-gray-700">Date & Time</th>
                  <th className="px-6 py-4 text-left text-gray-700">Recurrence</th>
                  <th className="px-6 py-4 text-left text-gray-700">Matched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{trip.userName}</p>
                        <p className="text-gray-500 text-sm">{trip.userId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{trip.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{trip.userPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleColor(trip.role)}`}>
                        {getRoleIcon(trip.role)}
                        <span>{getRoleLabel(trip.role)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-900">{trip.departureLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-gray-900">{trip.arrivalLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(trip.date).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{trip.arrivalTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{getRecurrenceLabel(trip)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={trip.isMatched}
                          onChange={() => onToggleMatched(trip.id)}
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Matched</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No trips found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
