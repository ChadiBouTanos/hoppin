import { useMemo, useState } from "react";
import { Trip, User } from "../types";
import { MapPin, Calendar, Clock, Search, Filter, Repeat, Users, MessageCircle } from "lucide-react";
import { api } from "../services/api";

type UserTripsPageProps = {
  trips: Trip[];
  user: User;
};

type RoleFilter = "all" | "driver" | "passenger" | "both";

export function AllTripsPage({ trips, user }: UserTripsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");

  const filteredTrips = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return trips.filter((trip) => {
      const matchesSearch =
        trip.departureLocation.toLowerCase().includes(term) || trip.arrivalLocation.toLowerCase().includes(term) || trip.userName.toLowerCase().includes(term);

      const matchesRole = filterRole === "all" || trip.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [trips, searchTerm, filterRole]);

  const getRoleLabel = (role: string) => {
    if (role === "driver") return "Conducente";
    if (role === "passenger") return "Passeggero";
    return "Entrambi";
  };

  const getRecurrenceLabel = (trip: Trip) => {
    if (trip.recurrence === "once") return "Una volta";
    if (trip.recurrence === "weekly") return "Settimanale";
    if (trip.recurrence === "custom" && trip.recurringDays) {
      return trip.recurringDays.map((d) => d.slice(0, 3)).join(", ");
    }
    return "Una volta";
  };

  const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

  const notifyAdmin = async (trip: Trip) => {
    await api.notifyShare(
      trip.id,
      user.firstName + " " + user.lastName,
      user.phone,
      trip.userName,
      trip.userPhone,
      trip.departureLocation,
      trip.arrivalLocation,
      trip.date,
      trip.arrivalTime,
      user.token
    );
  };

  const handleWhatsappContact = (trip: Trip) => {
    if (!trip.userPhone) return;

    notifyAdmin(trip);

    const phone = normalizePhone(trip.userPhone);
    const message =
      `Ciao ${trip.userName}! Sono interessato a questo viaggio:%0A` +
      `${trip.departureLocation} → ${trip.arrivalLocation}%0A` +
      `Data: ${new Date(trip.date).toLocaleDateString("it-IT")} ${trip.arrivalTime}`;

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Viaggi disponibili</h1>
        </div>

        {/* Ricerca & Filtro */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca per nome o località..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterRole}
                name="roleFilter"
                onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="all">Tutti i ruoli</option>
                <option value="driver">Conducente</option>
                <option value="passenger">Passeggero</option>
                <option value="both">Entrambi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista viaggi */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{trip.userName}</p>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-gray-100 text-gray-700">{getRoleLabel(trip.role)}</span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{trip.departureLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{trip.arrivalLocation}</span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(trip.date).toLocaleDateString("it-IT")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{trip.arrivalTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-gray-400" />
                    <span>{getRecurrenceLabel(trip)}</span>
                  </div>
                </div>

                {trip.availableSeats && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Posti disponibili: {trip.availableSeats}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleWhatsappContact(trip)}
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl contact-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4" />
                Contatta su WhatsApp
              </button>
            </div>
          ))}
        </div>

        {filteredTrips.length === 0 && <div className="text-center py-10 text-gray-500">Nessun viaggio trovato.</div>}
      </div>
    </div>
  );
}
