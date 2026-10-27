import { create } from 'zustand';

const KEY = 'eventory-sidebar';

const readCollapsed = () => {
  try {
    return localStorage.getItem(KEY) === 'collapsed';
  } catch {
    return false;
  }
};

type ShellState = {
  mobileOpen: boolean;
  collapsed: boolean;
  // pages render their header actions into this node
  actionsEl: HTMLElement | null;
  setMobileOpen: (v: boolean) => void;
  toggleCollapsed: () => void;
  setActionsEl: (el: HTMLElement | null) => void;
};

export const useShell = create<ShellState>((set, get) => ({
  mobileOpen: false,
  collapsed: readCollapsed(),
  actionsEl: null,
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  toggleCollapsed: () => {
    const collapsed = !get().collapsed;
    try {
      localStorage.setItem(KEY, collapsed ? 'collapsed' : 'open');
    } catch {
      // storage unavailable; state still toggles for this session
    }
    set({ collapsed });
  },
  setActionsEl: (actionsEl) => set({ actionsEl }),
}));
