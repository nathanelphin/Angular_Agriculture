'use client';

import { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
import { useLang } from '@/lib/stores/lang';

const ROTATE_MS = 5200;

/**
 * Subtle top announcement strip — editorial messages rotate with a quiet
 * crossfade so the chrome feels alive without shouting.
 */
export function AnnouncementBar() {
  const { t } = useLang();
  const messages = [t('announcement.text'), t('announcement.shipping'), t('announcement.fresh')];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [messages[0], messages[1], messages[2]]);

  return (
    <div className="bg-forest text-ivory print:hidden">
      <div className="container-editorial flex h-9 items-center justify-center gap-3">
        <Sprout
          className="hidden h-3 w-3 shrink-0 text-gold/80 sm:block"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        {/* Rotating message — remounts per index so the fade-in replays */}
        <p
          key={`${index}-${messages[index]}`}
          aria-hidden="true"
          className="animate-fade-in truncate text-[10px] font-semibold uppercase tracking-[0.28em] md:text-[11px]"
        >
          {messages[index]}
        </p>
        {/* Screen readers get the full story without rotation noise */}
        <span className="sr-only">{messages.join(' · ')}</span>
      </div>
    </div>
  );
}
