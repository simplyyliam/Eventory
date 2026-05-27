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

type GuestInput = Omit<Guest, 'id'>

type GuestStore = {
  guests: Guest[];
  addGuest: (guest: GuestInput) => void;
};

export const useGuestStore = create<GuestStore>()(
  persist(
    (set) => ({
      guests: [],
      addGuest: (guest) => {
        set((state) => ({
          // spreads out the existing guests, and adds a new object of the guest with auto-Id
          guests: [...state.guests, { ...guest, id: crypto.randomUUID() }],
        }));
      },
    }),
    {
      name: 'guest-store',
      storage: createJSONStorage((): StateStorage => ({
        getItem: (name) => localforage.getItem<string>(name),
        setItem: async (name, value) => {
          await localforage.setItem(name, value);
        },
        removeItem: (name) => localforage.removeItem(name),
      })),
    }
  )
);
