import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

const KEY = 'eventory-theme';

const read = (): Theme => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

export const resolvedTheme = (t: Theme) => (t === 'system' ? (media().matches ? 'dark' : 'light') : t);

const apply = (t: Theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme(t));
};

export const useTheme = create<{ theme: Theme; setTheme: (t: Theme) => void }>((set) => ({
  theme: read(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // private mode; the choice just won't persist
    }
    apply(theme);
    set({ theme });
  },
}));

export function initTheme() {
  apply(read());
  media().addEventListener('change', () => {
    if (useTheme.getState().theme === 'system') apply('system');
  });
}
