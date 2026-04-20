import { useEffect, useState } from "react";
import { api } from "../services/api";
import { EventRegistrationPayload, HoppinEvent } from "../types";
import { withEventPageConfig } from "../constants/eventPageConfig";
import { EventPageTemplate } from "./EventPageTemplate";

type EventDetailPageProps = {
  slug: string;
  onBackToEvents: () => void;
  onGoToOrganizers: () => void;
};

export function EventDetailPage({
  slug,
  onBackToEvents,
  onGoToOrganizers,
}: EventDetailPageProps) {
  const [event, setEvent] = useState<HoppinEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .getEventBySlug(slug)
      .then((data) => {
        if (!alive) return;
        setEvent(withEventPageConfig(data));
      })
      .catch(() => {
        if (!alive) return;
        setEvent(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const handleRegister = async (payload: EventRegistrationPayload) => {
    await api.registerForEvent(payload);
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="text-lg text-[#6f5a52]">Evento non trovato</p>
        <button onClick={onBackToEvents} className="btn-primary">
          Torna alla lista eventi
        </button>
      </div>
    );
  }

  return (
    <EventPageTemplate
      event={event}
      onBackToEvents={onBackToEvents}
      onGoToOrganizers={onGoToOrganizers}
      onSubmitRegistration={handleRegister}
    />
  );
}

