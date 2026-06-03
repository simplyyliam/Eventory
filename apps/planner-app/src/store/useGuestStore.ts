import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import localforage from 'localforage';

type Guest = {
  id: string;
  Name: string;
  Email: string;
  Dietary: string[];
  Comments: string;
};

type GuestInput = Omit<Guest, 'id'>;

type SeatedGuest = {
  guestId: string;
  tableId: string;
  seatId: string;
};

type GuestStore = {
  activeEventId: string | null;
  guests: Guest[];
  seatedGuests: SeatedGuest[];
  guestsByEventId: Record<string, Guest[]>;
  seatedGuestsByEventId: Record<string, SeatedGuest[]>;
  setActiveEvent: (eventId: string) => void;
  addGuest: (guest: GuestInput) => void;
  removeGuest: (guestId: string) => void;
  seatGuest: (guestId: string, tableId: string, seatId: string) => void;
  unseatGuest: (guestId: string) => void;
  updateGuest: (guestId: string, updatedGuest: GuestInput) => void;
};

const updateEventGuests = (
  activeEventId: string | null,
  guestsByEventId: Record<string, Guest[]>,
  seatedGuestsByEventId: Record<string, SeatedGuest[]>,
  guests: Guest[],
  seatedGuests: SeatedGuest[],
) => {
  if (!activeEventId) {
    return {
      guests,
      seatedGuests,
    };
  }

  return {
    guests,
    seatedGuests,
    guestsByEventId: {
      ...guestsByEventId,
      [activeEventId]: guests,
    },
    seatedGuestsByEventId: {
      ...seatedGuestsByEventId,
      [activeEventId]: seatedGuests,
    },
  };
};

export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      activeEventId: null,
      guests: [],
      seatedGuests: [],
      guestsByEventId: {},
      seatedGuestsByEventId: {},

      setActiveEvent: (eventId) => {
        const state = get();

        set({
          activeEventId: eventId,
          guests: state.guestsByEventId[eventId] ?? [],
          seatedGuests: state.seatedGuestsByEventId[eventId] ?? [],
        });
      },

      addGuest: (guest) => {
        const state = get();
        const guests = [...state.guests, { ...guest, id: crypto.randomUUID() }];

        set(
          updateEventGuests(
            state.activeEventId,
            state.guestsByEventId,
            state.seatedGuestsByEventId,
            guests,
            state.seatedGuests,
          ),
        );
      },

      removeGuest: (guestId) => {
        const state = get();
        const guests = state.guests.filter((guest) => guest.id !== guestId);
        const seatedGuests = state.seatedGuests.filter(
          (seat) => seat.guestId !== guestId,
        );

        set(
          updateEventGuests(
            state.activeEventId,
            state.guestsByEventId,
            state.seatedGuestsByEventId,
            guests,
            seatedGuests,
          ),
        );
      },
      seatGuest: (guestId, tableId, seatId) => {
        const state = get();
        const seatedGuests = [
          ...state.seatedGuests.filter((seat) => seat.guestId !== guestId),
          { guestId, tableId, seatId },
        ];

        set(
          updateEventGuests(
            state.activeEventId,
            state.guestsByEventId,
            state.seatedGuestsByEventId,
            state.guests,
            seatedGuests,
          ),
        );
      },
      unseatGuest: (guestId) => {
        const state = get();
        const seatedGuests = state.seatedGuests.filter(
          (seat) => seat.guestId !== guestId,
        );

        set(
          updateEventGuests(
            state.activeEventId,
            state.guestsByEventId,
            state.seatedGuestsByEventId,
            state.guests,
            seatedGuests,
          ),
        );
      },

      updateGuest: (guestId, updatedGuest) => {
        const state = get();
        const guests = state.guests.map((guest) =>
            guest.id === guestId ? { ...guest, ...updatedGuest } : guest,
          );

        set(
          updateEventGuests(
            state.activeEventId,
            state.guestsByEventId,
            state.seatedGuestsByEventId,
            guests,
            state.seatedGuests,
          ),
        );
      },
    }),
    {
      name: 'guest-store',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as GuestStore;

        return {
          ...state,
          activeEventId: state.activeEventId ?? null,
          guests: state.guests ?? [],
          seatedGuests: state.seatedGuests ?? [],
          guestsByEventId: state.guestsByEventId ?? {},
          seatedGuestsByEventId: state.seatedGuestsByEventId ?? {},
        };
      },
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
