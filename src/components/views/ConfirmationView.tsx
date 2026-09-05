'use client';

import { Check } from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { useOrdersStore } from '@/lib/stores/orders';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { SmartImage } from '@/components/shared/SmartImage';
import { formatPrice } from '@/components/shared/ProductCard';

export default function ConfirmationView({ view }: ViewProps) {
  const orderId = view.name === 'confirmation' ? view.orderId : '';
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const orders = useOrdersStore((s) => s.orders);
  const mounted = useMounted();

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);
  const order = orders.find((o) => o.id === orderId);

  // Persisted orders rehydrate on the client — wait before judging "not found".
  if (!mounted) {
    return <div className="container-editorial min-h-[60vh]" aria-busy="true" />;
  }

  if (!order) {
    return (
      <div className="container-editorial">
        <EmptyState
          title={tt(
            'We couldn\u2019t find that order.',
            'រកមិនឃើញការបញ្ជាទិញនេះទេ។',
          )}
          description={tt(
            'It may have been placed in another browser — your order history lives in this device.',
            'វាអាចត្រូវបានដាក់ក្នុងកម្មវិធីរុករកផ្សេង — ប្រវត្តិការបញ្ជាទិញរបស់អ្នកស្ថិតក្នុងឧបករណ៍នេះ។',
          )}
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate({ name: 'home' })}
            >
              {t('common.backHome')}
            </button>
          }
        />
      </div>
    );
  }

  const dateLabel = new Date(order.createdAt).toLocaleDateString(
    lang === 'kh' ? 'km-KH' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  const deliveryLabels: Record<string, string> = {
    standard: t('delivery.standard'),
    express: t('delivery.express'),
    pickup: t('delivery.pickup'),
  };
  const paymentLabels: Record<string, string> = {
    card: t('payment.card'),
    aba: t('payment.aba'),
    acleda: t('payment.acleda'),
    wing: t('payment.wing'),
    cod: t('payment.cod'),
  };

  return (
    <div className="container-editorial pb-28 pt-14 md:pt-20">
      <div className="mx-auto max-w-3xl">
        {/* ── Hero confirmation ─────────────────────────────────────────────── */}
        <Reveal className="text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10"
            aria-hidden="true"
          >
            <Check className="h-9 w-9 text-forest" strokeWidth={1.75} />
          </div>
          <h1 className="mt-8 font-display text-4xl leading-[1.08] text-charcoal md:text-6xl">
            {t('confirm.title')}
          </h1>
          <p className="mt-4 text-base text-stone">{t('confirm.subtitle')}</p>
        </Reveal>

        {/* ── Order facts ───────────────────────────────────────────────────── */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Reveal delay={80} className="h-full">
            <div className="card-editorial h-full p-6">
              <p className="eyebrow text-stone">{t('confirm.order')}</p>
              <p className="mt-3 font-display text-xl text-charcoal">{order.orderNumber}</p>
              <p className="mt-1 text-xs text-stone">{dateLabel}</p>
            </div>
          </Reveal>
          <Reveal delay={160} className="h-full">
            <div className="card-editorial h-full p-6">
              <p className="eyebrow text-stone">{t('confirm.eta')}</p>
              <p className="mt-3 font-display text-xl text-charcoal">{order.eta}</p>
              <p className="mt-1 text-xs text-stone">
                {deliveryLabels[order.delivery] ?? order.delivery} ·{' '}
                {paymentLabels[order.payment] ?? order.payment}
              </p>
            </div>
          </Reveal>
        </div>

        {/* ── Impact band ───────────────────────────────────────────────────── */}
        <Reveal delay={220}>
          <div className="mt-4 bg-forest p-6 text-center md:p-8">
            <p className="font-display text-xl italic leading-relaxed text-honey md:text-2xl">
              {t('confirm.supported', { n: order.farmersSupported })}
            </p>
          </div>
        </Reveal>

        {/* ── Items ─────────────────────────────────────────────────────────── */}
        <Reveal delay={280}>
          <section className="mt-12" aria-label={t('confirm.items')}>
            <p className="eyebrow text-stone">{t('confirm.items')}</p>
            <ul className="mt-5">
              {order.items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center gap-4 border-b border-charcoal/10 py-5"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    ratio="square"
                    className="h-16 w-16 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-charcoal">{item.name}</p>
                    <p className="mt-1 text-xs text-stone">
                      {item.size} · ×{item.qty} · {item.farmerName}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-charcoal">
                    {formatPrice(item.unitPrice * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="ml-auto mt-6 max-w-xs space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone">{t('cart.subtotal')}</span>
                <span className="tabular-nums text-charcoal">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone">{t('cart.shipping')}</span>
                <span className="tabular-nums text-charcoal">
                  {order.shipping === 0 ? t('cart.free') : formatPrice(order.shipping)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-gold">
                  <span>{tt('Harvest discount −5%', 'បញ្ចុះតម្លៃរដូវចម្ការ −៥%')}</span>
                  <span className="tabular-nums">−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="rule" />
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-stone">{t('cart.total')}</span>
                <span className="font-display text-xl tabular-nums text-charcoal">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </section>
        </Reveal>

        <div className="mt-14 text-center">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate({ name: 'home' })}
          >
            {t('confirm.continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
