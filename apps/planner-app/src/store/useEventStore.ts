import type { Event, EventMetadata } from '@/types/event';
import localforage from 'localforage';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import { createSlug } from '@app/shared';
import axios from 'axios';
import { API_BASE_URL } from '@app/shared/utils/api';

type EventStatus = 'draft' | 'published' | 'archived';

type EventStore = {
  events: Event[];
  activeEvent: Event | null;
  createEvent: (name?: string) => Promise<Event>;
  openEvent: (eventId: string) => Event | null;
  setActiveEvent: (event: Event) => void;
  updateEvent: (data: Partial<Event>) => void;
  setStatus: (status: EventStatus) => void;
  updateMetadata: (metadata: Partial<EventMetadata>) => void;
  deleteEvent: (eventId: string, slug: string) => Promise<void>;
  renameEvent: (eventId: string, slug: string, name: string) => Promise<void>;
  reset: () => void;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      activeEvent: null,

      createEvent: async (name = 'Untitled Event') => {
        const { data: event } = await axios.post(`${API_BASE_URL}/events/create`, { name })
        set((state) => ({
          events: [...state.events, event],
          activeEvent: event,
        }));
        return event;
      },

      openEvent: (eventId) => {
        const event = get().events.find((item) => item.id === eventId) ?? null;
        set({ activeEvent: event });
        return event;
      },

      setActiveEvent: (event) => set({ activeEvent: event }),

      updateEvent: (data) => {
        const current = get().activeEvent;
        if (!current) return;
        const updatedEvent = {
          ...current,
          ...data,
          slug: data.name ? createSlug(data.name) : (data.slug ?? current.slug),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          activeEvent: updatedEvent,
          events: state.events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event,
          ),
        }));
      },

      setStatus: (status) => {
        get().updateEvent({ status });
      },

      updateMetadata: (metadata) => {
        const current = get().activeEvent;
        if (!current) return;
        get().updateEvent({
          metadata: {
            contactEmail: '',
            comment: '',
            dietary: [],
            ...current.metadata,
            ...metadata,
          },
        });
      },

      deleteEvent: async (eventId, slug) => {
        await axios.delete(`${API_BASE_URL}/events/${slug}`)
        set((state) => ({
          events: state.events.filter((e) => e.id !== eventId),
          activeEvent: state.activeEvent?.id === eventId ? null : state.activeEvent,
        }))
      },

      renameEvent: async (eventId, slug, name) => {
        const { data } = await axios.patch(`${API_BASE_URL}/events/${slug}`, { name })
        set((state) => ({
          events: state.events.map((e) => e.id === eventId ? { ...e, ...data } : e),
          activeEvent: state.activeEvent?.id === eventId ? { ...state.activeEvent, ...data } : state.activeEvent,
        }))
      },

      reset: () => set({ activeEvent: null }),
    }),
    {
      name: 'event-store',
      storage: createJSONStorage(
        (): StateStorage => ({
          getItem: (name) => localforage.getItem<string>(name),
          setItem: async (name, value) => {
            await localforage.setItem(name, value);
          },
          removeItem: (name) => localforage.removeItem(name),
        }),
      ),
    },
  ),
);