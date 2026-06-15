import { create } from "zustand";
import { useTableStore } from "./useTableStore";
import { useGuestStore } from "./useGuestStore";

export type Snapshot = {
  tables: any[];
  guests: any[];
};

type HistoryStore = {
  past: Snapshot[];
  future: Snapshot[];
  save: () => void;
  undo: () => void;
  redo: () => void;

  init: () => void;
};

const MAX = 100;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  init: () => {
    const tableState = useTableStore.getState();
    const guestState = useGuestStore.getState();

    const snapshot: Snapshot = {
      tables: structuredClone(tableState.tables),
      guests: structuredClone(guestState.guests),
    };

    set({
      past: [snapshot], 
      future: [],
    });
  },

    save: () => {
      const tableState = useTableStore.getState();
      const guestState = useGuestStore.getState();

      const snapshot: Snapshot = {
        tables: structuredClone(tableState.tables),
        guests: structuredClone(guestState.guests),
      };

      const last = get().past.at(-1);

      if (JSON.stringify(last) === JSON.stringify(snapshot)) return;

      set((state) => ({
        past: [...state.past, snapshot].slice(-MAX),
        future: [],
      }));
    },

  undo: () => {
    const state = get();
    if (state.past.length < 1) return; 

    const tableState = useTableStore.getState();
    const guestState = useGuestStore.getState();

    const tableEventId = tableState.activeEventId;
    const guestEventId = guestState.activeEventId;

    if (!tableEventId || !guestEventId) {
      console.warn("Undo blocked: missing activeEventId");
      return;
    }

    const current = {
      tables: structuredClone(tableState.tables),
      guests: structuredClone(guestState.guests),
    };

    const previous = state.past[state.past.length - 2]; 

    useTableStore.setState((s) => ({
      ...s,
      tablesByEventId: {
        ...s.tablesByEventId,
        [tableEventId]: previous.tables,
      },
      tables: previous.tables,
    }));

    useGuestStore.setState((s) => ({
      ...s,
      guestsByEventId: {
        ...s.guestsByEventId,
        [guestEventId]: previous.guests,
      },
      guests: previous.guests,
    }));

    set({
      past: state.past.slice(0, -1),
      future: [current, ...state.future],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const tableState = useTableStore.getState();
    const guestState = useGuestStore.getState();

    const tableEventId = tableState.activeEventId;
    const guestEventId = guestState.activeEventId;

    if (!tableEventId || !guestEventId) {
      console.warn("Redo blocked: missing activeEventId");
      return;
    }

    const next = state.future[0];

    useTableStore.setState((s) => ({
      ...s,
      tablesByEventId: {
        ...s.tablesByEventId,
        [tableEventId]: next.tables,
      },
      tables: next.tables,
    }));

    useGuestStore.setState((s) => ({
      ...s,
      guestsByEventId: {
        ...s.guestsByEventId,
        [guestEventId]: next.guests,
      },
      guests: next.guests,
    }));

    set({
      past: [...state.past, next],
      future: state.future.slice(1),
    });
  },
}));