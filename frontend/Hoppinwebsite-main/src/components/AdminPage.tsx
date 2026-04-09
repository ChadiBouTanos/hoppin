import { useMemo, useState } from "react";
import { Trip, TripMatch, HoppinEvent } from "../types";
import { Car, Users, MapPin, Calendar, Clock, Search, Filter, Mail, Phone, Repeat, X, Archive, Trash2, Link2, Plus, Image, CalendarPlus } from "lucide-react";
import { FLEXIBILITY_OPTIONS } from "./CreateTripFlow";

type AdminPageProps = {
  trips: Trip[];
  matches: TripMatch[];
  onCreateMatch: (driverTripId: string, passengerTripId: string) => void;
  onArchiveMatch: (matchId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  events?: HoppinEvent[];
  onCreateEvent?: (data: { title: string; description: string; imageUrl: string; eventDates?: string[] }) => void;
  onDeleteEvent?: (id: string) => void;
};

type RoleFilter = "all" | "driver" | "passenger" | "both";
type SortBy = "datetime" | "arrival" | "departure";

export function AdminPage({ trips, matches, onCreateMatch, onArchiveMatch, onDeleteMatch, onDeleteTrip, events = [], onCreateEvent, onDeleteEvent }: AdminPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"trips" | "events">("trips");
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventImageUrl, setNewEventImageUrl] = useState("");
  const [newEventDates, setNewEventDates] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("datetime");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showMatchCandidates, setShowMatchCandidates] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState(false);

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

  // Mappa per velocizzare ricerche per id
  const tripMap = useMemo(() => {
    const map = new Map<string, Trip>();
    trips.forEach((t) => map.set(t.id, t));
    return map;
  }, [trips]);

  const activeMatches = matches.filter((m) => !m.isArchived);
  const archivedMatches = matches.filter((m) => m.isArchived);

  // invece di activeMatches, usiamo TUTTI i matches (attivi + archiviati)
  const isTripMatched = (tripId: string) => matches.some((m) => m.driverTripId === tripId || m.passengerTripId === tripId);

  // conteggio passeggeri per driver SOLO sui match attivi
  const driverPassengersCount: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of activeMatches) {
      counts[m.driverTripId] = (counts[m.driverTripId] || 0) + 1;
    }
    return counts;
  }, [activeMatches]);

  const getPassengersCountForDriver = (tripId: string) => driverPassengersCount[tripId] || 0;

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

  // viaggi NON ancora coinvolti in nessun match (attivo o archiviato)
  const unmatchedTrips = filteredTrips.filter((t) => !isTripMatched(t.id));

  // 🔹 Abbinamenti attivi raggruppati per CONDUCENTE
  const activeMatchGroups = useMemo(() => {
    type Group = {
      driver: Trip;
      items: { match: TripMatch; passenger: Trip }[];
    };
    const byDriver = new Map<string, Group>();

    for (const m of activeMatches) {
      const driver = tripMap.get(m.driverTripId);
      const passenger = tripMap.get(m.passengerTripId);
      if (!driver || !passenger) continue;

      const existing = byDriver.get(driver.id) || { driver, items: [] };
      existing.items.push({ match: m, passenger });
      byDriver.set(driver.id, existing);
    }

    return Array.from(byDriver.values());
  }, [activeMatches, tripMap]);

  // Abbinamenti archiviati (mostrati uno per riga come prima)
  const archivedMatchCards = archivedMatches
    .map((m) => {
      const driver = tripMap.get(m.driverTripId);
      const passenger = tripMap.get(m.passengerTripId);
      if (!driver || !passenger) return null;
      return { match: m, driver, passenger };
    })
    .filter(Boolean) as {
    match: TripMatch;
    driver: Trip;
    passenger: Trip;
  }[];

  const closeDetails = () => {
    setSelectedTrip(null);
    setShowMatchCandidates(false);
    setShowAllCandidates(false);
  };

  const handleRowClick = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowMatchCandidates(false);
    setShowAllCandidates(false);
  };

  // Helpers per candidati abbinamento
  const getAllCandidates = (trip: Trip): Trip[] => {
    const isDriver = isDriverLike(trip);

    return trips.filter((candidate) => {
      if (candidate.id === trip.id) return false;

      // Se il selezionato è driver → cerchiamo passeggeri non ancora abbinati
      if (isDriver) {
        const candidateIsPassenger = candidate.role === "passenger" || candidate.role === "both";
        if (!candidateIsPassenger) return false;

        // passeggero può essere abbinato ad un solo driver (attivo o archiviato)
        const alreadyMatchedAsPassenger = matches.some((m) => m.passengerTripId === candidate.id);
        if (alreadyMatchedAsPassenger) return false;

        return true;
      }

      // Se il selezionato è passeggero → cerchiamo driver con posti liberi
      const candidateIsDriver = isDriverLike(candidate);
      if (!candidateIsDriver) return false;

      const totalSeats = candidate.availableSeats ?? 0;
      const usedSeats = getPassengersCountForDriver(candidate.id);
      if (totalSeats <= usedSeats) return false;

      return true;
    });
  };

  const getSuggestedReason = (trip: Trip, candidate: Trip): string | null => {
    if (trip.date === candidate.date) {
      return `Stessa data (${new Date(trip.date).toLocaleDateString("it-IT")})`;
    }
    return null;
  };

  const getSuggestedCandidates = (trip: Trip): { trip: Trip; reason: string }[] => {
    const all = getAllCandidates(trip);
    return all
      .map((c) => {
        const reason = getSuggestedReason(trip, c);
        return reason ? { trip: c, reason } : null;
      })
      .filter(Boolean) as { trip: Trip; reason: string }[];
  };

  const handleStartMatch = () => {
    if (!selectedTrip) return;
    setShowMatchCandidates(true);
    setShowAllCandidates(false);
  };

  const handlePerformMatch = (selected: Trip, candidate: Trip) => {
    const selectedIsDriver = isDriverLike(selected);

    if (selectedIsDriver) {
      onCreateMatch(selected.id, candidate.id);
    } else {
      onCreateMatch(candidate.id, selected.id);
    }

    closeDetails();
  };

  return (
    <>
      <div className="min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Pannello Amministratore</h1>
            <p className="text-muted text-sm">Gestisci tutti i viaggi, gli eventi e gli abbinamenti.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("trips")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "trips" ? "bg-[#fe6e5a] text-white" : "glass-soft text-[#6f5a52] hover:bg-white/80"
              }`}
            >
              Viaggi & Abbinamenti
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === "events" ? "bg-[#fe6e5a] text-white" : "glass-soft text-[#6f5a52] hover:bg-white/80"
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              Gestione Eventi
              {events.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "events" ? "bg-white/30 text-white" : "bg-[#fe6e5a]/10 text-[#fe6e5a]"
                }`}>{events.length}</span>
              )}
            </button>
          </div>

          {/* ═══════════ EVENTS TAB ═══════════ */}
          {activeTab === "events" && (
            <div>
              {/* Create Event Form */}
              <div className="glass-panel p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Eventi</h2>
                  <button
                    onClick={() => setShowEventForm(!showEventForm)}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nuovo Evento
                  </button>
                </div>

                {showEventForm && (
                  <div className="glass-card p-6 mb-6 space-y-4">
                    <h3 className="font-semibold text-sm text-[#6f5a52] uppercase tracking-wider">Crea Nuovo Evento</h3>
                    <div>
                      <label className="block text-sm text-[#6f5a52] mb-1">Titolo *</label>
                      <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="es. Festival della Musica 2026"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#6f5a52] mb-1">Descrizione</label>
                      <textarea
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder="Descrivi l'evento: dove si svolge, quando, cosa aspettarsi..."
                        rows={4}
                        className="textarea-field resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#6f5a52] mb-1 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        URL Immagine
                      </label>
                      <input
                        type="url"
                        value={newEventImageUrl}
                        onChange={(e) => setNewEventImageUrl(e.target.value)}
                        placeholder="https://esempio.com/immagine-evento.jpg"
                        className="input-field"
                      />
                      {newEventImageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden h-32 bg-gray-100">
                          <img src={newEventImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-[#6f5a52] mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date dell'evento (una per riga)
                      </label>
                      <textarea
                        value={newEventDates}
                        onChange={(e) => setNewEventDates(e.target.value)}
                        placeholder={"2026-05-30\n2026-05-31\n2026-06-01"}
                        rows={3}
                        className="textarea-field resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-[#6f5a52] mt-1">Formato: YYYY-MM-DD, una data per riga. L'utente vedra un menu a tendina.</p>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowEventForm(false);
                          setNewEventTitle("");
                          setNewEventDescription("");
                          setNewEventImageUrl("");
                          setNewEventDates("");
                        }}
                        className="btn-ghost text-sm"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => {
                          if (!newEventTitle.trim()) {
                            alert("Inserisci un titolo per l'evento");
                            return;
                          }
                          const dates = newEventDates
                            .split("\n")
                            .map((d) => d.trim())
                            .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
                          onCreateEvent?.({
                            title: newEventTitle.trim(),
                            description: newEventDescription.trim(),
                            imageUrl: newEventImageUrl.trim(),
                            eventDates: dates.length > 0 ? dates : undefined,
                          });
                          setNewEventTitle("");
                          setNewEventDescription("");
                          setNewEventImageUrl("");
                          setNewEventDates("");
                          setShowEventForm(false);
                        }}
                        className="btn-primary text-sm"
                      >
                        Crea Evento
                      </button>
                    </div>
                  </div>
                )}

                {/* Events list */}
                {events.length === 0 ? (
                  <div className="text-center py-10 text-[#6f5a52]">
                    <CalendarPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nessun evento creato.</p>
                    <p className="text-sm mt-1">Clicca "Nuovo Evento" per crearne uno.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((ev) => (
                      <div key={ev.id} className="glass-card overflow-hidden group">
                        {ev.imageUrl && (
                          <div className="h-36 overflow-hidden">
                            <img
                              src={ev.imageUrl}
                              alt={ev.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#2f231f] truncate">{ev.title}</h3>
                              <p className="text-xs text-[#6f5a52] mt-1 line-clamp-2">{ev.description}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                              ev.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {ev.isActive ? "Attivo" : "Inattivo"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/60">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#6f5a52]">/{ev.slug}</span>
                              {ev.registrationCount !== undefined && ev.registrationCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#fe6e5a]/10 text-[#fe6e5a] font-bold">
                                  {ev.registrationCount} iscritti
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (window.confirm(`Eliminare l'evento "${ev.title}"?`)) {
                                  onDeleteEvent?.(ev.id);
                                }
                              }}
                              className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"
                              title="Elimina evento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ TRIPS TAB ═══════════ */}
          {activeTab === "trips" && (
          <>
          {/* Filtro & Ricerca */}
          <div className="glass-panel p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 input-icon text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca per nome, città, email o telefono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 input-icon text-muted w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
                  className="select-field pl-10 appearance-none"
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
                  className="select-field appearance-none"
                >
                  <option value="datetime">Ordina per Data e Ora</option>
                  <option value="arrival">Ordina per Città di Arrivo</option>
                  <option value="departure">Ordina per Città di Partenza</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4">
              <p className="text-muted mb-1">Viaggi Totali</p>
              <p className="text-brand text-xl font-semibold">{trips.length}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-muted mb-1">Conducenti</p>
              <p className="text-emerald-600 text-xl font-semibold">{trips.filter((t) => t.role === "driver" || t.role === "both").length}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-muted mb-1">Passeggeri</p>
              <p className="text-purple-600 text-xl font-semibold">{trips.filter((t) => t.role === "passenger" || t.role === "both").length}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-muted mb-1">Abbinamenti attivi</p>
              <p className="text-xl font-semibold">{activeMatches.length}</p>
            </div>
          </div>

          {/* Sezione: Da abbinare */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Viaggi da abbinare</h2>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700">Utente</th>
                      <th className="px-6 py-4 text-left text-gray-700">Ruolo</th>
                      <th className="px-6 py-4 text-left text-gray-700">Percorso</th>
                      <th className="px-6 py-4 text-left text-gray-700">Data &amp; Ora</th>
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
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleColor(trip.role)}`}>
                            {getRoleIcon(trip.role)}
                            <span>{getRoleLabel(trip.role)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
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
                            className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            Abbina
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Sei sicuro di voler cancellare questo viaggio?")) {
                                onDeleteTrip(trip.id);
                              }
                            }}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer delete-trip-btn inline-flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  <p className="text-gray-500 mt-3 mb-3">Nessun viaggio da abbinare trovato.</p>
                </div>
              )}
            </div>
          </section>

          {/* Sezione: Abbinamenti attivi (raggruppati per driver) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Abbinamenti attivi</h2>
            </div>

            {activeMatchGroups.length === 0 && (
              <div className="glass-card p-4">
                <p className="text-muted">Non ci sono ancora abbinamenti attivi.</p>
              </div>
            )}

            <div className="space-y-4 max-h-6xl overflow-y-auto">
              {activeMatchGroups.map(({ driver, items }) => {
                const totalSeats = driver.availableSeats ?? 0;
                const usedSeats = items.length;
                const remainingSeats = totalSeats > 0 ? Math.max(totalSeats - usedSeats, 0) : null;

                return (
                  <div key={driver.id} className="glass-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-gray-900">
                          {driver.departureLocation} → {driver.arrivalLocation}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(driver.date).toLocaleDateString("it-IT")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{driver.arrivalTime}</span>
                        </div>
                        {totalSeats > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>
                              {usedSeats}/{totalSeats} passeggeri
                              {remainingSeats === 0 && " (pieno)"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Driver info */}
                    <div className="flex flex-col gap-2 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/60 mb-3">
                      <p className="text-gray-500">Conducente</p>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{driver.userName}</span>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleColor(driver.role)}`}>
                              {getRoleIcon(driver.role)}
                              <span>{getRoleLabel(driver.role)}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-gray-500 mt-1">
                            <span>{driver.userEmail}</span>
                            {driver.userPhone && (
                              <>
                                <span>•</span>
                                <span>{driver.userPhone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lista passeggeri per questo driver */}
                    <div className="space-y-2">
                      {items.map(({ match, passenger }) => (
                        <div key={match.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-3 py-2">
                          <div>
                            <p className="text-[11px] text-gray-500 mb-1">Passeggero</p>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{passenger.userName}</span>
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] ${getRoleColor(passenger.role)}`}>
                                {getRoleIcon(passenger.role)}
                                <span>{getRoleLabel(passenger.role)}</span>
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-1">
                              <span>{passenger.userEmail}</span>
                              {passenger.userPhone && (
                                <>
                                  <span>•</span>
                                  <span>{passenger.userPhone}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 items-end">
                            <button
                              type="button"
                              onClick={() => onArchiveMatch(match.id)}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Archive className="w-3 h-3" />
                              Archivia
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Sei sicuro di voler eliminare questo abbinamento?")) {
                                  onDeleteMatch(match.id);
                                }
                              }}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border delete-trip-btn cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Elimina abbinamento
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sezione: Abbinamenti archiviati */}
          {archivedMatchCards.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Abbinamenti archiviati</h2>
              </div>

              <div className="space-y-4">
                {archivedMatchCards.map(({ match, driver, passenger }) => (
                  <div key={match.id} className="glass-card p-4 opacity-90">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-800">
                          {driver.departureLocation} → {driver.arrivalLocation}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">Archiviato il {new Date(match.createdAt).toLocaleDateString("it-IT")}</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-800">
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Conducente</p>
                        <p className="font-medium">{driver.userName}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Passeggero</p>
                        <p className="font-medium">{passenger.userName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          </>
          )}
        </div>
      </div>

      {/* Dialog Dettagli Viaggio - overlay */}
      {selectedTrip && (
        <div className="admin-detail-dialog inset-0 z-50 flex items-center justify-center">
          <div className="glass-panel max-w-3xl w-full mx-4">
            <div className="flex items-center justify-between border-b border-white/60 px-6 py-3">
              <div className="flex flex-col gap-3">
                <p className="text-xl tracking-wide ">Dettagli viaggio</p>
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  {selectedTrip.userName}
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleColor(selectedTrip.role)}`}>
                    {getRoleIcon(selectedTrip.role)}
                    <span>{getRoleLabel(selectedTrip.role)}</span>
                  </span>
                </h3>
              </div>
              <button type="button" onClick={closeDetails} className="py-2 px-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-6xl overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4 mb-2">
                {/* Percorso */}
                <div className="space-y-3">
                  <h4 className="text-xl font-semibold text-gray-800">Percorso</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex flex-col gap-2">
                      <p className="line-h-1 text-gray-500">Partenza</p>
                      <p className="line-h-1 text-gray-900">{selectedTrip.departureLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex flex-col gap-2">
                      <p className="line-h-1 text-gray-500">Arrivo</p>
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
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col gap-2">
                        <p className="line-h-1 text-gray-500">Flessibilità Prima dell&apos;orario</p>
                        <p className="line-h-1 text-gray-900">{FLEXIBILITY_OPTIONS.find((opt) => opt.value === selectedTrip.flexibilityBefore)?.label}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col gap-2">
                        <p className="line-h-1 text-gray-500">Flessibilità Dopo l&apos;orario</p>
                        <p className="line-h-1 text-gray-900">{FLEXIBILITY_OPTIONS.find((opt) => opt.value === selectedTrip.flexibilityAfter)?.label}</p>
                      </div>
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
                      Stato: <span className="font-medium">{isTripMatched(selectedTrip.id) ? "Abbinato" : "Da abbinare"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Azioni abbinamento */}
              {!isTripMatched(selectedTrip.id) && (
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
                    <div className="mt-2 space-y-4">
                      {/* Abbinamenti consigliati */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">Abbinamenti consigliati</h5>
                        </div>

                        {(() => {
                          const suggested = getSuggestedCandidates(selectedTrip);
                          if (suggested.length === 0) {
                            return (
                              <div className="px-4 py-3 text-sm text-gray-500 border border-gray-100 rounded-xl">
                                Nessun abbinamento consigliato trovato sulla base della data. Puoi comunque vedere tutti i possibili abbinamenti.
                              </div>
                            );
                          }

                          return (
                            <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl mb-4">
                              {suggested.map(({ trip: candidate, reason }) => (
                                <div key={candidate.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{candidate.userName}</span>
                                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] ${getRoleColor(candidate.role)}`}>
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
                                      {isDriverLike(candidate) && (
                                        <>
                                          <span>•</span>
                                          <span>Posti: {candidate.availableSeats ?? "—"}</span>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-green-700">{reason}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handlePerformMatch(selectedTrip, candidate)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer bg-primary text-white hover:bg-blue-700"
                                  >
                                    Abbina
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Pulsante per vedere tutti i possibili abbinamenti */}
                      <div className="flex items-center justify-end border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAllCandidates((v) => !v)}
                          className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          {showAllCandidates ? "Nascondi tutti gli abbinamenti" : "Mostra tutti i possibili abbinamenti"}
                        </button>
                      </div>

                      {/* Tutti i possibili abbinamenti */}
                      {showAllCandidates && (
                        <div className="mt-1">
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">Tutti i possibili abbinamenti</h5>
                          <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl">
                            {(() => {
                              const all = getAllCandidates(selectedTrip);
                              if (all.length === 0) {
                                return <div className="px-4 py-3 text-sm text-gray-500">Nessun candidato compatibile trovato.</div>;
                              }

                              return all.map((candidate) => {
                                const totalSeats = candidate.availableSeats ?? 0;
                                const usedSeats = getPassengersCountForDriver(candidate.id);
                                const remainingSeats = totalSeats > 0 ? Math.max(totalSeats - usedSeats, 0) : null;
                                const candidateIsDriver = isDriverLike(candidate);
                                return (
                                  <div key={candidate.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{candidate.userName}</span>
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] ${getRoleColor(candidate.role)}`}>
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
                                            <span>
                                              Posti: {usedSeats}/{totalSeats || "—"}
                                              {totalSeats > 0 && remainingSeats === 0 && " (pieno)"}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handlePerformMatch(selectedTrip, candidate)}
                                      className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer bg-primary text-white hover:bg-blue-700"
                                    >
                                      Abbina
                                    </button>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Informazioni se già abbinato */}
              {isTripMatched(selectedTrip.id) && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[11px] text-gray-500">
                    Questo viaggio fa parte di almeno un abbinamento. Gestisci gli abbinamenti dalla sezione &quot;Abbinamenti attivi&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
