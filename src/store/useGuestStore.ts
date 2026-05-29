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
  guests: Guest[];
  seatedGuests: SeatedGuest[];
  addGuest: (guest: GuestInput) => void;
  seatGuest: (guestId: string, tableId: string, seatId: string) => void;
  unseatGuest: (guestId: string) => void;
  updateGuest: (guestId: string, updatedGuest: GuestInput) => void;
};

export const useGuestStore = create<GuestStore>()(
  persist(
    (set) => ({
      guests: [],
      seatedGuests: [],
      addGuest: (guest) => {
        set((state) => ({
          // spreads out the existing guests, and adds a new object of the guest with auto-Id
          guests: [...state.guests, { ...guest, id: crypto.randomUUID() }],
        }));
      },

      seatGuest: (guestId, tableId, seatId) => {
        set((state) => ({
          seatedGuests: [
            ...state.seatedGuests.filter((seat) => seat.guestId !== guestId),
            { guestId, tableId, seatId },
          ],
        }));
      },
      unseatGuest: (guestId) => {
        set((state) => ({
          seatedGuests: state.seatedGuests.filter(
            (seat) => seat.guestId !== guestId,
          ),
        }));
      },

      updateGuest: (guestId, updatedGuest) => {
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === guestId ? { ...guest, ...updatedGuest } : guest,
          ),
        }));
      },
    }),
    {
      name: 'guest-store',
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
