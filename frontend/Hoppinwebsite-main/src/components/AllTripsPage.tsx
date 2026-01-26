import { useMemo, useState } from "react";
import { Trip, User } from "../types";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  Repeat,
  Users,
  MessageCircle,
  Car,
} from "lucide-react";
import { api } from "../services/api";

type UserTripsPageProps = {
  trips: Trip[];
  user: User;
};

type RoleFilter = "all" | "driver" | "passenger" | "both";

export function AllTripsPage({ trips, user }: UserTripsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDayTrips, setSelectedDayTrips] = useState<Trip[] | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const tripsByDay = useMemo<Record<string, Trip[]>>(() => {
    const map: Record<string, Trip[]> = {};
    trips.forEach((trip) => {
      if (!map[trip.date]) map[trip.date] = [];
      map[trip.date].push(trip);
    });
    return map;
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return trips.filter((trip) => {
      const matchesSearch =
        trip.departureLocation.toLowerCase().includes(term) || trip.arrivalLocation.toLowerCase().includes(term) || trip.userName.toLowerCase().includes(term);

      const matchesRole = filterRole === "all" || trip.role === filterRole;
      return matchesSearch && matchesRole;
    })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.arrivalTime}`);
        const dateB = new Date(`${b.date}T${b.arrivalTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [trips, searchTerm, filterRole]);

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

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    const offset = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const goToPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold mb-1">
            Viaggi disponibili
          </h1>

          <button
            onClick={() => setShowCalendar(true)}
            className="btn-icon"
          >
            <Calendar className="w-6 h-6 text-muted" />
          </button>
        </div>

        {/* Ricerca & Filtro */}
        <div className="glass-panel p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 input-icon text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca per nome o città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 input-icon text-muted w-5 h-5" />
              <select
                value={filterRole}
                name="roleFilter"
                onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
                className="select-field pl-10 appearance-none"
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
            <div
              key={trip.id}
              className="glass-card p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{trip.userName}</p>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getRoleColor(
                      trip.role
                    )}`}
                  >
                    {getRoleIcon(trip.role)}
                    <span>{getRoleLabel(trip.role)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted" />
                    <span>{trip.departureLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand" />
                    <span>{trip.arrivalLocation}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    <span>
                      {new Date(trip.date)
                        .toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        .replace(/^\w/, c => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted" />
                    <span>{trip.arrivalTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-muted" />
                    <span>{getRecurrenceLabel(trip)}</span>
                  </div>
                </div>

                {trip.availableSeats && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted" />
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

        {filteredTrips.length === 0 && (
          <div className="text-center py-10 text-muted">
            Nessun viaggio trovato.
          </div>
        )}
      </div>

      {showCalendar && (
        <div className="calendar-overlay">
          <div className="calendar-modal">

            {/* Header */}
            <div className="calendar-header">
              <button onClick={goToPrevMonth} className="calendar-nav-btn">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              <h2 className="calendar-title">
                {new Date(calendarYear, calendarMonth)
                  .toLocaleDateString("it-IT", { month: "long", year: "numeric" })
                  .replace(/^\w/, c => c.toUpperCase())}
              </h2>

              <button onClick={goToNextMonth} className="calendar-nav-btn">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="calendar-grid-wrapper">
              {/* Giorni della settimana */}
              <div className="calendar-grid" style={{ fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
                <div>Lun</div>
                <div>Mar</div>
                <div>Mer</div>
                <div>Gio</div>
                <div>Ven</div>
                <div>Sab</div>
                <div>Dom</div>
              </div>

              {/* Griglia giorni */}
              <div className="calendar-grid">
                {getCalendarDays(calendarYear, calendarMonth).map((day, index) => {
                  if (!day) {
                    return <div key={index} className="calendar-day-empty"></div>;
                  }

                  const today = new Date();
                  const isToday =
                    day.getFullYear() === today.getFullYear() &&
                    day.getMonth() === today.getMonth() &&
                    day.getDate() === today.getDate();

                  const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                  const dayTrips = tripsByDay[dateKey] || [];

                  return (
                    <div
                      key={index}
                      className={`calendar-day ${isToday ? "today" : ""}`}
                      data-count={dayTrips.length}
                      onClick={() => dayTrips.length > 0 && setSelectedDayTrips(dayTrips)}
                    >
                      <div className="calendar-day-number">{day.getDate()}</div>

                      {dayTrips.slice(0, 3).map((t) => (

                        <div key={t.id} className="calendar-trip">
                          <span>{getRoleIcon(t.role)}</span> {t.departureLocation} → {t.arrivalLocation}
                        </div>
                      ))}

                      {dayTrips.length > 3 && (
                        <div className="calendar-trip" style={{ color: "#2563eb" }}>
                          + altri {dayTrips.length - 3}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: 16 }}>
              <button
                onClick={() => setShowCalendar(false)}
                className="btn-secondary"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDayTrips && (
        <div className="calendar-overlay">
          <div className="detail-modal">
            <div className="detail-container">
              <div className="detail-header">
                <div className="detail-header-icon">📅</div>
                <h2 className="detail-title">
                  {new Date(selectedDayTrips[0].date).toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).replace(/^\w/, c => c.toUpperCase())}
                </h2>
                <button onClick={() => setSelectedDayTrips(null)} className="detail-close-btn">✕</button>
              </div>

              <div>
                {selectedDayTrips.map((trip) => (
                  <div key={trip.id} className="detail-trip">
                    <div className="detail-trip-header">
                      <span className="detail-trip-role">
                        {trip.role === "driver" ? "🚗 Conducente" : "🧍 Passeggero"}
                      </span>
                      <span className="detail-trip-time">⏰ {trip.arrivalTime}</span>
                    </div>

                    <div className="detail-trip-body">
                      <div className="detail-trip-row">
                        <span className="detail-trip-icon">📍</span>
                        <span>{trip.departureLocation}</span>
                      </div>

                      <div className="detail-trip-row">
                        <span className="detail-trip-icon">🏁</span>
                        <span>{trip.arrivalLocation}</span>
                      </div>

                      <div className="detail-trip-row">
                        <span className="detail-trip-icon">👤</span>
                        <span>{trip.userName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
