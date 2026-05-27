import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';

const themeStorageKey = 'event-seating-theme';

const initializeTheme = () => {
  const storedTheme = localStorage.getItem(themeStorageKey);
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
};

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
