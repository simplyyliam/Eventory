import { create } from 'zustand';
import type Konva from 'konva';

// UI state for the editor only. Nothing here is saved or undoable.
type EditorState = {
  selected: string[];
  snap: boolean;
  scale: number;
  stage: Konva.Stage | null;
  // guest being dragged from the panel, so seats can highlight as drop targets
  draggingGuest: string | null;
  focusSeat: string | null;

  select: (ids: string[]) => void;
  toggle: (id: string) => void;
  setSnap: (v: boolean) => void;
  setScale: (v: number) => void;
  setStage: (s: Konva.Stage | null) => void;
  setDraggingGuest: (id: string | null) => void;
  setFocusSeat: (id: string | null) => void;
};

export const useEditor = create<EditorState>((set) => ({
  selected: [],
  snap: true,
  scale: 1,
  stage: null,
  draggingGuest: null,
  focusSeat: null,

  select: (selected) => set({ selected, focusSeat: null }),
  toggle: (id) => set((s) => ({ selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id] })),
  setSnap: (snap) => set({ snap }),
  setScale: (scale) => set({ scale }),
  setStage: (stage) => set({ stage }),
  setDraggingGuest: (draggingGuest) => set({ draggingGuest }),
  setFocusSeat: (focusSeat) => set({ focusSeat }),
}));

export const GRID = 50; // 25 cm

export const DND_ITEM = 'application/x-eventory-item';
export const DND_GUEST = 'application/x-eventory-guest';
