import { create } from 'zustand';

export type NavMode = 'orbit' | 'walk' | 'fly';
export type ViewPreset = 'isometric' | 'top' | 'front';
export type Lighting = 'day' | 'evening';

type ViewState = {
  mode: NavMode;
  preset: ViewPreset;
  // bumps when the same preset is requested again so the camera re-frames
  presetTick: number;
  lighting: Lighting;
  labels: boolean;
  people: boolean;
  selected: string | null;
  hovered: string | null;
  locked: boolean;
  setMode: (m: NavMode) => void;
  setPreset: (p: ViewPreset) => void;
  setLighting: (l: Lighting) => void;
  toggleLabels: () => void;
  togglePeople: () => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setLocked: (v: boolean) => void;
  // set by the page; the in-scene card can't use router hooks itself
  openInPlan: (tableId: string) => void;
};

export const useView = create<ViewState>((set) => ({
  mode: 'orbit',
  preset: 'isometric',
  presetTick: 0,
  lighting: 'day',
  labels: true,
  people: true,
  selected: null,
  hovered: null,
  locked: false,
  setMode: (mode) => set({ mode, selected: null }),
  setPreset: (preset) => set((s) => ({ preset, presetTick: s.presetTick + 1, mode: 'orbit' })),
  setLighting: (lighting) => set({ lighting }),
  toggleLabels: () => set((s) => ({ labels: !s.labels })),
  togglePeople: () => set((s) => ({ people: !s.people })),
  select: (selected) => set({ selected }),
  hover: (hovered) => set({ hovered }),
  setLocked: (locked) => set({ locked }),
  openInPlan: () => {},
}));

export const toMetres = (units: number) => units / 200;
