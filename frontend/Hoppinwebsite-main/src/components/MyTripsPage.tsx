import { Trip } from "../types";
import { Car, Users, MapPin, Calendar, Clock, Plus, Repeat } from "lucide-react";

type MyTripsPageProps = {
  trips: Trip[];
  onCreateTrip: () => void;
  onDeleteTrip: (tripId: string) => void;
};

export function MyTripsPage({ trips, onCreateTrip, onDeleteTrip }: MyTripsPageProps) {
  const getRoleIcon = (role: string) => {
    if (role === "driver") return <Car className="w-5 h-5" />;
    if (role === "passenger") return <Users className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === "driver") return "Conducente";
    if (role === "passenger") return "Passeggero";
    return "Conducente / Passeggero";
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

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2">I Miei Viaggi</h1>
            <p className="text-muted">Gestisci e visualizza i tuoi viaggi pubblicati</p>
          </div>
          <button
            onClick={onCreateTrip}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Nuovo Viaggio
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 text-center">
            <div className="glass-soft w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-muted" />
            </div>
            <h2 className="mb-2">Nessun Viaggio Ancora</h2>
            <p className="text-muted mb-6">Non hai ancora pubblicato viaggi. Crea il tuo primo viaggio per iniziare.</p>
            <button onClick={onCreateTrip} className="btn-primary w-full sm:w-auto">
              Crea il Mio Primo Viaggio
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getRoleColor(trip.role)}`}>
                      {getRoleIcon(trip.role)}
                      <span>{getRoleLabel(trip.role)}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/70 text-muted flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      <span className="text-sm">{getRecurrenceLabel(trip)}</span>
                    </div>
                    {trip.isMatched && (
                      <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <span className="text-sm">Abbinato</span>
                      </div>
                    )}
                  </div>
                  <span className="text-muted">Pubblicato il {new Date(trip.createdAt).toLocaleDateString("it-IT")}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-muted mt-1" />
                      <div>
                        <p className="text-muted">Partenza</p>
                        <p>{trip.departureLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand mt-1" />
                      <div>
                        <p className="text-muted">Arrivo</p>
                        <p>{trip.arrivalLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-muted mt-1" />
                      <div>
                        <p className="text-muted">Data</p>
                        <p>
                          {new Date(trip.date).toLocaleDateString("it-IT", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted mt-1" />
                      <div>
                        <p className="text-muted">Orario di Partenza</p>
                        <p>{trip.arrivalTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={() => onDeleteTrip(trip.id)} className="btn-secondary text-sm text-red-600">
                    Cancella viaggio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
