import { useEffect } from 'react';
import { create } from 'zustand';
import { api } from '@/lib/api';
import { metadataOf, useWorkspace } from './workspace';

type SaveState = { status: 'idle' | 'saving' | 'saved' | 'error'; savedAt: number | null; pending: boolean };

export const useSaveStatus = create<SaveState>(() => ({ status: 'idle', savedAt: null, pending: false }));

const DELAY = 900;
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;

export async function flushSave() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (inFlight) await inFlight;
  const s = useWorkspace.getState();
  if (!s.event || !useSaveStatus.getState().pending) return;

  useSaveStatus.setState({ status: 'saving', pending: false });
  inFlight = api
    .saveWorkspace(s.event.slug, { name: s.event.name, metadata: metadataOf(s), tables: s.tables, guests: s.guests })
    .then(() => useSaveStatus.setState({ status: 'saved', savedAt: Date.now() }))
    .catch(() => useSaveStatus.setState({ status: 'error', pending: true }))
    .finally(() => {
      inFlight = null;
    });
  await inFlight;
}

const schedule = () => {
  useSaveStatus.setState({ pending: true });
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushSave, DELAY);
};

// Mount once per open event. Saves shortly after edits settle, on Ctrl/Cmd+S,
// and when the tab is hidden so nothing is lost on close.
export function useAutosave() {
  useEffect(() => {
    const unsub = useWorkspace.subscribe((s, prev) => {
      if (!s.event || s.event.id !== prev.event?.id) return;
      if (s.tables !== prev.tables || s.guests !== prev.guests || s.venue !== prev.venue || s.details !== prev.details) schedule();
    });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        useSaveStatus.setState({ pending: true });
        void flushSave();
      }
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flushSave();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      unsub();
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
      void flushSave();
    };
  }, []);
}
