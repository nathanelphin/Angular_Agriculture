'use client';

import { Megaphone } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';

/** Subtle top announcement strip. */
export function AnnouncementBar() {
  const { t } = useLang();
  return (
    <div className="bg-forest text-ivory">
      <div className="container-editorial flex h-9 items-center justify-center gap-6">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] md:text-[11px]">
          {t('announcement.text')}
        </p>
        <span className="hidden items-center gap-2 text-[10px] tracking-[0.2em] text-ivory/60 md:flex">
          <Megaphone className="h-3 w-3" aria-hidden="true" />
          {t('announcement.shipping')}
        </span>
      </div>
    </div>
  );
}
