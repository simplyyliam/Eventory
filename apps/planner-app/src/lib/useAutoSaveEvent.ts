import { useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@app/shared/utils/api";
import { useEventStore } from "@/store/useEventStore";
import { useTableStore } from "@/store/useTableStore";
import { useGuestStore } from "@/store/useGuestStore";

export const useAutoSaveEvent = (slug?: string) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const event = useEventStore((s) => s.activeEvent);
  const tables = useTableStore((s) => s.tables);
  const guests = useGuestStore((s) => s.guests);

  // Core execution function to trigger the actual network save
  const executeSave = async (isManual = false) => {
    if (!slug || !event) return;

    // Use Sonner's id overriding feature so notifications update smoothly in place
    const toastId = "layout-save-status";
    toast.loading(isManual ? "Saving layout..." : "Auto-saving changes...", { id: toastId });

    try {
      await axios.patch(`${API_BASE_URL}/internal/events/${slug}`, {
        name: event.name,
        metadata: event.metadata,
        tables,
        guests,
      });

      toast.success(isManual ? "Layout saved manually!" : "Changes auto-saved", {
        id: toastId,
        description: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save layout configuration", { id: toastId });
    }
  };

  // BACKGROUND AUTOSAVE DEBOUNCE (Extended to 3 Seconds)
  useEffect(() => {
    if (!slug || !event) return;

    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      executeSave(false);
    }, 3000); 

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [slug, event, tables, guests]);

  // FORCE SAVE KEYBOARD SHORTCUT (Ctrl + S / Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isSaveKey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !e.shiftKey;
      
      if (isSaveKey) {
        e.preventDefault(); 
        
        // Wipe out any pending auto-save timers so we don't fire twice back-to-back
        if (timeout.current) clearTimeout(timeout.current);
        
        executeSave(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slug, event, tables, guests]);
};