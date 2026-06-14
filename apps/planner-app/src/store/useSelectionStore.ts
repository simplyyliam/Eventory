import { create } from 'zustand';

interface SelectionStore {
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
  isSelecting: () => boolean;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedIds: new Set(),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: next };
    }),
  clear: () => set({ selectedIds: new Set() }),
  isSelecting: () => get().selectedIds.size > 0,
}));