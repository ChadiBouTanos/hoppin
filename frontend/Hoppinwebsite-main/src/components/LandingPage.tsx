import { useState, useEffect, useRef } from 'react';
import {
  Car,
  Users,
  Leaf,
  ThumbsUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import teamPhoto from '../images/team.jpeg';
import { HoppinEvent, User } from '../types';

interface LandingPageProps {
  onLogin?: () => void;
  onSignUp?: () => void;
  events?: HoppinEvent[];
  onEventClick?: (slug: string) => void;
  onGoToEvents?: () => void;
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
export function LandingPage({ onLogin, onSignUp, events = [], onEventClick, onGoToEvents, user, onLogout, onGoToAdmin }: LandingPageProps) {
  const isLoggedIn = !!user;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const eventsSectionRef = useRef<HTMLElement>(null);
  const eventsCarouselRef = useRef<HTMLDivElement>(null);
  const trustCarouselRef = useRef<HTMLDivElement>(null);
  const [eventsScrollLeft, setEventsScrollLeft] = useState(0);
  const [eventsMaxScroll, setEventsMaxScroll] = useState(0);
  const [trustScrollLeft, setTrustScrollLeft] = useState(0);
  const [trustMaxScroll, setTrustMaxScroll] = useState(0);

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

  const trustItems = [
    {
      title: 'TEF Ignition 2026',
      description: 'Startup selezionata nel programma TEF Ignition',
      type: 'recognition' as const,
      link: 'https://tef.tech/',
    },
    {
      title: 'Corriere della Sera',
      description: 'Milano: l’app del Politecnico che dà un passaggio a studenti e lavoratori',
      type: 'press' as const,
      link: 'https://milano.corriere.it/notizie/cronaca/25_dicembre_25/milano-l-app-del-politecnico-che-da-un-passaggio-a-studenti-e-lavoratori-per-risparmiare-tempo-e-denaro-f0ba5e45-8ab6-4cb4-8f6c-4bc77d569xlk.shtml',
    },
    {
      title: 'IULM - MasterX',
      description: 'Articolo e pubblicazione accademica su Hoppin',
      type: 'press' as const,
      link: 'https://masterx.iulm.it/wp-content/uploads/2026/01/QUINDI-23-GENNAIO-2026-okok.pdf',
    },
  ];

  const activeEvents = events.filter(ev => ev.isActive);
  const eventsScrollProgress = eventsMaxScroll > 0 ? eventsScrollLeft / eventsMaxScroll : 0;
  const eventsCurrentIndex = activeEvents.length > 0
    ? Math.min(
      activeEvents.length,
      Math.max(1, Math.round(eventsScrollProgress * (activeEvents.length - 1)) + 1),
    )
    : 0;
  const trustScrollProgress = trustMaxScroll > 0 ? trustScrollLeft / trustMaxScroll : 0;
  const trustCurrentIndex = trustItems.length > 0
    ? Math.min(
      trustItems.length,
      Math.max(1, Math.round(trustScrollProgress * (trustItems.length - 1)) + 1),
    )
    : 0;

  const getCarouselStep = (scroller: HTMLDivElement | null, cardSelector: string) => {
    if (!scroller) return 320;
    const firstCard = scroller.querySelector<HTMLElement>(cardSelector);
    if (!firstCard) return Math.max(280, Math.round(scroller.clientWidth * 0.85));
    const scrollerStyle = window.getComputedStyle(scroller);
    const gap = Number.parseFloat(scrollerStyle.gap || scrollerStyle.columnGap || '0') || 0;
    return firstCard.offsetWidth + gap;
  };

  const scrollCarouselByStep = (scroller: HTMLDivElement | null, direction: -1 | 1, cardSelector: string) => {
    if (!scroller) return;
    scroller.scrollBy({
      left: getCarouselStep(scroller, cardSelector) * direction,
      behavior: 'smooth',
    });
  };

  const scrollEventsByStep = (direction: -1 | 1) => {
    scrollCarouselByStep(eventsCarouselRef.current, direction, '[data-event-card]');
  };

  const scrollTrustByStep = (direction: -1 | 1) => {
    scrollCarouselByStep(trustCarouselRef.current, direction, '[data-trust-card]');
  };

  const scrollToEventIndex = (index: number) => {
    const scroller = eventsCarouselRef.current;
    if (!scroller) return;
    const safeIndex = Math.max(0, Math.min(index, activeEvents.length - 1));
    scroller.scrollTo({
      left: getCarouselStep(scroller, '[data-event-card]') * safeIndex,
      behavior: 'smooth',
    });
  };

  const scrollToTrustIndex = (index: number) => {
    const scroller = trustCarouselRef.current;
    if (!scroller) return;
    const safeIndex = Math.max(0, Math.min(index, trustItems.length - 1));
    scroller.scrollTo({
      left: getCarouselStep(scroller, '[data-trust-card]') * safeIndex,
      behavior: 'smooth',
    });
  };

  const onCarouselKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    scroller: HTMLDivElement | null,
    cardSelector: string,
  ) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollCarouselByStep(scroller, 1, cardSelector);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollCarouselByStep(scroller, -1, cardSelector);
    }
  };

  const onEventsScrollerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onCarouselKeyDown(event, eventsCarouselRef.current, '[data-event-card]');
  };

  const onTrustScrollerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onCarouselKeyDown(event, trustCarouselRef.current, '[data-trust-card]');
  };

  useEffect(() => {
    const scroller = eventsCarouselRef.current;
    if (!scroller) return;

    const syncScrollMetrics = () => {
      const max = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
      setEventsMaxScroll(max);
      setEventsScrollLeft(Math.min(scroller.scrollLeft, max));
    };

    syncScrollMetrics();
    scroller.addEventListener('scroll', syncScrollMetrics, { passive: true });
    window.addEventListener('resize', syncScrollMetrics);

    const resizeObserver = new ResizeObserver(syncScrollMetrics);
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener('scroll', syncScrollMetrics);
      window.removeEventListener('resize', syncScrollMetrics);
      resizeObserver.disconnect();
    };
  }, [activeEvents.length]);

  useEffect(() => {
    const section = eventsSectionRef.current;
    const scroller = eventsCarouselRef.current;
    if (!section || !scroller || activeEvents.length < 2) return;

    let lastWindowScrollY = window.scrollY;
    let rafId = 0;

    const isSectionVisible = () => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.15;
    };

    const onWindowScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const currentWindowScrollY = window.scrollY;
        const deltaY = currentWindowScrollY - lastWindowScrollY;
        lastWindowScrollY = currentWindowScrollY;

        if (Math.abs(deltaY) < 1 || !isSectionVisible()) return;
        const max = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
        if (max <= 0) return;

        const next = Math.max(0, Math.min(max, scroller.scrollLeft + deltaY * 1.05));
        scroller.scrollLeft = next;
      });
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [activeEvents.length]);

  useEffect(() => {
    const scroller = trustCarouselRef.current;
    if (!scroller) return;

    const syncScrollMetrics = () => {
      const max = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
      setTrustMaxScroll(max);
      setTrustScrollLeft(Math.min(scroller.scrollLeft, max));
    };

    syncScrollMetrics();
    scroller.addEventListener('scroll', syncScrollMetrics, { passive: true });
    window.addEventListener('resize', syncScrollMetrics);

    const resizeObserver = new ResizeObserver(syncScrollMetrics);
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener('scroll', syncScrollMetrics);
      window.removeEventListener('resize', syncScrollMetrics);
      resizeObserver.disconnect();
    };
  }, [trustItems.length]);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <img src={logo} alt="Hoppin" className="h-8 w-auto" />
          </button>

          {/* desktop nav */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-base font-semibold text-[#2f231f]"
            >
              Per organizzatori
            </button>
            <button
              onClick={() => (onGoToEvents ? onGoToEvents() : scrollTo('eventi'))}
              className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors"
            >
              Eventi
            </button>
            <button onClick={() => scrollTo('contact')} className="btn-primary">
              Richiedi demo
            </button>
          </div>

          <div className="hidden md:flex items-center justify-end gap-4">
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
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden col-start-3 flex flex-col gap-1.5 p-3 -mr-2 active:bg-black/5 rounded-xl">
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/60 px-5 py-5 space-y-1">
            <button
              onClick={() => { setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="block w-full text-left font-semibold text-[#2f231f] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
            >
              Per organizzatori
            </button>
            <button
              onClick={() => { setMobileMenu(false); onGoToEvents ? onGoToEvents() : scrollTo('eventi'); }}
              className="block w-full text-left font-semibold text-[#6f5a52] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
            >
              Eventi
            </button>
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
      <section className="pt-28 sm:pt-36 md:pt-44 pb-14 sm:pb-20">
        <FadeIn>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a] mb-5 sm:mb-6">
              Mobilità per grandi eventi
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight tracking-tight text-[#2f231f] mb-4 sm:mb-6 max-w-5xl">
              Riduci le auto in ingresso prima che il traffico diventi un problema
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#6f5a52] max-w-4xl mb-8 sm:mb-10 leading-relaxed">
              Hoppin aiuta gli organizzatori ad attivare il carpooling tra partecipanti subito dopo l'acquisto del ticket. Meno auto in ingresso, meno pressione sui parcheggi, più controllo sui flussi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={() => scrollTo('contact')} className="btn-primary btn-primary-lg group w-full sm:w-auto justify-center">
                Richiedi una demo
              </button>
              <button
                onClick={() => (onGoToEvents ? onGoToEvents() : scrollTo('eventi'))}
                className="btn-secondary btn-primary-lg w-full sm:w-auto justify-center"
              >
                Esplora gli eventi attivi
              </button>
            </div>
          </div>
        </FadeIn>

        {/* scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <ChevronDown className="w-6 h-6 text-[#6f5a52]/40" />
        </div>
      </section>

      {/* ═══════════════════════ PROBLEM ═══════════════════════ */}
      <section id="about" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mt-4 mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Il problema</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                Il problema non è l'evento. È come ci arrivano le persone.
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Traffico in ingresso, parcheggi saturi e accessi congestionati peggiorano l'esperienza e aumentano la complessità organizzativa. Le soluzioni tradizionali — navette, ZTL, piani traffico — intervengono quando il caos è già iniziato.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: <TreePine className="w-6 h-6 sm:w-7 sm:h-7" />,
                stat: '5k-50k',
                label: 'Congestione in ingresso',
                desc: "Migliaia di auto che arrivano nello stesso intervallo di tempo saturano gli accessi e generano code che danneggiano l'esperienza prima ancora di entrare.",
              },
              {
                icon: <TrafficCone className="w-6 h-6 sm:w-7 sm:h-7" />,
                stat: 'B2B',
                label: 'Parcheggi sotto pressione',
                desc: 'La capacità dei parcheggi viene raggiunta o superata a ogni grande evento. Il risultato è caos organizzativo, residenti danneggiati e reputazione a rischio.',
              },
              {
                icon: <ParkingCircle className="w-6 h-6 sm:w-7 sm:h-7" />,
                stat: 'Prima',
                label: 'Soluzioni troppo tardive',
                desc: 'ZTL, navette e piani traffico agiscono a problema esploso. Non riducono il numero di auto: le gestiscono dopo che il danno è già fatto.',
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
                Il momento giusto per attivare il carpooling è subito dopo il ticket
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Hoppin si inserisce nel flusso post-acquisto, quando il partecipante sta ancora pianificando il viaggio. È lì che si riduce il numero di auto, non il giorno dell'evento.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: <Car className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Attivazione post-acquisto',
                desc: "La pagina Hoppin viene integrata nel percorso dell'evento subito dopo il biglietto. Il partecipante può cercare o offrire un passaggio mentre pianifica ancora.",
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Leaf className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: 'Meno auto in ingresso',
                desc: "Ogni match riduce un'auto. Con volumi alti, l'effetto sui flussi in ingresso diventa misurabile e documentabile per l'organizzatore.",
                color: 'bg-green-100 text-green-700',
              },
              {
                icon: <ThumbsUp className="w-7 h-7 sm:w-8 sm:h-8" />,
                title: "Dati sui flussi per l'organizzatore",
                desc: "L'organizzatore ottiene visibilità su quante persone condividono il viaggio, da dove partono e in quali fasce orarie arrivano.",
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

      {/* ═══════════════════════ EVENTS ═══════════════════════ */}
      {true && (
        <section id="eventi" ref={eventsSectionRef} className="pt-24 sm:pt-32 md:pt-40 pb-14 sm:pb-20 md:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mt-4 mb-10 sm:mb-16">
                <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Eventi pilota</span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                  Come appare Hoppin lato partecipante
                </h2>
                <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                  Ogni organizzatore può attivare una pagina evento personalizzata. Questi sono alcuni esempi reali: mostrano come Hoppin convoglia la domanda, raccoglie dati e facilita la condivisione del viaggio.
                </p>
              </div>
            </FadeIn>

            {activeEvents.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#6f5a52]">
                      Scorri la pagina o usa i controlli per muoverti tra gli eventi.
                    </p>
                    <p className="text-xs text-[#6f5a52]/80 mt-1">
                      Suggerimento: puoi anche trascinare le card o usare i tasti freccia.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollEventsByStep(-1)}
                      disabled={eventsScrollLeft <= 0}
                      aria-label="Scorri eventi verso sinistra"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#2f231f]/15 bg-white/80 text-[#2f231f] transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollEventsByStep(1)}
                      disabled={eventsScrollLeft >= eventsMaxScroll - 1}
                      aria-label="Scorri eventi verso destra"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#2f231f]/15 bg-white/80 text-[#2f231f] transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="overflow-hidden [mask-image:linear-gradient(to_right,black_0,black_94%,transparent)]">
                  <div
                    ref={eventsCarouselRef}
                    role="region"
                    aria-label="Carosello eventi"
                    tabIndex={0}
                    onKeyDown={onEventsScrollerKeyDown}
                    className="flex gap-4 sm:gap-6 py-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [touch-action:pan-x]"
                  >
                    {activeEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => onEventClick?.(ev.slug)}
                        data-event-card
                        className="glass-card overflow-hidden text-left w-[280px] sm:w-[340px] flex-shrink-0 group hover:scale-[1.02] transition-transform duration-300 snap-start"
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
                            Apri pagina evento
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {eventsMaxScroll > 0 && (
                  <div className="mt-5 px-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-[#6f5a52] min-w-[44px] text-right">
                        {eventsCurrentIndex}/{activeEvents.length}
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-[#2f231f]/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#fe6e5a] transition-all duration-200"
                          style={{ width: `${Math.max(eventsScrollProgress * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {activeEvents.map((eventItem, index) => {
                        const isActive = index + 1 === eventsCurrentIndex;
                        return (
                          <button
                            key={`events-dot-${eventItem.id}`}
                            type="button"
                            onClick={() => scrollToEventIndex(index)}
                            aria-label={`Vai all'evento ${index + 1}: ${eventItem.title}`}
                            aria-pressed={isActive}
                            className={`h-2.5 rounded-full transition-all ${isActive
                              ? 'w-8 bg-[#fe6e5a]'
                              : 'w-2.5 bg-[#2f231f]/25 hover:bg-[#2f231f]/40'
                              }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel p-6 sm:p-10 text-center max-w-2xl mx-auto">
                <CalendarCheck className="w-10 h-10 text-[#fe6e5a] mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-[#2f231f] mb-2">Nuovi eventi in arrivo</h3>
                <p className="text-base text-[#6f5a52]">
                  Stiamo preparando le prossime pagine evento-specifiche.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      
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
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 gap-4 snap-x snap-mandatory sm:snap-none scrollbar-hide">
              {[
                { icon: <Handshake className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Attiviamo la pagina evento', desc: 'Configuriamo una pagina dedicata con il branding dell\'evento, pronta a raccogliere domanda.' },
                { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'I partecipanti cercano o offrono un passaggio', desc: 'Subito dopo il ticket, ogni partecipante può registrarsi e trovare chi parte dalla sua zona.' },
                { icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />, label: 'Hoppin convoglia la domanda', desc: "L'algoritmo crea i match e raccoglie dati sui flussi in ingresso in tempo reale." },
                { icon: <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />, label: "L'organizzatore ottiene controllo", desc: 'Dashboard con auto risparmiate, origini geografiche e fasce orarie di arrivo.' },
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <div className="relative text-center min-w-[120px] snap-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fe6e5a]/10 text-[#fe6e5a] mb-3 mx-auto">
                      {step.icon}
                    </div>
                    {i < 3 && (
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
          <FadeIn delay={120}>
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-md bg-white">
                <img
                  src={teamPhoto}
                  alt="Il team Hoppin"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-1">
                {['Leonardo Bulferi Bufferetti', 'Carlo Molinari', 'Nicolò Rota', 'Francesco Sala'].map(name => (
                  <span key={name} className="text-sm font-semibold text-[#2f231f]">{name}</span>
                ))}
              </div>
              <p className="text-sm text-[#6f5a52] text-center max-w-md">
                Quattro co-founder con background complementari, uniti dalla volontà di risolvere un problema concreto per chi organizza grandi eventi.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════ TRUST / RICONOSCIMENTI ═══════════════════════ */}
      <section id="trust" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mt-4 mb-10 sm:mb-16">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Riconoscimenti</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
                Selezionati e citati da realtà rilevanti
              </h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
                Programmi, università e media hanno riportato Hoppin come caso concreto nel tema mobilità.
              </p>
            </div>
          </FadeIn>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#6f5a52]">
                Scorri per vedere programmi e copertura media.
              </p>
              <p className="text-xs text-[#6f5a52]/80 mt-1">
                Puoi usare swipe, drag o i tasti freccia.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTrustByStep(-1)}
                disabled={trustScrollLeft <= 0}
                aria-label="Scorri riconoscimenti verso sinistra"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#2f231f]/15 bg-white/80 text-[#2f231f] transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrustByStep(1)}
                disabled={trustScrollLeft >= trustMaxScroll - 1}
                aria-label="Scorri riconoscimenti verso destra"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[#2f231f]/15 bg-white/80 text-[#2f231f] transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden [mask-image:linear-gradient(to_right,black_0,black_94%,transparent)]">
            <div
              ref={trustCarouselRef}
              role="region"
              aria-label="Carosello riconoscimenti"
              tabIndex={0}
              onKeyDown={onTrustScrollerKeyDown}
              className="flex gap-4 sm:gap-6 py-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [touch-action:pan-x]"
            >
              {trustItems.map((item) => (
                <a
                  key={item.title}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-trust-card
                  aria-label={`Apri ${item.title} in una nuova scheda`}
                  className="glass-card p-5 sm:p-6 text-left w-[280px] sm:w-[340px] flex-shrink-0 group hover:scale-[1.02] transition-transform duration-300 snap-start"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${item.type === 'press'
                      ? 'bg-[#2f231f]/10 text-[#2f231f]'
                      : 'bg-[#fe6e5a]/15 text-[#fe6e5a]'
                      }`}
                    >
                      {item.type === 'press' ? 'Press' : 'Programma'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#6f5a52] transition-transform group-hover:translate-x-1 group-hover:text-[#fe6e5a]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2f231f] mb-2 group-hover:text-[#fe6e5a] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#6f5a52] leading-relaxed">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {trustMaxScroll > 0 && (
            <div className="mt-5 px-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-[#6f5a52] min-w-[44px] text-right">
                  {trustCurrentIndex}/{trustItems.length}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-[#2f231f]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#fe6e5a] transition-all duration-200"
                    style={{ width: `${Math.max(trustScrollProgress * 100, 4)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {trustItems.map((item, index) => {
                  const isActive = index + 1 === trustCurrentIndex;
                  return (
                    <button
                      key={`trust-dot-${item.title}`}
                      type="button"
                      onClick={() => scrollToTrustIndex(index)}
                      aria-label={`Vai al riconoscimento ${index + 1}: ${item.title}`}
                      aria-pressed={isActive}
                      className={`h-2.5 rounded-full transition-all ${isActive
                        ? 'w-8 bg-[#fe6e5a]'
                        : 'w-2.5 bg-[#2f231f]/25 hover:bg-[#2f231f]/40'
                        }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ CTA / CONTACT ═══════════════════════ */}
      <section id="contact" className="py-14 sm:py-20 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="glass-panel p-6 sm:p-10 md:p-16 text-center">
              <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Richiedi una demo</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-4 sm:mb-6">Parliamo del tuo prossimo evento</h2>
              <p className="text-base sm:text-lg text-[#6f5a52] max-w-xl mx-auto mb-8 sm:mb-10">Se stai organizzando un evento con migliaia di partecipanti e sai già che traffico e parcheggi sono un problema, confrontiamoci. Nessun impegno: capiremo insieme se Hoppin ha senso per te.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {/* Email */}
                <a href="mailto:hoppin.team@gmail.com" className="btn-primary btn-primary-lg group w-full sm:w-auto justify-center">
                  <Mail className="w-5 h-5" />Richiedi una demo<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/hoppin-carpooling" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-primary-lg w-full sm:w-auto justify-center">
                  <Linkedin className="w-5 h-5" />LinkedIn
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

