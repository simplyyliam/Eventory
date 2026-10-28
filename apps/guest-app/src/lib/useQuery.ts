import { useEffect, useState } from 'react';

// Tiny cached fetch hook; the guest app only makes one request per event, so
// pulling in a query library isn't worth the bundle.
const cache = new Map<string, Promise<unknown>>();

type State<T> = { data: T | null; error: unknown; loading: boolean };

export function useQuery<T>(key: string | null, fetcher: () => Promise<T>): State<T> & { retry: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: !!key });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    if (!cache.has(key)) cache.set(key, fetcher());
    setState((s) => ({ ...s, loading: true, error: null }));
    (cache.get(key) as Promise<T>)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => {
        cache.delete(key);
        if (alive) setState({ data: null, error, loading: false });
      });
    return () => {
      alive = false;
    };
    // fetcher is recreated each render; the key identifies the request
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((a) => a + 1) };
}
