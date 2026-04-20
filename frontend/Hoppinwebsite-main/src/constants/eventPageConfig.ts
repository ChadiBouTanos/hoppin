import { HoppinEvent } from "../types";

const EVENT_PAGE_CONFIG: Record<string, Partial<HoppinEvent>> = {
  "nameless-festival-2025": {
    location: "Lago di Como",
    customCTA: "Invia richiesta passaggio",
    themeColor: "#fe6e5a",
    coverStyle: "split",
    customSections: [
      {
        id: "parking",
        title: "Info Parcheggi",
        content: "Arriva in condivisione e riduci i tempi di ingresso nelle aree di parcheggio principali.",
      },
      {
        id: "access",
        title: "Accessi",
        content: "I punti di ritrovo consigliati vengono condivisi dopo la registrazione.",
      },
    ],
  },
};

export function withEventPageConfig(event: HoppinEvent): HoppinEvent {
  const config = EVENT_PAGE_CONFIG[event.slug] || {};
  return {
    ...event,
    ...config,
    sponsorLogos: config.sponsorLogos ?? event.sponsorLogos,
    partnerLogos: config.partnerLogos ?? event.partnerLogos,
    customSections: config.customSections ?? event.customSections,
  };
}

