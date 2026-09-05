'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/** True only after client hydration — guards persisted store values to avoid SSR mismatches. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/** Debounced value. */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
