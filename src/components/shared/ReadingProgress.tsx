'use client';

import { useEffect, useRef } from 'react';

// ─── Reading progress — gold hairline tracking long-form article scroll ──────

/**
 * Fixed 3px gold progress bar pinned to the very top of the viewport.
 * Mounted only by long-form views (story articles). Transform-driven so
 * scrolling never triggers React re-renders.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px]" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gold"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
