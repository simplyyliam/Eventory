import { create } from "zustand";

type FormState = {
  name: string;
  email: string;
  comment: string;
  dietary: string[];

  tableId: string | null;
  seatId: string | null;

  setField: <K extends keyof Omit<FormState, "setField" | "reset">>(
    key: K,
    value: FormState[K]
  ) => void;

  setForm: (data: Partial<Omit<FormState, "setField" | "reset">>) => void;

  reset: () => void;
};

const initialState = {
  name: "",
  email: "",
  comment: "",
  dietary: [],

  tableId: null,
  seatId: null,
};

export const useFormStore = create<FormState>((set) => ({
  ...initialState,

  setField: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  setForm: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  reset: () => set(initialState),
}));