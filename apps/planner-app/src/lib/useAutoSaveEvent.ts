import { useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@app/shared/utils/api";
import { useEventStore } from "@/store/useEventStore";
import { useTableStore } from "@/store/useTableStore";
import { useGuestStore } from "@/store/useGuestStore";

export const useAutoSaveEvent = (slug?: string) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const event = useEventStore((s) => s.activeEvent);
  const tables = useTableStore((s) => s.tables);
  const guests = useGuestStore((s) => s.guests);

  useEffect(() => {
    if (!slug || !event) return;

    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(async () => {
      try {
        await axios.patch(`${API_BASE_URL}/internal/events/${slug}`, {
          name: event.name,
          metadata: event.metadata,
          tables,
          guests,
        });
      } catch (err) {
        console.error("Autosave failed", err);
      }
    }, 800);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [slug, event, tables, guests]);
};