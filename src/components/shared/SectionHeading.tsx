'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { KhmerOrnament } from '@/components/shared/KhmerOrnament';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  ornament?: boolean;
  className?: string;
}

/**
 * A hairline that draws itself (scaleX 0 → 1) the first time it scrolls into
 * view — the editorial full stop at the end of an eyebrow.
 */
function DrawRule({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-block h-px w-10 origin-left bg-current opacity-60 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        drawn ? 'scale-x-100' : 'scale-x-0',
        className,
      )}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  dark = false,
  ornament = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'eyebrow mb-4 flex items-center gap-3',
            align === 'center' && 'justify-center',
            dark ? 'text-honey' : 'text-terracotta',
          )}
        >
          {ornament && align === 'left' && <DrawRule />}
          <span>{eyebrow}</span>
          {ornament && align === 'center' && <DrawRule />}
        </p>
      )}
      <h2
        className={cn(
          'font-display text-4xl leading-[1.08] tracking-tight md:text-5xl lg:text-6xl',
          dark ? 'text-ivory' : 'text-charcoal',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-5 max-w-xl text-base leading-relaxed md:text-lg',
            align === 'center' && 'mx-auto',
            dark ? 'text-ivory/70' : 'text-stone',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export { KhmerOrnament };
