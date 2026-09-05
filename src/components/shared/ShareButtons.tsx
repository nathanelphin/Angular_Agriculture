'use client';

import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/lib/stores/lang';
import { copyTextToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  /** Descriptive label used in the native share sheet + toasts. */
  title: string;
  className?: string;
  /** Visual variant — `dark` renders ivory-on-transparent for forest bands. */
  tone?: 'light' | 'dark';
}

/**
 * Editorial share controls — Web Share API when available, with a
 * copy-to-clipboard fallback. Fully client-side, no third-party widgets.
 */
export function ShareButtons({ title, className, tone = 'light' }: ShareButtonsProps) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const shareText = `${title} — Sovann Farm`;

  const copyLink = async () => {
    const url = window.location.href;
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.success(t('share.copied'));
    } else {
      toast.error(t('share.copyFailed'));
    }
  };

  const nativeShare = async () => {
    if (typeof navigator.share !== 'function') return;
    try {
      await navigator.share({ title: shareText, url: window.location.href });
    } catch {
      /* user dismissed the sheet — nothing to do */
    }
  };

  const base =
    tone === 'dark'
      ? 'border-ivory/25 text-ivory/75 hover:border-gold hover:text-gold'
      : 'border-charcoal/20 text-stone hover:border-gold hover:text-gold';

  return (
    <div className={cn('flex items-center gap-2', className)} role="group" aria-label={t('share.label')}>
      <span className={cn('eyebrow mr-1', tone === 'dark' ? 'text-ivory/40' : 'text-stone/70')}>
        {t('share.label')}
      </span>
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          type="button"
          onClick={nativeShare}
          aria-label={t('share.native')}
          className={cn(
            'flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors duration-300',
            base,
          )}
        >
          <Share2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={copyLink}
        aria-label={t('share.copy')}
        className={cn(
          'flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors duration-300',
          base,
          copied && 'border-moss text-moss!',
        )}
      >
        {copied ? (
          <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
