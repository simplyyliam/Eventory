import { create } from 'zustand';

interface SelectionStore {
  selectedIds: Set<string>;

  isDragging: boolean;
  dragMode: 'select' | 'deselect' | null;

  toggle: (id: string) => void;
  setSelected: (id: string, selected: boolean) => void;

  startDrag: (mode: 'select' | 'deselect') => void;
  stopDrag: () => void;

  clear: () => void;
  isSelecting: () => boolean;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedIds: new Set(),

  isDragging: false,
  dragMode: null,

  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return { selectedIds: next };
    }),

  setSelected: (id, selected) =>
    set((s) => {
      const next = new Set(s.selectedIds);

      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return { selectedIds: next };
    }),

  startDrag: (mode) =>
    set({
      isDragging: true,
      dragMode: mode,
    }),

  stopDrag: () =>
    set({
      isDragging: false,
      dragMode: null,
    }),

  clear: () => set({ selectedIds: new Set() }),

  isSelecting: () => get().selectedIds.size > 0,
}));