import { useState } from "react";
import { ArrowRight, Calendar, Check, MapPin, Users } from "lucide-react";
import logo from "../images/logo.png";
import { EventRegistrationPayload, HoppinEvent } from "../types";

type Step = "role" | "form" | "done";

type EventPageTemplateProps = {
  event: HoppinEvent;
  onBackToEvents: () => void;
  onGoToOrganizers: () => void;
  onSubmitRegistration: (payload: EventRegistrationPayload) => Promise<void>;
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function EventLogos({
  title,
  logos,
}: {
  title: string;
  logos: HoppinEvent["sponsorLogos"] | HoppinEvent["partnerLogos"];
}) {
  if (!logos || logos.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#6f5a52] mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {logos.map((item) => {
          const content = (
            <div className="rounded-xl border border-[#2f231f]/10 bg-white px-3 py-2">
              <img src={item.src} alt={item.alt} className="h-8 w-auto object-contain" loading="lazy" decoding="async" />
            </div>
          );
          return item.href ? (
            <a key={`${title}-${item.alt}-${item.src}`} href={item.href} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <div key={`${title}-${item.alt}-${item.src}`}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

export function EventPageTemplate({
  event,
  onBackToEvents,
  onGoToOrganizers,
  onSubmitRegistration,
}: EventPageTemplateProps) {
  const [step, setStep] = useState<Step>("role");
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<"driver" | "passenger" | "">("");
  const [contact, setContact] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [availableSeats, setAvailableSeats] = useState("2");
  const [note, setNote] = useState("");

  const accentColor = event.themeColor || "#fe6e5a";
  const coverStyle = event.coverStyle || "split";
  const selectedDate = event.date || (event.eventDates && event.eventDates.length > 0 ? formatDate(event.eventDates[0]) : undefined);
  const registrationCount = event.registrationCount || 0;

  const submitLabel =
    event.customCTA ||
    (role === "driver" ? "Pubblica viaggio" : "Blocca il tuo passaggio");

  const handleRoleSelect = (selectedRole: "driver" | "passenger") => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!role || !contact.trim() || !departureCity.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitRegistration({
        eventId: event.id,
        role,
        contact: contact.trim(),
        departureCity: departureCity.trim(),
        eventDate: eventDate || undefined,
        availableSeats: role === "driver" ? Number(availableSeats) : undefined,
        note: note.trim() || undefined,
      });
      setStep("done");
    } catch (err: any) {
      alert(err?.message || "Errore nell'invio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <button onClick={onBackToEvents} className="flex items-center gap-2">
          <img src={logo} alt="Hoppin" className="h-7 w-auto" />
        </button>
        <div className="hidden sm:flex items-center gap-5">
          <button onClick={onGoToOrganizers} className="text-sm font-semibold text-[#6f5a52] hover:text-[#2f231f]">
            Per organizzatori
          </button>
          <button onClick={onBackToEvents} className="text-sm font-semibold text-[#6f5a52] hover:text-[#2f231f]">
            Eventi
          </button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 pb-10 sm:pb-12">
        {coverStyle === "centered" ? (
          <div className="relative overflow-hidden rounded-3xl border border-[#2f231f]/10">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="h-64 sm:h-80 w-full object-cover" loading="lazy" decoding="async" />
            )}
            <div className="p-6 sm:p-10 bg-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2f231f] leading-tight mb-3">
                {event.displayedTitle || event.title}
              </h1>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-3xl">{event.description}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2f231f] leading-tight mb-3">
                {event.displayedTitle || event.title}
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-4" style={{ color: accentColor }}>
                {event.subtitle || "Trova o offri un passaggio in pochi secondi"}
              </p>
              <p className="text-base sm:text-lg text-[#6f5a52] mb-4 leading-relaxed max-w-xl">
                {event.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#6f5a52]">
                {event.location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff7ee]">
                    <MapPin className="w-4 h-4" /> {event.location}
                  </span>
                )}
                {selectedDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff7ee]">
                    <Calendar className="w-4 h-4" /> {selectedDate}
                  </span>
                )}
                {registrationCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff7ee]">
                    <Users className="w-4 h-4" /> +{registrationCount} iscritti
                  </span>
                )}
              </div>
              <button onClick={onGoToOrganizers} className="mt-6 text-sm font-semibold text-[#6f5a52] hover:text-[#2f231f]">
                Sei un organizzatore?
              </button>
            </div>
            {event.imageUrl && (
              <div className="flex-1 w-full md:max-w-md lg:max-w-lg">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
              </div>
            )}
          </div>
        )}

        <EventLogos title="Sponsor" logos={event.sponsorLogos} />
        <EventLogos title="Partner" logos={event.partnerLogos} />
      </section>

      {event.customSections && event.customSections.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.customSections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-[#2f231f]/10 p-5 sm:p-6 bg-white">
                <h3 className="text-lg font-bold text-[#2f231f] mb-2">{section.title}</h3>
                <p className="text-sm sm:text-base text-[#6f5a52]">{section.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-[#fafafa] rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
          {step === "role" && (
            <>
              <p className="text-xl text-[#2f231f] mb-5 font-bold">Seleziona il tuo ruolo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect("driver")}
                  className={`flex items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    role === "driver" ? "border-[#fe6e5a] bg-[#fe6e5a]/5" : "border-gray-200 hover:border-[#fe6e5a]/40 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-[#2f231f]">Sono un driver</p>
                    <p className="text-sm text-[#6f5a52] mt-0.5">Offro posti in auto e condivido i costi</p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("passenger")}
                  className={`flex items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    role === "passenger" ? "border-[#fe6e5a] bg-[#fe6e5a]/5" : "border-gray-200 hover:border-[#fe6e5a]/40 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-[#2f231f]">Sono un passeggero</p>
                    <p className="text-sm text-[#6f5a52] mt-0.5">Cerco un passaggio per l'evento</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === "form" && (
            <>
              <button onClick={() => setStep("role")} className="text-sm text-[#6f5a52] hover:text-[#2f231f] mb-5 font-medium">
                Cambia ruolo
              </button>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-[#6f5a52] mb-1.5">Email o telefono</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="email o numero di telefono"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6f5a52] mb-1.5">Citta di partenza</label>
                  <input
                    type="text"
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    placeholder="Es. Milano"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30"
                  />
                </div>
                {event.eventDates && event.eventDates.length > 0 ? (
                  <div>
                    <label className="block text-sm text-[#6f5a52] mb-1.5">Giorno in cui vai</label>
                    <select
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30"
                    >
                      <option value="">Seleziona giorno</option>
                      {event.eventDates.map((d) => (
                        <option key={d} value={d}>
                          {formatDate(d)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                {role === "driver" && (
                  <div>
                    <label className="block text-sm text-[#6f5a52] mb-1.5">Posti disponibili</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={availableSeats}
                      onChange={(e) => setAvailableSeats(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm text-[#6f5a52] mb-1.5">Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Opzionale"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[#2f231f] focus:outline-none focus:ring-2 focus:ring-[#fe6e5a]/30 resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {submitting ? "Invio..." : submitLabel}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[#fe6e5a]/10 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7" style={{ color: accentColor }} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2f231f] mb-3">Richiesta inviata con successo</h2>
              <p className="text-[#6f5a52] mb-6 max-w-md mx-auto">
                Ti contatteremo quando sara disponibile un match con partenza compatibile.
              </p>
              <button
                onClick={onBackToEvents}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                Torna a tutti gli eventi
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-3">
          <button onClick={onGoToOrganizers} className="text-sm font-semibold text-[#6f5a52] hover:text-[#2f231f]">
            Sei un organizzatore?
          </button>
          <span className="text-xs text-[#6f5a52]/50">&copy; {new Date().getFullYear()} Hoppin</span>
        </div>
      </footer>
    </div>
  );
}

