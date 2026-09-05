'use client';

import { ArrowLeft, Mail, MapPin, PackageOpen, Phone, Printer, Truck } from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { useOrdersStore } from '@/lib/stores/orders';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { formatDateLong } from '@/lib/format-date';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { SmartImage } from '@/components/shared/SmartImage';
import { formatPrice } from '@/components/shared/ProductCard';
import { OrderTimeline, orderStageIndex } from '@/components/checkout/OrderTimeline';
import { GIFT_WRAP_FEE } from '@/components/checkout/totals';
import { cn } from '@/lib/utils';

// ─── TrackView — deep-linkable live order tracking (#/track/SF-…,?view=track…) ──

export default function TrackView({ view }: ViewProps) {
  const orderNumber = view.name === 'track' ? view.orderNumber : '';
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const orders = useOrdersStore((s) => s.orders);
  const mounted = useMounted();

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);
  // Accept both the human order number (SF-…) and the internal id in the URL.
  const order = orders.find(
    (o) => o.orderNumber === orderNumber || o.id === orderNumber,
  );

  if (!mounted) {
    return <div className="container-editorial min-h-[60vh]" aria-busy="true" />;
  }

  if (!order) {
    return (
      <div className="container-editorial pb-28 pt-14 md:pt-24">
        <EmptyState
          icon={<PackageOpen className="h-7 w-7 text-moss" strokeWidth={1.25} />}
          title={tt('Order not found', 'រកមិនឃើញការបញ្ជាទិញ')}
          description={tt(
            `We couldn't find ${orderNumber || 'that order'} on this device — your order history lives in this browser.`,
            `យើងរកមិនឃើញ ${orderNumber || 'ការបញ្ជាទិញនេះ'} ក្នុងឧបករណ៍នេះទេ — ប្រវត្តិការបញ្ជាទិញស្ថិតក្នុងកម្មវិធីរុករកនេះ។`,
          )}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate({ name: 'account' })}
              >
                {tt('Your orders', 'ការបញ្ជាទិញរបស់អ្នក')}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate({ name: 'home' })}
              >
                {t('common.backHome')}
              </button>
            </div>
          }
        />
      </div>
    );
  }

  const dateLabel = formatDateLong(order.createdAt, lang);
  const delivered = orderStageIndex(order.createdAt) === 3;

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
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <Reveal>
          <button
            type="button"
            onClick={() => navigate({ name: 'account' })}
            className="flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-stone transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold print:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {tt('Your orders', 'ការបញ្ជាទិញរបស់អ្នក')}
          </button>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-2.5 text-terracotta">
                <Truck className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('track.pageEyebrow')}
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-charcoal md:text-6xl">
                {order.orderNumber}
              </h1>
              <p className="mt-3 text-sm text-stone">
                {tt('Placed', 'បានដាក់បញ្ជា')} {dateLabel} · {order.items.length}{' '}
                {t('cart.items')}
              </p>
            </div>
            <p
              className={cn(
                'inline-flex items-center gap-2 border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em]',
                delivered ? 'border-gold/60 bg-gold/10 text-gold' : 'border-forest/30 bg-forest/5 text-forest',
              )}
            >
              <span
                aria-hidden="true"
                className={cn('h-1.5 w-1.5 rounded-full', delivered ? 'bg-gold' : 'animate-pulse bg-forest')}
              />
              {t('account.status')}:{' '}
                {
                  [
                    t('track.confirmed'),
                    t('track.packing'),
                    t('track.transit'),
                    t('track.delivered'),
                  ][orderStageIndex(order.createdAt)]
                }
            </p>
          </div>
        </Reveal>

        {/* ── Live journey ─────────────────────────────────────────────────── */}
        <Reveal delay={100} className="mt-10">
          <div className="card-editorial p-6 md:p-8">
            <OrderTimeline etaLabel={order.eta} placedAt={order.createdAt} />
          </div>
        </Reveal>

        {/* ── Delivery details ─────────────────────────────────────────────── */}
        <Reveal delay={160} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-editorial h-full p-6">
              <p className="eyebrow text-stone">{t('track.shipTo')}</p>
              <p className="mt-3 font-display text-lg text-charcoal">{order.customer.name}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    {order.customer.address}
                    {order.customer.district ? `, ${order.customer.district}` : ''} ·{' '}
                    {order.customer.province}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span className="tabular-nums">{order.customer.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span>{order.customer.email}</span>
                </li>
              </ul>
              {order.customer.instructions && (
                <p className="mt-3 border-l-2 border-gold/60 pl-3 text-xs italic leading-relaxed text-stone">
                  “{order.customer.instructions}”
                </p>
              )}
            </div>
            <div className="card-editorial flex h-full flex-col p-6">
              <p className="eyebrow text-stone">{t('track.deliveryInfo')}</p>
              <p className="mt-3 font-display text-lg text-charcoal">
                {deliveryLabels[order.delivery] ?? order.delivery}
              </p>
              <p className="mt-1 text-sm text-stone">
                {paymentLabels[order.payment] ?? order.payment}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone">{order.eta}</p>
              {order.giftWrap && (
                <p className="mt-auto inline-flex items-center gap-2 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                  <span className="h-px w-6 bg-current" aria-hidden="true" />
                  {tt('Gift wrap included', 'រួមបញ្ចូលការខ្ចប់កាដូ')}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── Items + totals ───────────────────────────────────────────────── */}
        <Reveal delay={220}>
          <section className="mt-10" aria-label={t('confirm.items')}>
            <p className="eyebrow text-stone">{t('track.itemsTitle')}</p>
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
                    className="h-16 w-16 shrink-0 border border-charcoal/10"
                  />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => navigate({ name: 'product', slug: item.slug })}
                      className="cursor-pointer text-left text-sm font-semibold text-charcoal transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      {item.name}
                    </button>
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
                  <span className="text-charcoal">{tt('Gift wrap', 'ខ្ចប់ជាកាដូ')}</span>
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

        {/* ── Receipt link ─────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <button
            type="button"
            className="btn-outline"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {t('receipt.print')}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate({ name: 'confirmation', orderId: order.id })}
          >
            {t('track.viewReceipt')}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate({ name: 'shop' })}
          >
            {t('cart.continue')}
          </button>
        </div>
      </div>
    </div>
  );
}
