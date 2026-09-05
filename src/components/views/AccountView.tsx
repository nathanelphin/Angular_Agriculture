'use client';

import { PackageOpen } from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { useOrdersStore } from '@/lib/stores/orders';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

export default function AccountView({ view }: ViewProps) {
  void view;
  const { t, lang, setLang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const orders = useOrdersStore((s) => s.orders);
  const mounted = useMounted();

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="container-editorial pb-28 pt-14 md:pt-24">
      <Reveal>
        <p className="eyebrow text-terracotta">Sovann Farm</p>
        <h1 className="mt-5 font-display text-5xl leading-[1.05] text-charcoal md:text-6xl">
          {t('account.title')}
        </h1>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
        {/* ── Profile ───────────────────────────────────────────────────────── */}
        <Reveal delay={80}>
          <aside
            className="card-editorial self-start p-8 lg:sticky lg:top-24"
            aria-label={t('account.profile')}
          >
            <div className="flex items-center gap-5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold bg-gold/10 font-display text-2xl text-forest"
                aria-hidden="true"
              >
                G
              </div>
              <div>
                <p className="font-display text-2xl text-charcoal">Harvest Guest</p>
                <p className="mt-1 text-sm text-stone">guest@sovann.farm</p>
              </div>
            </div>

            <div className="rule my-7" />

            <p className="eyebrow text-stone">{t('account.preferences')}</p>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal">
                {t('account.language')}
              </p>
              <div className="mt-3 flex" role="group" aria-label={t('account.language')}>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                  className={cn(
                    'h-10 flex-1 border px-4 text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-300',
                    lang === 'en'
                      ? 'border-forest bg-forest text-ivory'
                      : 'border-charcoal/20 text-stone hover:border-forest hover:text-forest',
                  )}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('kh')}
                  aria-pressed={lang === 'kh'}
                  className={cn(
                    'h-10 flex-1 border border-l-0 px-4 text-sm font-bold transition-colors duration-300',
                    lang === 'kh'
                      ? 'border-forest bg-forest text-ivory'
                      : 'border-charcoal/20 text-stone hover:border-forest hover:text-forest',
                  )}
                >
                  ខ្មែរ
                </button>
              </div>
            </div>

            <p className="mt-7 text-xs italic leading-relaxed text-stone">{t('account.demo')}</p>
          </aside>
        </Reveal>

        {/* ── Order history ─────────────────────────────────────────────────── */}
        <section aria-label={t('account.orders')}>
          <h2 className="font-display text-3xl text-charcoal">{t('account.orders')}</h2>

          {mounted && orders.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="h-7 w-7 text-moss" strokeWidth={1.25} />}
              title={t('account.noOrders')}
              action={
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate({ name: 'shop' })}
                >
                  {t('cart.start')}
                </button>
              }
            />
          ) : orders.length > 0 ? (
            <ul className="mt-6 space-y-4">
              {orders.map((order, i) => (
                <li key={order.id}>
                  <Reveal delay={Math.min(i, 4) * 60}>
                    <div className="card-editorial flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display text-lg text-charcoal">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-stone">
                          {dateLabel(order.createdAt)} · {order.items.length} {t('cart.items')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <p className="font-semibold tabular-nums text-charcoal">
                          {formatPrice(order.total)}
                        </p>
                        <button
                          type="button"
                          className="btn-outline h-10 px-5 text-[10px]"
                          onClick={() =>
                            navigate({ name: 'confirmation', orderId: order.id })
                          }
                        >
                          {t('account.viewOrder')}
                        </button>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}
