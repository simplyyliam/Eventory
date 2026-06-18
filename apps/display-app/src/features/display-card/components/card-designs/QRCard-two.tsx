import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { EventResponse } from "@app/shared/types/event.types";
import { getPublicEventBySlug } from "@app/shared/utils/publicEvent";
import { QRCode } from "../QRCode";

export const QRCodeTwo = () => {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [error, setError] = useState(false);

  const isLoading = !event && !error;

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const loadEvent = async () => {
      try {
        const data = await getPublicEventBySlug(slug);

        if (!cancelled) {
          setEvent(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(true);
        }
        console.error(err);
      }
    };

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-240 h-120 font-dmSans">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center w-240 h-120 font-dmSans text-muted-foreground">
        Event not found
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-139.5 h-181 justify-between gap-2.5 p-10 rounded-2xl capitalize font-dmSans bg-accent card">
      <span className="text-[20px] font-medium">{`Welcome to ${event.name}`}</span>
      <div className="flex items-center justify-center w-full h-full">
        <QRCode
          value={`https://eventory-guest-app.vercel.app/events/${event.slug}`}
          />
      </div>
      <span className="text-[15px] font-medium">Scan the QR Code above to find your table</span>
    </div>
  );
};