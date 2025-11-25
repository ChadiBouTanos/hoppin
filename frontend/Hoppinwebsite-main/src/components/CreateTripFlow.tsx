import { useState } from "react";
import { ArrowLeft, ArrowRight, Car, Users, MapPin, Calendar, Clock, Repeat } from "lucide-react";
import { CreateTripPayload } from "../App";

type CreateTripFlowProps = {
  onComplete: (tripData: CreateTripPayload) => void;
  onCancel: () => void;
};

type FormState = {
  role: "driver" | "passenger" | "both" | "";
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  arrivalTime: string;
  recurrence: "once" | "weekly" | "custom";
  recurringDays: string[];
  availableSeats: string;
  rules: string;
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
      };

      onComplete(tripData);
      setShowSuccess(true);
    } else {
      alert("Compila tutti i campi obbligatori");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-12 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showSuccess ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold mb-3">🎉 Il tuo viaggio è pubblicato!</h1>
              <p className="text-xl text-gray-600">Benvenuto su Hoppin, l'app di carpooling per gli studenti del PoliMi</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Cosa succede adesso?</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hai completato la registrazione</h3>
                    <p className="text-gray-600">Hai indicato il tuo ruolo e percorso — perfetto!</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Analizzeremo il tuo percorso</h3>
                    <p className="text-gray-600">Nei prossimi giorni, troveremo studenti del PoliMi con lo stesso percorso e orario (andata o ritorno).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ti contatteremo via WhatsApp</h3>
                    <p className="text-gray-600">
                      Quando troveremo una corrispondenza compatibile, ti contatteremo direttamente su WhatsApp per metterti in contatto e aiutarti a
                      organizzare il viaggio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Il Nostro Obiettivo
              </h3>
              <p className="text-gray-700">Aiutarti a raggiungere il PoliMi più velocemente, spendendo meno e riducendo il caos dei mezzi pubblici.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Suggerimento Rapido
              </h3>
              <p className="text-gray-700">
                Più completi sono i dettagli del tuo percorso (orari, fermate, giorni), più velocemente troveremo una corrispondenza perfetta.
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Grazie per essere uno dei primi utenti di Hoppin! Il tuo feedback ci aiuterà a crescere e migliorare l'esperienza per tutti gli studenti del
                PoliMi.
              </p>
              <button
                onClick={() => (window.location.href = "mailto:hello@hoppinapp.com")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Contattaci
              </button>
              <p className="text-sm text-gray-500 mt-4">hello@hoppinapp.com</p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2">Ci vediamo sulla strada! 🚀</p>
              <p className="text-sm text-gray-500">– Il Team di Hoppin</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Passaggio {step} di 2</span>
                <button onClick={onCancel} className="text-white hover:text-gray-200">
                  Annulla
                </button>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
              </div>
            </div>

            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8">
                <h1 className="text-3xl font-bold mb-2">Qual è il tuo ruolo?</h1>
                <p className="text-gray-600 mb-8">Seleziona se sei conducente, passeggero o entrambi</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={() => handleRoleSelect("driver")}
                    className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                      <Car className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Conducente</h3>
                    <p className="text-gray-600">Offro posti nel mio veicolo</p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("passenger")}
                    className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Passeggero</h3>
                    <p className="text-gray-600">Cerco un passaggio</p>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("both")}
                    className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <Car className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Entrambi</h3>
                    <p className="text-gray-600">Posso essere sia conducente che passeggero</p>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  Indietro
                </button>

                <h1 className="text-3xl font-bold mb-2">Dettagli del Viaggio</h1>
                <p className="text-gray-600 mb-8">Inserisci le informazioni del tuo viaggio quotidiano</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      Località di Partenza
                    </label>
                    <input
                      type="text"
                      value={formData.departureLocation}
                      onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                      placeholder="es. Milano, Via Roma 1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Località di Arrivo
                    </label>
                    <input
                      type="text"
                      value={formData.arrivalLocation}
                      onChange={(e) => setFormData({ ...formData, arrivalLocation: e.target.value })}
                      placeholder="es. Politecnico di Milano, Piazza Leonardo da Vinci"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        Data del Viaggio
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        Orario di Arrivo
                      </label>
                      <input
                        type="time"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {(formData.role === "driver" || formData.role === "both") && (
                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        Posti Disponibili
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={formData.availableSeats}
                        onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                        placeholder="es. 3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <p className="text-sm text-gray-500 mt-1">Indica quanti posti puoi offrire nel tuo veicolo.</p>
                    </div>
                  )}

                  {(formData.role === "driver" || formData.role === "both") && (
                    <div>
                      <label className="block text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 text-gray-400">📝</span>
                        Regole Aggiuntive
                      </label>
                      <textarea
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        placeholder="es. Niente fumo in macchina, ok animali piccoli, ascolto musica..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 mb-3 flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-gray-400" />
                      Ricorrenza
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="once"
                          checked={formData.recurrence === "once"}
                          onChange={() => setFormData({ ...formData, recurrence: "once", recurringDays: [] })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">Una Volta</p>
                          <p className="text-sm text-gray-500">Questo viaggio avviene solo una volta</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="weekly"
                          checked={formData.recurrence === "weekly"}
                          onChange={() => setFormData({ ...formData, recurrence: "weekly", recurringDays: [] })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">Ripeti Ogni Settimana</p>
                          <p className="text-sm text-gray-500">Questo viaggio si ripete lo stesso giorno ogni settimana</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="custom"
                          checked={formData.recurrence === "custom"}
                          onChange={() => setFormData({ ...formData, recurrence: "custom" })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">Giorni Personalizzati</p>
                          <p className="text-sm text-gray-500 mb-3">Seleziona giorni specifici della settimana</p>

                          {formData.recurrence === "custom" && (
                            <div className="grid grid-cols-4 gap-2">
                              {DAYS_OF_WEEK.map((day) => (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => toggleDay(day.value)}
                                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    formData.recurringDays.includes(day.value) ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                    <button type="button" onClick={onCancel} className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
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
