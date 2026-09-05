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
import { OrderTimeline } from '@/components/checkout/OrderTimeline';
import { GIFT_WRAP_FEE } from '@/components/checkout/totals';
import { formatDateLong } from '@/lib/format-date';

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

  const dateLabel = formatDateLong(order.createdAt, lang);

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

        {/* ── Order journey ──────────────────────────────────────────────── */}
        <Reveal delay={250} className="mt-4">
          <div className="card-editorial p-6 md:p-8">
            <OrderTimeline etaLabel={order.eta} placedAt={order.createdAt} />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate({ name: 'track', orderNumber: order.orderNumber })}
                className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.22em] text-forest underline decoration-gold decoration-2 underline-offset-[6px] transition-colors hover:text-forest-deep focus-visible:outline-2 focus-visible:outline-gold"
              >
                {t('confirm.trackLink')}
              </button>
            </div>
          </div>
        </Reveal>

        {/* ── Gift note ──────────────────────────────────────────────────────── */}
        {order.giftWrap && (
          <Reveal delay={260} className="mt-4">
            <div className="border border-gold/50 bg-gold/5 p-6">
              <p className="eyebrow text-gold">
                {tt('Gift wrap included', 'រួមបញ្ចូលការខ្ចប់កាដូ')}
              </p>
              {order.giftNote && (
                <p className="mt-3 font-display text-lg italic leading-relaxed text-charcoal">
                  &ldquo;{order.giftNote}&rdquo;
                </p>
              )}
              <p className="mt-2 text-xs leading-relaxed text-stone">
                {tt(
                  'Your harvest will arrive hand-tied in kraft wrap with a farmer story card.',
                  'ផលដំណំរបស់អ្នកនឹងមកដល់ជាក្រដាសស្លុងដៃ ជាមួយកាតរឿងកសិករ។',
                )}
              </p>
            </div>
          </Reveal>
        )}

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
              {order.giftWrap && (
                <div className="flex items-center justify-between">
                  <span className="text-charcoal">
                    {tt('Gift wrap', 'ខ្ចប់ជាកាដូ')}
                  </span>
                  <span className="tabular-nums text-charcoal">{formatPrice(GIFT_WRAP_FEE)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-gold">
                  <span>{tt('Harvest discount −5%', 'បញ្ចុះតម្លៃរដូវចម្ការ −៥%')}</span>
                  <span className="tabular-nums">−{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.promoCode && (order.promoDiscount ?? 0) > 0 && (
                <div className="flex items-center justify-between text-gold">
                  <span>
                    {tt('Promo code', 'កូដបញ្ចុះតម្លៃ')}
                    <span className="ml-2 text-[10px] font-bold tracking-[0.18em] text-stone">
                      {order.promoCode}
                    </span>
                  </span>
                  <span className="tabular-nums">−{formatPrice(order.promoDiscount ?? 0)}</span>
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
