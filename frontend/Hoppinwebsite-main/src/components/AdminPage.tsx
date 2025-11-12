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
    if (role === 'driver') return 'Conducente';
    if (role === 'passenger') return 'Passeggero';
    return 'Entrambi';
  };

  const getRoleColor = (role: string) => {
    if (role === 'driver') return 'bg-green-100 text-green-700';
    if (role === 'passenger') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getRecurrenceLabel = (trip: Trip) => {
    if (trip.recurrence === 'once') return 'Una volta';
    if (trip.recurrence === 'weekly') return 'Settimanale';
    if (trip.recurrence === 'custom' && trip.recurringDays) {
      return trip.recurringDays.map(d => d.slice(0, 3)).join(', ');
    }
    return 'Una volta';
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
          <h1 className="mb-2 text-gray-900">Pannello Amministratore</h1>
          <p className="text-gray-600">
            Gestisci tutti i viaggi e abbina i percorsi
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca per nome, località, email o telefono..."
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
                <option value="all">Tutti i Ruoli</option>
                <option value="driver">Solo Conducenti</option>
                <option value="passenger">Solo Passeggeri</option>
                <option value="both">Entrambi</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="datetime">Ordina per Data e Ora</option>
                <option value="arrival">Ordina per Località di Arrivo</option>
                <option value="departure">Ordina per Località di Partenza</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Viaggi Totali</p>
            <p className="text-primary">{trips.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Conducenti</p>
            <p className="text-green-600">
              {trips.filter(t => t.role === 'driver' || t.role === 'both').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Passeggeri</p>
            <p className="text-purple-600">
              {trips.filter(t => t.role === 'passenger' || t.role === 'both').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-1">Abbinati</p>
            <p className="text-gray-900">{trips.filter(t => t.isMatched).length}</p>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Utente</th>
                  <th className="px-6 py-4 text-left text-gray-700">Contatto</th>
                  <th className="px-6 py-4 text-left text-gray-700">Ruolo</th>
                  <th className="px-6 py-4 text-left text-gray-700">Partenza</th>
                  <th className="px-6 py-4 text-left text-gray-700">Arrivo</th>
                  <th className="px-6 py-4 text-left text-gray-700">Data e Ora</th>
                  <th className="px-6 py-4 text-left text-gray-700">Ricorrenza</th>
                  <th className="px-6 py-4 text-left text-gray-700">Abbinato</th>
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
                            {new Date(trip.date).toLocaleDateString('it-IT')}
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
                        <span className="text-sm text-gray-600">Abbinato</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nessun viaggio trovato</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}