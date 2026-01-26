import { useState } from "react";
import { ArrowLeft, ArrowRight, Car, Users, MapPin, Calendar, Clock, Repeat } from "lucide-react";
import { CreateTripPayload } from "../App";

type CreateTripFlowProps = {
  onComplete: (tripData: CreateTripPayload) => void;
  onCancel: () => void;
};

type FormState = {
  role: "" | "driver" | "passenger" | "both";
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  departureTime: string;
  recurrence: "once" | "weekly" | "custom";
  recurringDays: string[];
  availableSeats: string;
  rules: string;
  flexibilityBefore: "" | "15" | "30" | "45" | "60" | "90" | "120";
  flexibilityAfter: "" | "15" | "30" | "45" | "60" | "90" | "120";
};

const DAYS_OF_WEEK = [
  { value: "monday", label: "Lunedì" },
  { value: "tuesday", label: "Martedì" },
  { value: "wednesday", label: "Mercoledì" },
  { value: "thursday", label: "Giovedì" },
  { value: "friday", label: "Venerdì" },
  { value: "saturday", label: "Sabato" },
  { value: "sunday", label: "Domenica" },
];

export const FLEXIBILITY_OPTIONS = [
  { value: 15, label: "15 minuti" },
  { value: 30, label: "30 minuti" },
  { value: 45, label: "45 minuti" },
  { value: 60, label: "1 ora" },
  { value: 90, label: "1 ora e 30 min" },
  { value: 120, label: "2 ore" },
];

export function CreateTripFlow({ onComplete, onCancel }: CreateTripFlowProps) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    role: "",
    departureLocation: "",
    arrivalLocation: "",
    date: "",
    arrivalTime: "",
    recurrence: "once",
    recurringDays: [],
    availableSeats: "",
    rules: "",
    flexibilityBefore: "",
    flexibilityAfter: "",
  });

  const handleRoleSelect = (role: "driver" | "passenger" | "both") => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const toggleDay = (day: string) => {
    if (formData.recurringDays.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: formData.recurringDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...formData.recurringDays, day],
      });
    }
  };

  const handleSubmit = () => {
    if (formData.recurrence === "custom" && formData.recurringDays.length === 0) {
      alert("Seleziona almeno un giorno per la ricorrenza personalizzata");
      return;
    }

    const isDriver = formData.role === "driver" || formData.role === "both";

    if (
      formData.role &&
      formData.departureLocation &&
      formData.arrivalLocation &&
      formData.date &&
      formData.arrivalTime &&
      (!isDriver || formData.availableSeats)
    ) {
      const availableSeatsNumber = isDriver && formData.availableSeats ? Number(formData.availableSeats) : undefined;

      if (isDriver && (isNaN(availableSeatsNumber as number) || (availableSeatsNumber as number) <= 0)) {
        alert("Inserisci un numero valido di posti disponibili");
        return;
      }

      const flexibilityBeforeNumber = formData.flexibilityBefore ? Number(formData.flexibilityBefore) : undefined;
      const flexibilityAfterNumber = formData.flexibilityAfter ? Number(formData.flexibilityAfter) : undefined;

      const tripData = {
        role: formData.role as "driver" | "passenger" | "both",
        departureLocation: formData.departureLocation,
        arrivalLocation: formData.arrivalLocation,
        date: formData.date,
        arrivalTime: formData.arrivalTime,
        recurrence: formData.recurrence,
        recurringDays: formData.recurrence === "custom" ? formData.recurringDays : undefined,
        availableSeats: availableSeatsNumber,
        rules: isDriver ? formData.rules || undefined : undefined,
        flexibilityBefore: flexibilityBeforeNumber,
        flexibilityAfter: flexibilityAfterNumber,
      };

      onComplete(tripData as any);
      setShowSuccess(true);
    } else {
      alert("Compila tutti i campi obbligatori");
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {showSuccess ? (
          <div className="glass-panel p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="glass-soft w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold mb-3">🎉 Il tuo viaggio è pubblicato!</h1>
              <p className="text-lg text-muted">Benvenuto su Hoppin, l'app di carpooling per gli studenti del PoliMi</p>
            </div>

            <div className="glass-card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Cosa succede adesso?</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-[#fe6e5a]">1</div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Hai completato la registrazione</h3>
                    <p className="text-muted">Hai indicato il tuo ruolo e percorso — perfetto!</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-[#fe6e5a]">2</div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Analizzeremo il tuo percorso</h3>
                    <p className="text-muted">Nei prossimi giorni, troveremo studenti del PoliMi con lo stesso percorso e orario (andata o ritorno).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-[#fe6e5a]">3</div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ti contatteremo via WhatsApp</h3>
                    <p className="text-muted">
                      Quando troveremo una corrispondenza compatibile, ti contatteremo direttamente su WhatsApp per metterti in contatto e aiutarti a
                      organizzare il viaggio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 mb-8">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Il Nostro Obiettivo
              </h3>
              <p className="text-muted">Aiutarti a raggiungere il PoliMi più velocemente, spendendo meno e riducendo il caos dei mezzi pubblici.</p>
            </div>

            <div className="glass-card p-6 mb-8">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Suggerimento Rapido
              </h3>
              <p className="text-muted">
                Più completi sono i dettagli del tuo percorso (orari, fermate, giorni), più velocemente troveremo una corrispondenza perfetta.
              </p>
            </div>

            <div className="text-center">
              <p className="text-muted mb-6">
                Grazie per essere uno dei primi utenti di Hoppin! Il tuo feedback ci aiuterà a crescere e migliorare l'esperienza per tutti gli studenti del
                PoliMi.
              </p>
              <button
                onClick={() => (window.location.href = "mailto:hello@hoppinapp.com")}
                className="btn-primary btn-primary-lg text-lg"
              >
                Contattaci
              </button>
              <p className="text-sm text-muted mt-4">hello@hoppinapp.com</p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/60 text-center">
              <p className="text-muted mb-2">Ci vediamo sulla strada! 🚀</p>
              <p className="text-sm text-muted">– Il Team di Hoppin</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted">Passaggio {step} di 2</span>
                <button onClick={onCancel} className="btn-ghost text-sm">
                  Annulla
                </button>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full bg-[#fe6e5a]" style={{ width: `${(step / 2) * 100}%` }} />
              </div>
            </div>

            {step === 1 && (
              <div className="glass-panel p-8">
                <h1 className="text-3xl font-bold mb-2">Qual è il tuo ruolo?</h1>
                <p className="text-muted mb-8">Seleziona se sei conducente, passeggero o entrambi</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={() => handleRoleSelect("driver")}
                    className="glass-card p-8 text-left transition-colors group hover:border-[rgba(254,110,90,0.45)]"
                  >
                    <div className="glass-soft w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Conducente</h3>
                    <p className="text-muted">Offro posti nel mio veicolo</p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("passenger")}
                    className="glass-card p-8 text-left transition-colors group hover:border-[rgba(254,110,90,0.45)]"
                  >
                    <div className="glass-soft w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Passeggero</h3>
                    <p className="text-muted">Cerco un passaggio</p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("both")}
                    className="glass-card p-8 text-left transition-colors group hover:border-[rgba(254,110,90,0.45)]"
                  >
                    <div className="glass-soft w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Entrambi</h3>
                    <p className="text-muted">Posso essere sia conducente che passeggero</p>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-panel p-8">
                <button onClick={() => setStep(1)} className="btn-ghost mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  Indietro
                </button>

                <h1 className="text-3xl font-bold mb-2">Dettagli del Viaggio</h1>
                <p className="text-muted mb-8">Inserisci le informazioni del tuo viaggio quotidiano</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-muted mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-muted" />
                      Città di Partenza
                    </label>
                    <input
                      type="text"
                      value={formData.departureLocation}
                      onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                      placeholder="es. Milano, Via Roma 1"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand" />
                      Città di Arrivo
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalLocation}
                      onChange={(e) => setFormData({ ...formData, arrivalLocation: e.target.value })}
                      placeholder="es. Politecnico di Milano, Piazza Leonardo da Vinci"
                      className="input-field"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-muted mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted" />
                        Data del Viaggio
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted" />
                        Orario di Partenza
                      </label>
                      <input
                        type="time"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-muted mb-2">Quanto puoi essere flessibile prima dell’orario indicato?</label>
                      <select
                        value={formData.flexibilityBefore}
                        onChange={(e) => setFormData({ ...formData, flexibilityBefore: e.target.value as any })}
                        className="select-field"
                      >
                        <option value="">Seleziona...</option>
                        {FLEXIBILITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-muted">Es. ho scritto 9:00 ma posso partire anche alle 8:30.</p>
                    </div>

                    <div>
                      <label className="block text-muted mb-2">Quanto puoi essere flessibile dopo l’orario indicato?</label>
                      <select
                        value={formData.flexibilityAfter}
                        onChange={(e) => setFormData({ ...formData, flexibilityAfter: e.target.value as any })}
                        className="select-field"
                      >
                        <option value="">Seleziona...</option>
                        {FLEXIBILITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-muted">Es. ho scritto 9:00 ma posso partire anche alle 9:30.</p>
                    </div>
                  </div>

                  {(formData.role === "driver" || formData.role === "both") && (
                    <div>
                      <label className="block text-muted mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted" />
                        Posti Disponibili
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={formData.availableSeats}
                        onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                        placeholder="es. 3"
                        className="input-field"
                      />
                      <p className="text-sm text-muted mt-1">Indica quanti posti puoi offrire nel tuo veicolo.</p>
                    </div>
                  )}

                  {(formData.role === "driver" || formData.role === "both") && (
                    <div>
                      <label className="block text-muted mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 text-muted">📝</span>
                        Regole Aggiuntive
                      </label>
                      <textarea
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        placeholder="es. Niente fumo in macchina, ok animali piccoli, ascolto musica..."
                        rows={3}
                        className="textarea-field resize-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-muted mb-3 flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-muted" />
                      Ricorrenza
                    </label>
                    <div className="space-y-3">
                      <label className="glass-soft flex items-center gap-3 p-4 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrence"
                          value="once"
                          checked={formData.recurrence === "once"}
                          onChange={() => setFormData({ ...formData, recurrence: "once", recurringDays: [] })}
                          className="w-4 h-4 text-[#fe6e5a]"
                        />
                        <div>
                          <p className="font-medium">Una Volta</p>
                          <p className="text-sm text-muted">Questo viaggio avviene solo una volta</p>
                        </div>
                      </label>

                      <label className="glass-soft flex items-center gap-3 p-4 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrence"
                          value="weekly"
                          checked={formData.recurrence === "weekly"}
                          onChange={() => setFormData({ ...formData, recurrence: "weekly", recurringDays: [] })}
                          className="w-4 h-4 text-[#fe6e5a]"
                        />
                        <div>
                          <p className="font-medium">Ripeti Ogni Settimana</p>
                          <p className="text-sm text-muted">Questo viaggio si ripete lo stesso giorno ogni settimana</p>
                        </div>
                      </label>

                      <label className="glass-soft flex items-center gap-3 p-4 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrence"
                          value="custom"
                          checked={formData.recurrence === "custom"}
                          onChange={() => setFormData({ ...formData, recurrence: "custom" })}
                          className="w-4 h-4 text-[#fe6e5a]"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Giorni Personalizzati</p>
                          <p className="text-sm text-muted mb-3">Seleziona giorni specifici della settimana</p>

                          {formData.recurrence === "custom" && (
                            <div className="grid grid-cols-4 gap-2">
                              {DAYS_OF_WEEK.map((day) => (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => toggleDay(day.value)}
                                  className={`px-3 py-2 rounded-full text-sm transition-colors ${
                                    formData.recurringDays.includes(day.value) ? "bg-[#fe6e5a] text-white" : "bg-white/70 text-muted"
                                  }`}
                                >
                                  {day.label.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="btn-secondary">
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="btn-primary"
                    >
                      Pubblica Viaggio
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
