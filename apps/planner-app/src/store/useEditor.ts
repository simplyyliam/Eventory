import { create } from 'zustand';

interface EditorStore {
  snapToGrid: boolean;
  toggleSnapToGrid: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  snapToGrid: true,
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
}));