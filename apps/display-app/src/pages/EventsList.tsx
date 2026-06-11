import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EventResponse } from "@app/shared/types/event.types";
import { getEvents } from "@app/shared/lib/getEvents";
import { Input } from "@app/shared";

export const EventsList = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [slug, setSlug] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedEvent = events.find(
      (event) => event.slug.toLowerCase() === slug.toLowerCase()
    );

    if (matchedEvent) {
      navigate(`/events/${matchedEvent.slug}`);
    } else {
      navigate(`/events/${slug}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-200 h-120 bg-card font-dmSans shadow-[0px_16px_50px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-9 items-center justify-center">
        <div className="flex flex-col gap-2.5 text-center">
          <span className="text-[30px] font-semibold">Eventory</span>
          <span className="text-[15px] text-muted-foreground font-medium">
            Please enter your event name below
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center h-fit gap-2.5"
        >
          <Input
            placeholder="Event name"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="text-center w-52.5 h-fit rounded-xl px-2.5 py-3.75 bg-[#E9E9E9]"
          />
        </form>
      </div>
    </div>
  );
};
    //   {events.map((event) => (
    //     <motion.button
    //         key={event.id}
    //         whileTap={{scale: 0.97, y: 1, backgroundColor: "#E7E7E7"}}
    //         transition={{type: "spring", stiffness: 200, damping: 25 }}
    //         onClick={() => navigate(`/events/${event.slug}`)}
    //         className="flex items-center justify-between w-full px-2.5 py-3.5 font-dmSans rounded-[10px]"
    //     >
    //         {event.name}
    //     </motion.button>
    //   ))}