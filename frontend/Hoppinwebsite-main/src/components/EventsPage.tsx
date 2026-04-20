import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../images/logo.png";
import { HoppinEvent, User } from "../types";

type EventsPageProps = {
  events: HoppinEvent[];
  onOpenEvent: (slug: string) => void;
  onGoToOrganizers: () => void;
  onLogin?: () => void;
  user?: User | null;
  onLogout?: () => void;
  onGoToAdmin?: () => void;
};

export function EventsPage({
  events,
  onOpenEvent,
  onGoToOrganizers,
  onLogin,
  user,
  onLogout,
  onGoToAdmin,
}: EventsPageProps) {
  const isLoggedIn = !!user;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const eventsSectionRef = useRef<HTMLElement>(null);
  const eventsCarouselRef = useRef<HTMLDivElement>(null);
  const [eventsScrollLeft, setEventsScrollLeft] = useState(0);
  const [eventsMaxScroll, setEventsMaxScroll] = useState(0);
  const activeEvents = events.filter((ev) => ev.isActive);
  const eventsScrollProgress = eventsMaxScroll > 0 ? eventsScrollLeft / eventsMaxScroll : 0;
  const eventsCurrentIndex = activeEvents.length > 0
    ? Math.min(activeEvents.length, Math.max(1, Math.round(eventsScrollProgress * (activeEvents.length - 1)) + 1))
    : 0;

  useEffect(() => {
    const onWindowScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  const getEventsStep = () => {
    const scroller = eventsCarouselRef.current;
    if (!scroller) return 320;
    const firstCard = scroller.querySelector<HTMLElement>("[data-event-card]");
    if (!firstCard) return Math.max(280, Math.round(scroller.clientWidth * 0.85));
    const scrollerStyle = window.getComputedStyle(scroller);
    const gap = Number.parseFloat(scrollerStyle.gap || scrollerStyle.columnGap || "0") || 0;
    return firstCard.offsetWidth + gap;
  };

  const scrollEventsByStep = (direction: -1 | 1) => {
    const scroller = eventsCarouselRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: getEventsStep() * direction,
      behavior: "smooth",
    });
  };

  const scrollToEventIndex = (index: number) => {
    const scroller = eventsCarouselRef.current;
    if (!scroller) return;
    const safeIndex = Math.max(0, Math.min(index, activeEvents.length - 1));
    scroller.scrollTo({
      left: getEventsStep() * safeIndex,
      behavior: "smooth",
    });
  };

  const onEventsScrollerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollEventsByStep(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollEventsByStep(-1);
    }
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
    scroller.addEventListener("scroll", syncScrollMetrics, { passive: true });
    window.addEventListener("resize", syncScrollMetrics);

    const resizeObserver = new ResizeObserver(syncScrollMetrics);
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", syncScrollMetrics);
      window.removeEventListener("resize", syncScrollMetrics);
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

    window.addEventListener("scroll", onWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [activeEvents.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7ee] via-white to-[#fff1dc]/40">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/60" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <button onClick={onGoToOrganizers} className="flex items-center gap-2">
            <img src={logo} alt="Hoppin" className="h-8 w-auto" />
          </button>

          <div className="hidden md:flex items-center justify-center gap-8">
            <button onClick={onGoToOrganizers} className="text-base font-semibold text-[#6f5a52] hover:text-[#2f231f] transition-colors">
              Per organizzatori
            </button>
            <span className="text-base font-semibold text-[#2f231f]">Eventi</span>
          </div>

          <div className="hidden md:flex items-center justify-end gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-base font-semibold text-[#6f5a52] hidden lg:inline">{user?.firstName}</span>
                {onGoToAdmin && <button onClick={onGoToAdmin} className="btn-ghost text-base font-semibold">Pannello Admin</button>}
                {onLogout && <button onClick={onLogout} className="btn-ghost text-base font-semibold text-red-600">Esci</button>}
              </>
            ) : (
              onLogin && <button onClick={onLogin} className="btn-primary">Log in</button>
            )}
          </div>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden col-start-3 flex flex-col gap-1.5 p-3 -mr-2 active:bg-black/5 rounded-xl"
          >
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-[#2f231f] transition-all duration-300 ${mobileMenu ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/60 px-5 py-5 space-y-1">
            <button
              onClick={() => { setMobileMenu(false); onGoToOrganizers(); }}
              className="block w-full text-left font-semibold text-[#6f5a52] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
            >
              Per organizzatori
            </button>
            <button
              onClick={() => setMobileMenu(false)}
              className="block w-full text-left font-semibold text-[#2f231f] py-3 px-3 rounded-xl active:bg-[#fe6e5a]/10 transition-colors text-base"
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
              onLogin && (
                <button
                  onClick={() => { setMobileMenu(false); onLogin(); }}
                  className="btn-primary mt-3 w-full justify-center"
                >
                  Log in
                </button>
              )
            )}
          </div>
        )}
      </nav>

      <section id="eventi" ref={eventsSectionRef} className="pt-24 sm:pt-32 md:pt-40 pb-14 sm:pb-20 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mt-4 mb-10 sm:mb-16">
            <span className="text-base sm:text-base font-bold tracking-widest uppercase text-[#fe6e5a]">Eventi</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2f231f] mt-3 mb-3 sm:mb-4">
              Trova o offri un passaggio per il tuo prossimo evento
            </h1>
            <p className="text-base sm:text-lg text-[#6f5a52] max-w-2xl mx-auto">
              Seleziona un evento e registrati in pochi secondi.
            </p>
          </div>

          {activeEvents.length === 0 ? (
            <div className="glass-panel p-8 sm:p-10 text-center max-w-2xl mx-auto">
              <CalendarCheck className="w-10 h-10 text-[#fe6e5a] mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-[#2f231f] mb-2">Nessun evento disponibile</h3>
              <p className="text-base text-[#6f5a52]">Torna presto per vedere i prossimi eventi pubblicati.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[#6f5a52]">Scorri la pagina o usa i controlli per muoverti tra gli eventi.</p>
                  <p className="text-xs text-[#6f5a52]/80 mt-1">Suggerimento: puoi anche trascinare le card o usare i tasti freccia.</p>
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
                      onClick={() => onOpenEvent(ev.slug)}
                      data-event-card
                      className="glass-card overflow-hidden text-left w-[280px] sm:w-[340px] flex-shrink-0 group hover:scale-[1.02] transition-transform duration-300 snap-start"
                    >
                      {ev.imageUrl ? (
                        <div className="h-44 sm:h-48 overflow-hidden">
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-44 sm:h-48 bg-gradient-to-br from-[#fe6e5a]/20 to-[#ffd6aa]/40 flex items-center justify-center">
                          <CalendarCheck className="w-12 h-12 text-[#fe6e5a]/40" />
                        </div>
                      )}
                      <div className="p-5 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold text-[#2f231f] mb-2 group-hover:text-[#fe6e5a] transition-colors">
                          {ev.title}
                        </h2>
                        <p className="text-sm text-[#6f5a52] line-clamp-2 leading-relaxed mb-4">{ev.description}</p>
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
                          className={`h-2.5 rounded-full transition-all ${
                            isActive ? "w-8 bg-[#fe6e5a]" : "w-2.5 bg-[#2f231f]/25 hover:bg-[#2f231f]/40"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

