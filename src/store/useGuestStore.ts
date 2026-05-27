import { create } from 'zustand';

type Guest = {
  id: string;
  name: string;
  email: string;
  dietary: string[];
  comments: string;
};

type GuestInput = Omit<Guest, 'id'>

type GuestStore = {
  guests: Guest[];
  addGuest: (guest: GuestInput) => void;
};

export const useGuestStore = create<GuestStore>((set) => ({
  guests: [],
  addGuest: (guest) => {
    set((state) => ({
      // spreads out the existing guests, and adds a new object of the guest with auto-Id
      guests: [...state.guests, { ...guest, id: crypto.randomUUID() }],
    }));
  },
}));
