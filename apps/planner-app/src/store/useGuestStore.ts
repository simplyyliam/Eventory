import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import localforage from 'localforage';

export type Guest = {
  id: string;
  name: string;
  email: string | null;
  dietary: string[];
  comments: string | null;
  status: string;
  seat: string | null;
  tableId: string | null;
  eventId: string;
}

export type GuestInput = {
  name: string;
  email?: string | null;
  dietary?: string[];
  comments?: string | null;
}

type GuestStore = {
  activeEventId: string | null;
  guests: Guest[];
  guestsByEventId: Record<string, Guest[]>;
  setActiveEvent: (eventId: string) => void;
  setGuests: (eventId: string, guests: Guest[]) => void;
  addGuest: (guest: GuestInput) => void;
  removeGuest: (guestId: string) => void;
  seatGuest: (guestId: string, tableId: string, seatId: string) => void;
  unseatGuest: (guestId: string) => void;
  updateGuest: (guestId: string, updatedGuest: GuestInput) => void;
};

const updateEventGuests = (
  activeEventId: string | null,
  guestsByEventId: Record<string, Guest[]>,
  guests: Guest[],
) => {
  if (!activeEventId) return { guests }

  return {
    guests,
    guestsByEventId: {
      ...guestsByEventId,
      [activeEventId]: guests,
    },
  }
}

export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      activeEventId: null,
      guests: [],
      guestsByEventId: {},

      setActiveEvent: (eventId) => {
        const state = get()
        set({
          activeEventId: eventId,
          guests: state.guestsByEventId[eventId] ?? [],
        })
      },

      setGuests: (eventId, guests) => {
        set({
          activeEventId: eventId,
          guests,
          guestsByEventId: {
            ...get().guestsByEventId,
            [eventId]: guests,
          },
        })
      },

      addGuest: (input) => {
        const state = get()
        const newGuest: Guest = {
          id: crypto.randomUUID(),
          name: input.name,
          email: input.email ?? null,
          dietary: input.dietary ?? [],
          comments: input.comments ?? null,
          status: 'pending',
          seat: null,
          tableId: null,
          eventId: state.activeEventId ?? '',
        }
        const guests = [...state.guests, newGuest]
        set(updateEventGuests(state.activeEventId, state.guestsByEventId, guests))
      },

      removeGuest: (guestId) => {
        const state = get()
        const guests = state.guests.filter((g) => g.id !== guestId)
        set(updateEventGuests(state.activeEventId, state.guestsByEventId, guests))
      },

      seatGuest: (guestId, tableId, seatId) => {
        const state = get()
        const guests = state.guests.map((g) =>
          g.id === guestId
            ? { ...g, tableId, seat: seatId, status: 'confirmed' }
            : g
        )
        set(updateEventGuests(state.activeEventId, state.guestsByEventId, guests))
      },

      unseatGuest: (guestId) => {
        const state = get()
        const guests = state.guests.map((g) =>
          g.id === guestId
            ? { ...g, tableId: null, seat: null, status: 'pending' }
            : g
        )
        set(updateEventGuests(state.activeEventId, state.guestsByEventId, guests))
      },

      updateGuest: (guestId, input) => {
        const state = get()
        const guests = state.guests.map((g) =>
          g.id === guestId
            ? {
                ...g,
                name: input.name,
                email: input.email ?? null,
                dietary: input.dietary ?? [],
                comments: input.comments ?? null,
              }
            : g
        )
        set(updateEventGuests(state.activeEventId, state.guestsByEventId, guests))
      },
    }),
    {
      name: 'guest-store',
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as GuestStore
        return {
          ...state,
          activeEventId: state.activeEventId ?? null,
          guests: state.guests ?? [],
          guestsByEventId: state.guestsByEventId ?? {},
        }
      },
      storage: createJSONStorage(
        (): StateStorage => ({
          getItem: (name) => localforage.getItem<string>(name),
          setItem: async (name, value) => {
            await localforage.setItem(name, value)
          },
          removeItem: (name) => localforage.removeItem(name),
        }),
      ),
    },
  ),
)