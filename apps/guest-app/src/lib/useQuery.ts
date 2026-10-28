import { useCallback, useSyncExternalStore } from 'react';

// Tiny cached fetch store; the guest app makes one request per event, so a
// query library isn't worth the bundle.
type Entry = { data: unknown; error: unknown; loading: boolean };

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const IDLE: Entry = { data: null, error: null, loading: false };
// snapshots must be stable references, so these are shared constants
const LOADING: Entry = { data: null, error: null, loading: true };

function load(key: string, fetcher: () => Promise<unknown>) {
  entries.set(key, LOADING);
  notify();
  fetcher()
    .then((data) => entries.set(key, { data, error: null, loading: false }))
    .catch((error) => entries.set(key, { data: null, error, loading: false }))
    .finally(notify);
}

export function useQuery<T>(key: string | null, fetcher: () => Promise<T>) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      listeners.add(onChange);
      if (key && !entries.has(key)) load(key, fetcher);
      return () => listeners.delete(onChange);
    },
    // fetcher is recreated each render; the key identifies the request
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const entry = useSyncExternalStore(subscribe, () => (key ? (entries.get(key) ?? LOADING) : IDLE));
  return {
    data: entry.data as T | null,
    error: entry.error,
    loading: entry.loading,
    retry: () => key && load(key, fetcher),
  };
}
