'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseState, serializeState, type PlaygroundState } from '@/lib/url-state';

const DEBOUNCE_MS = 150;

export function useUrlState() {
  const [state, setStateInternal] = useState<PlaygroundState>(() => {
    if (typeof window === 'undefined') return parseState('');
    return parseState(window.location.search.replace(/^\?/, ''));
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const writeUrl = useCallback((next: PlaygroundState) => {
    if (typeof window === 'undefined') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = serializeState(next);
      const qs = params.toString();
      window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
    }, DEBOUNCE_MS);
  }, []);

  const setState = useCallback(
    (updater: (prev: PlaygroundState) => PlaygroundState) => {
      setStateInternal((prev) => {
        const next = updater(prev);
        writeUrl(next);
        return next;
      });
    },
    [writeUrl],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { state, setState };
}
