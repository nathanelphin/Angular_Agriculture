'use client';

import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-24 text-center', className)}>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-charcoal/10 bg-white">
        {icon ?? <PackageOpen className="h-7 w-7 text-moss" strokeWidth={1.25} />}
      </div>
      <h3 className="font-display text-2xl text-charcoal">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
