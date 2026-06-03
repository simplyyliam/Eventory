import type { Event } from '@/types/event';
import { create } from 'zustand';

type EventStatus = 'draft' | 'published' | 'archived';

type EventStore = {
  activeEvent: Event | null;
  setActiveEvent: (event: Event) => void;
  updateEvent: (data: Partial<Event>) => void;
  setStatus: (status: EventStatus) => void;
  reset: () => void;
};

export const useEventStore = create<EventStore>((set, get) => ({
  activeEvent: null,

  setActiveEvent: (event) =>
    set({
      activeEvent: event,
    }),

  updateEvent: (data) => {
    const current = get().activeEvent;
    if (!current) return;

    set({
      activeEvent: {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setStatus: (status) => {
    const current = get().activeEvent;
    if (!current) return;

    set({
      activeEvent: {
        ...current,
        status,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  reset: () =>
    set({
      activeEvent: null,
    }),
}));
