import { useState } from "react";
import { Trip } from "../types";
import { Car, Users, MapPin, Calendar, Clock, Search, Filter, Mail, Phone, Repeat, X } from "lucide-react";

type AdminPageProps = {
  trips: Trip[];
  onToggleMatched: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
};

type RoleFilter = "all" | "driver" | "passenger" | "both";
type SortBy = "datetime" | "arrival" | "departure";

export function AdminPage({ trips, onToggleMatched, onDeleteTrip }: AdminPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("datetime");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showMatchCandidates, setShowMatchCandidates] = useState(false);

  const getRoleIcon = (role: string) => {
    if (role === "driver") return <Car className="w-4 h-4" />;
    if (role === "passenger") return <Users className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === "driver") return "Conducente";
    if (role === "passenger") return "Passeggero";
    return "Entrambi";
  };

  const getRoleColor = (role: string) => {
    if (role === "driver") return "bg-green-100 text-green-700";
    if (role === "passenger") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-700";
  };

  const getRecurrenceLabel = (trip: Trip) => {
    if (trip.recurrence === "once") return "Una volta";
    if (trip.recurrence === "weekly") return "Settimanale";
    if (trip.recurrence === "custom" && trip.recurringDays) {
      return trip.recurringDays.map((d) => d.slice(0, 3)).join(", ");
    }
    return "Una volta";
  };

  const isDriverLike = (trip: Trip) => trip.role === "driver" || trip.role === "both";

  const filteredTrips = trips
    .filter((trip) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        trip.userName.toLowerCase().includes(term) ||
        trip.departureLocation.toLowerCase().includes(term) ||
        trip.arrivalLocation.toLowerCase().includes(term) ||
        trip.userEmail.toLowerCase().includes(term) ||
        trip.userPhone.toLowerCase().includes(term);

      const matchesRole = filterRole === "all" || trip.role === filterRole;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "datetime": {
          const dateTimeA = new Date(`${a.date} ${a.arrivalTime}`).getTime();
          const dateTimeB = new Date(`${b.date} ${b.arrivalTime}`).getTime();
          return dateTimeA - dateTimeB;
        }
        case "arrival":
          return a.arrivalLocation.localeCompare(b.arrivalLocation);
        case "departure":
          return a.departureLocation.localeCompare(b.departureLocation);
        default:
          return 0;
      }
    });

  const unmatchedTrips = filteredTrips.filter((t) => !t.isMatched);
  const matchedTrips = filteredTrips.filter((t) => t.isMatched);

  const matchedGroups = (() => {
    const groups: Record<string, Trip[]> = {};
    for (const trip of matchedTrips) {
      const key = [trip.departureLocation, trip.arrivalLocation, trip.date, trip.arrivalTime].join("|");
      if (!groups[key]) groups[key] = [];
      groups[key].push(trip);
    }
    return Object.entries(groups);
  })();

  const closeDetails = () => {
    setSelectedTrip(null);
    setShowMatchCandidates(false);
  };

  const handleRowClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowMatchCandidates(false);
  };

  const getMatchCandidates = (trip: Trip): Trip[] => {
    const isDriver = isDriverLike(trip);

    return trips.filter((t) => {
      if (t.id === trip.id) return false;
      if (t.isMatched) return false;

      if (isDriver) {
        return t.role === "passenger" || t.role === "both";
      } else {
        const isDriverCandidate = isDriverLike(t);
        if (!isDriverCandidate) return false;
        const seats = t.availableSeats ?? 0;
        return seats > 0;
      }
    });
  };

  const handleStartMatch = () => {
    if (!selectedTrip) return;
    setShowMatchCandidates(true);
  };

  const handlePerformMatch = (candidate: Trip) => {
    if (!selectedTrip) return;
    onToggleMatched(selectedTrip.id);
    onToggleMatched(candidate.id);
    closeDetails();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Pannello Amministratore</h1>
            <p className="text-gray-600 text-sm">Gestisci tutti i viaggi, visualizza i dettagli e abbina i percorsi.</p>
          </div>

          {/* Filtro & Ricerca */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca per nome, località, email o telefono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
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
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="datetime">Ordina per Data e Ora</option>
                  <option value="arrival">Ordina per Località di Arrivo</option>
                  <option value="departure">Ordina per Località di Partenza</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-gray-600 mb-1">Viaggi Totali</p>
              <p className="text-primary text-xl font-semibold">{trips.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-gray-600 mb-1">Conducenti</p>
              <p className="text-green-600 text-xl font-semibold">{trips.filter((t) => t.role === "driver" || t.role === "both").length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-gray-600 mb-1">Passeggeri</p>
              <p className="text-purple-600 text-xl font-semibold">{trips.filter((t) => t.role === "passenger" || t.role === "both").length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <p className="text-gray-600 mb-1">Abbinati</p>
              <p className="text-gray-900 text-xl font-semibold">{trips.filter((t) => t.isMatched).length}</p>
            </div>
          </div>

          {/* Sezione: Da abbinare */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Viaggi da abbinare</h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700">Utente</th>
                      <th className="px-6 py-4 text-left text-gray-700">Ruolo</th>
                      <th className="px-6 py-4 text-left text-gray-700">Percorso</th>
                      <th className="px-6 py-4 text-left text-gray-700">Data & Ora</th>
                      <th className="px-6 py-4 text-left text-gray-700">Ricorrenza</th>
                      <th className="px-6 py-4 text-left text-gray-700">Posti disp.</th>
                      <th className="px-6 py-4 text-left text-gray-700">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {unmatchedTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(trip)}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-gray-900 font-medium">{trip.userName}</p>
                            <p className="text-gray-500 text-[11px]">ID utente: {trip.userId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getRoleColor(trip.role)}`}>
                            {getRoleIcon(trip.role)}
                            <span>{getRoleLabel(trip.role)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-900">{trip.departureLocation}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-gray-900">{trip.arrivalLocation}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{new Date(trip.date).toLocaleDateString("it-IT")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{trip.arrivalTime}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          <div className="flex items-center gap-2">
                            <Repeat className="w-4 h-4 text-gray-400" />
                            <span>{getRecurrenceLabel(trip)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{isDriverLike(trip) ? trip.availableSeats ?? "—" : "N/A"}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(trip);
                            }}
                            className="px-3 py-1-5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            Dettagli
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Sei sicuro di voler cancellare questo viaggio?")) {
                                onDeleteTrip(trip.id);
                              }
                            }}
                            className="px-3 py-1-5 text-xs rounded-lg border transition-colors delete-trip-button"
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {unmatchedTrips.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Nessun viaggio da abbinare trovato.</p>
                </div>
              )}
            </div>
          </section>

          {/* Sezione: Già abbinati */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Viaggi già abbinati</h2>
            </div>

            {matchedGroups.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Non ci sono ancora viaggi abbinati.</p>
              </div>
            )}

            <div className="space-y-4 flex flex-col gap-4">
              {matchedGroups.map(([groupKey, groupTrips]) => {
                const sample = groupTrips[0];
                return (
                  <div key={groupKey} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Percorso</p>
                        <p className="text-gray-900 font-medium text-sm">
                          {sample.departureLocation} → {sample.arrivalLocation}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(sample.date).toLocaleDateString("it-IT")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{sample.arrivalTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {groupTrips.map((trip) => (
                        <div key={trip.id} className="flex items-center justify-between flex-wrap gap-3 rounded-xl border border-gray-100 px-3 py-2 hover:bg-gray-50">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{trip.userName}</span>
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] ${getRoleColor(trip.role)}`}>
                                {getRoleIcon(trip.role)}
                                <span>{getRoleLabel(trip.role)}</span>
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                              <span>{trip.userEmail}</span>
                              <span>•</span>
                              <span>{trip.userPhone}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleMatched(trip.id)}
                            className="text-[11px] px-3 py-2 rounded-md border border-gray-300 delete-trip-button"
                          >
                            Elimina Abbinamento
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Dialog Dettagli Viaggio - fuori dal contenitore per essere davvero overlay */}
      {selectedTrip && (
        <div className="admin-detail-dialog inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
              <div className="flex flex-col gap-2">
                <p className="text-xl uppercase tracking-wide ">Dettagli viaggio</p>
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  {selectedTrip.userName}
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] ${getRoleColor(selectedTrip.role)}`}>
                    {getRoleIcon(selectedTrip.role)}
                    <span>{getRoleLabel(selectedTrip.role)}</span>
                  </span>
                </h3>
              </div>
              <button type="button" onClick={closeDetails} className="py-2 px-3 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Percorso */}
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-gray-800">Percorso</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex flex-col gap-2">
                      <p className="line-h-1 text-gray-500 uppercase">Partenza</p>
                      <p className="line-h-1 text-gray-900">{selectedTrip.departureLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex flex-col gap-2">
                      <p className="line-h-1 text-gray-500 uppercase">Arrivo</p>
                      <p className="line-h-1 text-gray-900">{selectedTrip.arrivalLocation}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{new Date(selectedTrip.date).toLocaleDateString("it-IT")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedTrip.arrivalTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{getRecurrenceLabel(selectedTrip)}</span>
                    </div>
                    {isDriverLike(selectedTrip) && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">Posti disponibili: {selectedTrip.availableSeats ?? "—"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contatto & regole */}
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-gray-800">Contatto</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedTrip.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedTrip.userPhone}</span>
                    </div>
                  </div>

                  {isDriverLike(selectedTrip) && selectedTrip.rules && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-gray-800 mb-1">Regole aggiuntive</h4>
                      <p className="text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3">{selectedTrip.rules}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-[11px] text-gray-500">Creato il {new Date(selectedTrip.createdAt).toLocaleString("it-IT")}</p>
                    <p className="text-[11px] text-gray-500">
                      Stato: <span className="font-medium">{selectedTrip.isMatched ? "Abbinato" : "Da abbinare"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Azioni abbinamento */}
              {!selectedTrip.isMatched && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-end mb-4">
                    <button
                      type="button"
                      onClick={handleStartMatch}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-blue-700 cursor-pointer"
                    >
                      Avvia abbinamento
                    </button>
                  </div>

                  {showMatchCandidates && (
                    <div className="mt-2 space-y-3">
                      <p className="text-[11px] text-gray-500">
                        Seleziona il viaggio da abbinare a <span className="font-semibold">{selectedTrip.userName}</span>.
                      </p>
                      <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl">
                        {getMatchCandidates(selectedTrip).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500">Nessun candidato compatibile trovato.</div>
                        )}

                        {getMatchCandidates(selectedTrip).map((candidate) => {
                          const seats = candidate.availableSeats ?? 0;
                          const candidateIsDriver = isDriverLike(candidate);
                          const disableForPassenger = !isDriverLike(selectedTrip) && candidateIsDriver && seats <= 0;

                          return (
                            <div key={candidate.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{candidate.userName}</span>
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleColor(candidate.role)}`}>
                                    {getRoleIcon(candidate.role)}
                                    <span>{getRoleLabel(candidate.role)}</span>
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                                  <span>
                                    {candidate.departureLocation} → {candidate.arrivalLocation}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {new Date(candidate.date).toLocaleDateString("it-IT")} {candidate.arrivalTime}
                                  </span>
                                  {candidateIsDriver && (
                                    <>
                                      <span>•</span>
                                      <span>Posti: {candidate.availableSeats ?? "—"}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={disableForPassenger}
                                onClick={() => handlePerformMatch(candidate)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                                  disableForPassenger ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-blue-700"
                                }`}
                              >
                                Abbina
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTrip.isMatched && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[11px] text-gray-500 mb-2">Questo viaggio è già segnato come abbinato. Puoi riportarlo a “non abbinato” se necessario.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMatched(selectedTrip.id);
                      closeDetails();
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Segna come non abbinato
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
