'use client';

import type { ReactNode } from 'react';
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
          {ornament && align === 'left' && (
            <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
          )}
          <span>{eyebrow}</span>
          {ornament && align === 'center' && (
            <span className="inline-block h-px w-10 bg-current opacity-60" aria-hidden="true" />
          )}
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
