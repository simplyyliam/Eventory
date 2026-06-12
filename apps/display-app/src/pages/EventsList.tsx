import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@app/shared";

export const EventsList = () => {
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSlug = slug.trim().toLowerCase();

    if (!cleanSlug) return;

    navigate(`/events/${cleanSlug}`);
  };

  return (
    <div className="flex flex-col items-center justify-center w-200 h-120 bg-card font-dmSans shadow-[0px_16px_50px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-9 items-center justify-center">
        <div className="flex flex-col gap-2.5 text-center">
          <span className="text-[30px] font-semibold">Eventory</span>
          <span className="text-[15px] text-muted-foreground font-medium">
            Enter your event slug to continue
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <Input
            placeholder="event-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="text-center w-52.5 rounded-xl px-2.5 py-3.75 bg-[#E9E9E9]"
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