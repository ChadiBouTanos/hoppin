import { useState, useEffect, useRef } from 'react';
import {
  Car,
  Users,
  Leaf,
  ThumbsUp,
  ChevronDown,
  ArrowRight,
  TreePine,
  ParkingCircle,
  TrafficCone,
  Zap,
  CalendarCheck,
  BarChart3,
  MapPin,
  Handshake,
  Mail,
  Linkedin,
} from 'lucide-react';
import logo from '../images/logo.png';
import { HoppinEvent, User } from '../types';

interface LandingPageProps {
  onLogin?: () => void;
  onSignUp?: () => void;
  events?: HoppinEvent[];
  onEventClick?: (slug: string) => void;
  user?: User | null;
  onLogout?: () => void;
  onGoToAdmin?: () => void;
}

/* ──────────────────── mobile / reduced motion detection ──────────────────── */
const isCoarsePointer =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches;

/* ──────────────────── tiny hook: animate numbers on scroll ──────────────────── */
function useCountUp(end: number, duration = 1600) {
  // On mobile / reduced-motion devices we skip the IntersectionObserver and the
  // requestAnimationFrame loop entirely — the value is already at its final state.
  const [value, setValue] = useState(isCoarsePointer ? end : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(isCoarsePointer);

  useEffect(() => {
    if (isCoarsePointer) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, value };
}

/* ──────────────────── fade-in-on-scroll wrapper ──────────────────── */
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // Mobile / reduced-motion: render visible immediately, no observer.
  const [visible, setVisible] = useState(isCoarsePointer);

  useEffect(() => {
    if (isCoarsePointer) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        isCoarsePointer
          ? undefined
          : {
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(32px)',
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
          }
      }
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════════════════════════════════════ */
export function LandingPage({ onLogin, onSignUp, events = [], onEventClick, user, onLogout, onGoToAdmin }: LandingPageProps) {
  const isLoggedIn = !!user;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };

  /* ── stats counter hooks ── */
  const stat1 = useCountUp(2500);
  const stat2 = useCountUp(270);
  const stat3 = useCountUp(125);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-[#fff7ee] via-white to-[#fff1dc]/40 md:bg-none">
      {/* ─── background blobs (desktop only — too expensive on mobile GPU) ─── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="hidden md:block absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[#fe6e5a]/15 blur-[120px]" />
        <div className="hidden md:block absolute top-[20vh] right-[-8%] w-[500px] h-[500px] rounded-full bg-[#ffd6aa]/40 blur-[100px]" />
        <div className="hidden md:block absolute top-[60vh] left-[20%] w-[400px] h-[400px] rounded-full bg-[#fff1dc]/70 blur-[100px]" />
        <div className="hidden md:block absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full bg-[#fe6e5a]/8 blur-[120px]" />
      </div>

      {/* ═══════════════════════ NAVBAR ═══════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/60'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <img src={logo} alt="Hoppin" className="h-8 w-auto" />
          </button>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {events.length > 0 && (<button onClick={() => scrollTo('eventi')} className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors">Eventi</button>)}
            <button onClick={() => scrollTo('problem')} className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors">Il Problema</button>
            <button onClick={() => scrollTo('solution')} className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors">Soluzione</button>
            <button onClick={() => scrollTo('how')} className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors">Come Funziona</button>
            <button onClick={() => scrollTo('team')} className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors">Team</button>
            <button onClick={() => scrollTo('contact')} className="btn-primary">Contattaci</button>
            {isLoggedIn ? (
              <>
                <span className="text-base font-semibold text-[#6f5a52] hidden lg:inline">{user?.firstName}</span>
                {onGoToAdmin && (<button onClick={onGoToAdmin} className="btn-ghost text-base font-semibold">Pannello Admin</button>)}
                {onLogout && (<button onClick={onLogout} className="btn-ghost text-base font-semibold text-red-600">Esci</button>)}
              </>
            ) : (
              <>
                {onLogin && (<button onClick={onLogin} className="btn-ghost text-base font-semibold">Accedi</button>)}
                {onSignUp && (<button onClick={onSignUp} className="btn-primary">Registrati</button>)}
              </>
            )}
          </div>

          {/* mobile hamburger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden flex flex-col gap-1.5 p-3 -mr-2 active:bg-black/5 rounded-xl">
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/60 px-5 py-5 space-y-1">
            {[
              ...(events.length > 0 ? [{ id: 'eventi', label: 'Eventi' }] : []),
              { id: 'problem', label: 'Il Problema' },
              { id: 'solution', label: 'Soluzione' },
              { id: 'how', label: 'Come Funziona' },
              { id: 'team', label: 'Team' },
              { id: 'contact', label: 'Contattaci' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left font-semibold text-[#6f5a52] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
              >
                {item.label}
              </button>
            ))}
            {isLoggedIn ? (
              <>
                {onGoToAdmin && (
                  <button
                    onClick={() => { setMobileMenu(false); onGoToAdmin(); }}
                    className="block w-full text-left font-semibold text-[#6f5a52] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
                  >
                    Pannello Admin
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => { setMobileMenu(false); onLogout(); }}
                    className="block w-full text-left font-semibold text-red-600 py-3 px-3 rounded-xl active:bg-red-50 transition-colors text-base"
                  >
                    Esci
                  </button>
                )}
              </>
            ) : (
              <>
                {onLogin && (
                  <button
                    onClick={() => { setMobileMenu(false); onLogin(); }}
                    className="block w-full text-left font-semibold text-[#6f5a52] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
                  >
                    Accedi
                  </button>
                )}
                {onSignUp && (
                  <button
                    onClick={() => { setMobileMenu(false); onSignUp(); }}
                    className="block w-full text-left font-semibold text-[#fe6e5a] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
                  >
                    Registrati
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-24 sm:pt-32 md:pt-44 pb-16 sm:pb-20 md:pb-32 max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#fe6e5a]/10 border border-[#fe6e5a]/20 text-xs sm:text-sm font-semibold text-[#fe6e5a] mb-5 sm:mb-6">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Carpooling per eventi
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight tracking-tight text-[#2f231f] mb-4 sm:mb-6">
              Meno auto.<br />
              Arrivi migliori.<br />
              <span className="text-[#fe6e5a]">Eventi migliori.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#6f5a52] max-w-2xl mb-8 sm:mb-10 leading-relaxed">
              Hoppin offre agli organizzatori di eventi una piattaforma di carpooling su misura che riduce la congestione
              e genera un impatto di sostenibilità misurabile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={() => scrollTo('eventi')} className="btn-primary btn-primary-lg group w-full sm:w-auto justify-center">
                Scopri di più
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => scrollTo('how')} className="btn-secondary btn-primary-lg w-full sm:w-auto justify-center">
                Come funziona
              </button>
            </div>
          </div>
        </FadeIn>

        {/* scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <ChevronDown className="w-6 h-6 text-[#6f5a52]/40" />
        </div>
      </section>

      {/* ═══════════════════════ EVENTS ═══════════════════════ */}
      {events.length > 0 && (
        <section id="eventi" className="py-14 sm:py-20 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mt-4 mb-10 sm:mb-16">
                <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Eventi</span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                  Trova un passaggio per i prossimi eventi
                </h2>
                <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                  Seleziona un evento e indica se offri o cerchi un passaggio. Ti metteremo in contatto con gli altri partecipanti.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.filter(ev => ev.isActive).map((ev, i) => (
                <FadeIn key={ev.id} delay={i * 120}>
                  <button
                    onClick={() => onEventClick?.(ev.slug)}
                    className="glass-card overflow-hidden text-left w-full group hover:scale-[1.02] transition-transform duration-300"
                  >
                    {ev.imageUrl ? (
                      <div className="h-44 sm:h-48 overflow-hidden">
                        <img src={ev.imageUrl} alt={ev.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      </div>
                    ) : (
                      <div className="h-44 sm:h-48 bg-gradient-to-br from-[#fe6e5a]/20 to-[#ffd6aa]/40 flex items-center justify-center">
                        <CalendarCheck className="w-12 h-12 text-[#fe6e5a]/40" />
                      </div>
                    )}
                    <div className="p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-[#2f231f] mb-2 group-hover:text-[#fe6e5a] transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-[#6f5a52] line-clamp-2 leading-relaxed mb-4">
                        {ev.description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#fe6e5a]">
                        Trova un passaggio
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ PROBLEM ═══════════════════════ */}
      <section id="problem" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mt-4 mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Il Problema</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                1 grande evento = <span className="text-[#fe6e5a]">10.000+ auto</span>
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Il trasporto è il tallone d'Achille degli eventi. Congestione, emissioni e parcheggi al collasso
                danneggiano la reputazione e l'esperienza dei partecipanti.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: <TreePine className="w-6 h-6 sm:w-7 sm:h-7" />,
                stat: '70-80%',
                label: 'delle emissioni degli eventi',
                desc: 'sono dovute al trasporto dei partecipanti',
              },
              {
                icon: <TrafficCone className="w-6 h-6 sm:w-7 sm:h-7" />,
                stat: '25%',
                label: 'delle auto bloccate',
                desc: 'nel traffico generato dagli eventi',
              },
              {
                icon: <ParkingCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
                stat: '100%',
                label: 'capacità parcheggi',
                desc: 'raggiunta o superata ad ogni evento',
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="glass-card p-6 sm:p-8 text-center hover:scale-[1.02] transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#fe6e5a]/10 text-[#fe6e5a] mb-4 sm:mb-5">
                    {item.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#fe6e5a] mb-2">{item.stat}</div>
                  <div className="font-semibold text-[#2f231f] text-sm sm:text-base mb-1">{item.label}</div>
                  <p className="text-xs sm:text-sm text-[#6f5a52]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SOLUTION / VALUE PROP ═══════════════════════ */}
      <section id="solution" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="glass-panel p-6 sm:p-10 md:p-16 text-center mt-4 mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">La Soluzione</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-4 sm:mb-6">
                Carpooling intelligente<br />per i tuoi eventi
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Hoppin connette i partecipanti verificati per condividere il viaggio verso l'evento,
                riducendo congestione ed emissioni con una piattaforma dedicata.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: <Car className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Logistica',
                desc: 'Meno auto, meno traffico, arrivi scaglionati. Semplifica la gestione della mobilità del tuo evento.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Leaf className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Sostenibilità',
                desc: 'Riduci le emissioni di CO₂ in modo misurabile. Report di impatto ambientale per ogni evento.',
                color: 'bg-green-100 text-green-700',
              },
              {
                icon: <ThumbsUp className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Reputazione',
                desc: "Posiziona il tuo evento come sostenibile e innovativo. Un valore aggiunto per sponsor e partecipanti.",
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="glass-card p-6 sm:p-8 hover:scale-[1.02] transition-transform duration-300 h-full">
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.color} mb-4 sm:mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2f231f] mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[#6f5a52] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mt-4 mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Come Funziona</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                Da zero a evento sostenibile
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Un percorso semplice per integrare Hoppin nel tuo evento.
              </p>
            </div>
          </FadeIn>

          {/* Customer Journey */}
          <div className="mb-12 sm:mb-16">
            <FadeIn>
              <h3 className="text-base sm:text-lg font-bold text-[#2f231f] mb-6 sm:mb-8 text-center">Per l'organizzatore</h3>
            </FadeIn>
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 gap-4 snap-x snap-mandatory sm:snap-none scrollbar-hide">
              {[
                { icon: <Handshake className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Incontro iniziale', desc: 'Analizziamo le esigenze' },
                { icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Pianificazione', desc: 'Logistica condivisa' },
                { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Deployment', desc: 'Sezione evento dedicata' },
                { icon: <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Gestione on-site', desc: 'Management in tempo reale' },
                { icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Report', desc: 'Dati e impatto misurato' },
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <div className="relative text-center min-w-[120px] snap-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fe6e5a]/10 text-[#fe6e5a] mb-3 mx-auto">
                      {step.icon}
                    </div>
                    {i < 4 && (
                      <div className="hidden sm:block absolute top-6 sm:top-7 left-[60%] w-[80%] h-px bg-[#fe6e5a]/20" />
                    )}
                    <h4 className="font-bold text-[#2f231f] text-xs sm:text-sm mb-1">{step.label}</h4>
                    <p className="text-[10px] sm:text-xs text-[#6f5a52]">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* User Journey */}
          <FadeIn>
            <h3 className="text-base sm:text-lg font-bold text-[#2f231f] mb-6 sm:mb-8 text-center">Per il partecipante</h3>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {[
              { step: '01', title: 'Scopri Hoppin', desc: 'Tramite il canale dell\'evento, il partecipante scopre la piattaforma.' },
              { step: '02', title: 'Registrati', desc: 'Scarica l\'app e crea il tuo profilo in pochi secondi.' },
              { step: '03', title: 'Trova un passaggio', desc: 'Cerca o offri un passaggio. L\'algoritmo trova il match perfetto.' },
              { step: '04', title: 'Viaggia insieme', desc: 'Mostra il QR code, parcheggia nel posto riservato e goditi l\'evento.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="glass-card p-5 sm:p-6 h-full">
                  <span className="text-3xl sm:text-4xl font-bold text-[#fe6e5a]/20">{item.step}</span>
                  <h4 className="font-bold text-[#2f231f] text-sm sm:text-base mt-1 sm:mt-2 mb-1 sm:mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-[#6f5a52] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRACTION / NUMBERS ═══════════════════════ */}
      <section className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="glass-panel p-6 sm:p-10 md:p-16">
              <div className="text-center mb-8 sm:mb-12">
                <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Traction</span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3">
                  Nati con le comunità locali
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
                <div>
                  <div className="text-2xl sm:text-5xl md:text-6xl font-bold text-[#fe6e5a]">
                    <span ref={stat1.ref}>{stat1.value.toLocaleString()}</span>+
                  </div>
                  <p className="text-[#6f5a52] mt-1 sm:mt-2 font-semibold text-xs sm:text-base">Utenti raggiunti</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-5xl md:text-6xl font-bold text-[#fe6e5a]">
                    <span ref={stat2.ref}>{stat2.value}</span>+
                  </div>
                  <p className="text-[#6f5a52] mt-1 sm:mt-2 font-semibold text-xs sm:text-base">Iscrizioni</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-5xl md:text-6xl font-bold text-[#fe6e5a]">
                    <span ref={stat3.ref}>{stat3.value}</span>+
                  </div>
                  <p className="text-[#6f5a52] mt-1 sm:mt-2 font-semibold text-xs sm:text-base">Percorsi creati</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════ BUSINESS MODEL ═══════════════════════ */}
      <section className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Il Nostro Modello</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                SaaS per grandi eventi
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Vendiamo agli organizzatori un sistema dedicato per semplificare
                i problemi di mobilità dei loro eventi.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: <Users className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Per gli organizzatori',
                desc: 'Una piattaforma white-label personalizzata per ogni evento con dashboard di gestione dedicata.',
              },
              {
                icon: <Car className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Per i partecipanti',
                desc: 'Un\'esperienza utente fluida: cerca, trova e condividi il viaggio verso l\'evento in pochi tap.',
              },
              {
                icon: <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Dati e impatto',
                desc: 'Report dettagliati su riduzione CO₂, auto risparmiate e impatto ambientale certificato.',
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="glass-card p-6 sm:p-8 h-full hover:scale-[1.02] transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#fe6e5a]/10 text-[#fe6e5a] mb-4 sm:mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2f231f] mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[#6f5a52] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TEAM ═══════════════════════ */}
      <section id="team" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mt-4 mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Il Team</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-4">Chi c'è dietro Hoppin</h2>
              <p className="text-base sm:text-lg text-[#4b3c37] font-medium max-w-2xl mx-auto">Giovani imprenditori uniti dalla volontà di rivoluzionare la mobilità degli eventi.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                name: "Leonardo Bulferi Bufferetti",
                role: "Co-Founder",
                img: "https://api.dicebear.com/7.x/shapes/svg?seed=Leonardo"
              },
              {
                name: "Francesco Sala",
                role: "Co-Founder",
                img: "https://api.dicebear.com/7.x/shapes/svg?seed=Francesco"
              },
              {
                name: "Carlo Molinari",
                role: "Co-Founder",
                img: "https://api.dicebear.com/7.x/shapes/svg?seed=Carlo"
              },
              {
                name: "Nicolò Rota",
                role: "Co-Founder",
                img: "https://api.dicebear.com/7.x/shapes/svg?seed=Nicolo"
              }
            ].map((member, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="glass-card p-4 sm:p-6 text-center hover:scale-[1.04] transition-transform duration-300">
                  {/* Avatar impersonale */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden shadow-md bg-white">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Nome */}
                  <h4 className="font-bold text-[#2f231f] text-sm sm:text-base">{member.name}</h4>
                  {/* Ruolo */}
                  <p className="text-[11px] sm:text-xs text-[#6f5a52] mt-1 font-medium">{member.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA / CONTACT ═══════════════════════ */}
      <section id="contact" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="glass-panel p-6 sm:p-10 md:p-16 text-center">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Contattaci</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-4 sm:mb-6">Pronto a rendere il tuo evento più sostenibile?</h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-xl mx-auto mb-8 sm:mb-10">Scrivici per scoprire come Hoppin può trasformare la mobilità del tuo prossimo evento.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {/* Email */}
                <a href="mailto:hoppin.team@gmail.com" className="btn-primary btn-primary-lg group w-full sm:w-auto justify-center">
                  <Mail className="w-5 h-5" />hoppin.team@gmail.com<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/hoppin-carpooling" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-primary-lg w-full sm:w-auto justify-center">
                  <Linkedin className="w-5 h-5" />LinkedIn
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/hoppin.mobility/" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-primary-lg w-full sm:w-auto justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="py-8 sm:py-10 border-t border-[#2f231f]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hoppin" className="h-5 sm:h-6 w-auto opacity-60" />
            <span className="text-xs sm:text-sm text-[#6f5a52]">
              &copy; {new Date().getFullYear()} Hoppin. Tutti i diritti riservati.
            </span>
          </div>
          {/* Email */}
          <a href="mailto:hoppin.team@gmail.com" className="text-xs sm:text-sm text-[#6f5a52] hover:text-[#2f231f] transition-colors">hoppin.team@gmail.com</a>
          {/* Instagram */}
          <a href="https://www.instagram.com/hoppin.mobility/" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-[#6f5a52] hover:text-[#2f231f] transition-colors">Instagram — @hoppin.mobility</a>
        </div>
      </footer>
    </div>
  );
}
