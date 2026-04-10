import { useState, useEffect } from "react";
import { ArrowRight, Car, Users, Check } from "lucide-react";
import { HoppinEvent } from "../types";
import { api } from "../services/api";
import logo from "../images/logo.png";

type EventPageProps = {
  slug: string;
  onBack: () => void;
};

type Step = "role" | "form" | "done";

export function EventPage({ slug, onBack }: EventPageProps) {
  const [event, setEvent] = useState<HoppinEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("role");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [role, setRole] = useState<"driver" | "passenger" | "">("");
  const [contact, setContact] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [availableSeats, setAvailableSeats] = useState("2");
  const [note, setNote] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getEventBySlug(slug)
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRoleSelect = (r: "driver" | "passenger") => {
    setRole(r);
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!event || !role) return;
    if (!contact.trim()) {
      alert("Inserisci un'email o un numero di telefono");
      return;
    }
    if (!departureCity.trim()) {
      alert("Inserisci la tua citta di partenza");
      return;
    }

    setSubmitting(true);
    try {
      await api.registerForEvent({
        eventId: event.id,
        role,
        contact: contact.trim(),
        departureCity: departureCity.trim(),
        eventDate,
        availableSeats: role === "driver" ? Number(availableSeats) : undefined,
        note: note.trim() || undefined,
      });
      setStep("done");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Errore nell'invio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fe6e5a]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-lg text-[#6f5a52]">Evento non trovato</p>
        <button onClick={onBack} className="btn-primary">Torna alla Home</button>
      </div>
    );
  }

  const registrationCount = event.registrationCount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2">
          <img src={logo} alt="Hoppin" className="h-7 w-auto" />
        </button>
        <span className="text-sm text-[#6f5a52] font-medium hidden sm:block">{event.title}</span>
      </nav>

      {/* Hero: testo a sinistra, immagine a destra */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 pb-10 sm:pb-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Testo */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2f231f] leading-tight mb-4">{event.displayedTitle}</h1>
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#fe6e5a] leading-tight mb-5"
              dangerouslySetInnerHTML={{
                __html: event.subtitle || "Taglia i costi.<br/>Non partire da solo."
              }}
            />
            <p className="text-base sm:text-lg text-[#6f5a52] mb-6 leading-relaxed max-w-lg">
              {event.description || "Dividi benzina e spese in 30 secondi. Piu aspetti, meno opzioni trovi."}
            </p>
            {registrationCount > 0 && (
              <p className="text-sm font-semibold text-[#fe6e5a] flex items-center gap-2">
                <span className="text-base">🔥</span>
                +{registrationCount} persone stanno cercando un passaggio
              </p>
            )}
          </div>

          {/* Immagine */}
          {event.imageUrl && (
            <div className="flex-1 w-full md:max-w-md lg:max-w-lg">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-[#fafafa] rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">

          {/* STEP 1: Role Selection */}
          {step === "role" && (
            <>
              <p className="text-xl text-[#2f231f] mb-5 font-bold">Seleziona il tuo ruolo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleRoleSelect("driver")}
                  className={`flex items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    role === "driver"
                      ? "border-[#fe6e5a] bg-[#fe6e5a]/5"
                      : "border-gray-200 hover:border-[#fe6e5a]/40 bg-white"
                  }`}
                >
                  <span className="text-2xl">🚗</span>
                  <div>
                    <p className="font-bold text-[#2f231f]">Sono un driver</p>
                    <p className="text-sm text-[#6f5a52] mt-0.5">Offro posti in auto e divido i costi</p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("passenger")}
                  className={`flex items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    role === "passenger"
                      ? "border-[#fe6e5a] bg-[#fe6e5a]/5"
                      : "border-gray-200 hover:border-[#fe6e5a]/40 bg-white"
                  }`}
                >
                  <span className="text-2xl">🤙</span>
                  <div>
                    <p className="font-bold text-[#2f231f]">Sono un passeggero</p>
                    <p className="text-sm text-[#6f5a52] mt-0.5">Cerco un passaggio per risparmiare</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Form */}
          {step === "form" && (
            <>
              {/* Back to role */}
              <button
                onClick={() => setStep("role")}
                className="text-sm text-[#6f5a52] hover:text-[#2f231f] mb-5 font-medium"
              >
                ← Cambia ruolo ({role === "driver" ? "Driver" : "Passeggero"})
              </button>

              <div className="space-y-5">
                {/* Contact */}
                <div>
                  <label className="block text-sm text-[#6f5a52] mb-1.5">Email o telefono <span className="text-[#6f5a52]/50">(solo se troviamo match)</span></label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="mario@email.com o +39 333 1234567"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 focus:border-[#fe6e5a] transition-all"
                  />
                </div>

                {/* Departure City */}
                <div>
                  <label className="block text-sm text-[#6f5a52] mb-1.5">Citta di partenza</label>
                  <input
                    type="text"
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    placeholder="Es. Milano, Torino, Bergamo"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 focus:border-[#fe6e5a] transition-all"
                  />
                  <p className="text-xs text-[#6f5a52]/60 mt-1">Serve per trovarti persone sulla stessa tratta</p>
                </div>

                {/* Event Date */}
                {event.eventDates && event.eventDates.length > 0 ? (
                  <div>
                    <label className="block text-sm text-[#6f5a52] mb-1.5">Giorno in cui vai</label>
                    <select
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 focus:border-[#fe6e5a] transition-all appearance-none"
                    >
                      <option value="">Seleziona giorno</option>
                      {event.eventDates.map((d) => {
                        const dateObj = new Date(d + "T00:00:00");
                        const formatted = dateObj.toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                        });
                        return (
                          <option key={d} value={d}>{formatted}</option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-[#6f5a52] mb-1.5">Data</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 focus:border-[#fe6e5a] transition-all"
                    />
                  </div>
                )}

                {/* Available Seats (driver only) */}
                {role === "driver" && (
                  <div>
                    <label className="block text-sm text-[#6f5a52] mb-1.5">Posti disponibili in auto</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={availableSeats}
                      onChange={(e) => setAvailableSeats(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 focus:border-[#fe6e5a] transition-all"
                    />
                    <p className="text-xs text-[#6f5a52]/60 mt-1">Piu posti offri, piu e' facile riempire l'auto</p>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm text-[#6f5a52] mb-1.5">
                    Cosa ti farebbe dire: "questo passaggio lo prendo subito"?{" "}
                    <span className="text-[#6f5a52]/50">(es. prezzo, orario, compagnia)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Opzionale - aiutaci a trovarti il match perfetto"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 focus:border-[#fe6e5a] transition-all resize-none"
                  />
                </div>

                {/* Privacy */}
                <p className="text-xs text-[#6f5a52] flex items-center gap-1.5">
                  <span>🔒</span> Nessuno spam. Ti scriviamo solo se c'e' un match reale.
                </p>

                {/* Timer / urgency */}
                <p className="text-xs text-[#6f5a52] flex items-center gap-1.5">
                  <span>⏱</span> Ti serve meno di 30 secondi
                </p>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-[#fe6e5a] hover:bg-[#e5604d] text-white font-bold text-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#fe6e5a]/20"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {role === "driver" ? "Pubblica viaggio" : "Blocca il tuo passaggio"}
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Done */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[#fe6e5a]/10 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-[#fe6e5a]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2f231f] mb-3">
                Ti avvisiamo appena troviamo un passaggio perfetto 🔥
              </h2>
              <p className="text-[#6f5a52] mb-3 max-w-md mx-auto">
                Stiamo costruendo Hoppin per trovare passaggi reali tra persone che vanno allo stesso evento.
              </p>
              <p className="text-sm text-[#fe6e5a] font-medium mb-8">
                Ti scriviamo appena troviamo qualcuno dalla tua zona con cui condividere il viaggio.
              </p>
              <a
                href="https://www.linkedin.com/company/hoppin-carpooling"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#fe6e5a] hover:bg-[#e5604d] text-white font-semibold transition-colors shadow-lg shadow-[#fe6e5a]/20"
              >
                Resta aggiornato seguendo la nostra pagina LinkedIn →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-2">
          <img src={logo} alt="Hoppin" className="h-4 w-auto opacity-60" />
          <span className="text-xs text-[#6f5a52]/50">
            &copy; {new Date().getFullYear()} Hoppin
          </span>
        </div>
      </footer>
    </div>
  );
}
