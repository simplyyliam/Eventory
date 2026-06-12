import { useParams } from "react-router-dom";
import { QRCode } from "./QRCode";
import { useEffect, useState } from "react";
import type { EventResponse } from "@app/shared/types/event.types";
import { motion } from "motion/react";
import { getEventBySlug } from "@app/shared/utils/getEventBySlug";

export const DisplayCard = () => {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [error, setError] = useState(false);

  const isLoading = !event && !error;

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const loadEvent = async () => {
      try {
        const data = await getEventBySlug(slug);

        if (!cancelled) {
          setEvent(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(true);
        }
        console.error(err)
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
    <motion.div
      className="flex items-center justify-center w-240 h-120 gap-2.5 p-2.5"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
        },
      }}
    >
      {/* Left panel */}
      <motion.div
        className="flex flex-col text-center font-dmSans items-center justify-center w-200 h-full p-6.25 gap-2.5 bg-card"
        variants={{
          hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
          show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              stiffness: 120,
              damping: 18,
            },
          },
        }}
      >
        <span className="text-[35px] font-semibold">
          Welcome to {event.name}
        </span>

        <span className="text-[25px] font-medium text-muted-foreground">
          Scan the QR code to find your seat and table number
        </span>
      </motion.div>

      {/* Right panel */}
      <motion.div
        className="flex items-center justify-center w-140 h-full bg-card"
        variants={{
          hidden: { opacity: 0, y: 24, filter: "blur(12px)" },
          show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              type: "spring",
              stiffness: 120,
              damping: 18,
            },
          },
        }}
      >
        <QRCode
          value={`https://eventory-guest-app.vercel.app/events/${event.slug}`}
        />
      </motion.div>
    </motion.div>
  );
};