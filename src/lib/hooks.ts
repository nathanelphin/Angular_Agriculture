'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

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

/**
 * Editorial count-up — returns [ref, display]. The ref attaches to any element;
 * when it first scrolls into view, `target` counts up from 0 over `duration` ms
 * with an ease-out curve and stays put. Honors reduced motion (jumps to target).
 */
export function useCountUp(
  target: number,
  { duration = 1400, decimals = 0 }: { duration?: number; decimals?: number } = {},
): [(node: HTMLElement | null) => void, string] {
  const [value, setValue] = useState(0);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!node) return;
    const prefersReduced =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (prefersReduced) {
        setValue(target);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else setValue(target);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, target, duration]);

  const display = value.toFixed(decimals);
  return [setNode, display];
}
