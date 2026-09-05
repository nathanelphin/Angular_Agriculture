'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Download,
  HeartHandshake,
  Inbox,
  Mail,
  PackageSearch,
  RotateCcw,
  ShoppingBag,
  Star,
  Trash2,
  Wallet,
} from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { deleteReview, fetchAdminSummary, fetchProducts } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { formatDateShort } from '@/lib/format-date';
import { orderStageIndex } from '@/components/checkout/OrderTimeline';
import { Reveal } from '@/components/shared/Reveal';
import { RatingStars } from '@/components/shared/RatingStars';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

// ─── AdminView — the Storekeeper's Desk (demo back-of-house, #/admin) ─────────
// A light-weight operations surface: commerce vitals, recent orders,
// low-stock watch and community-review moderation (real DELETE API).

export default function AdminView({ view }: ViewProps) {
  void view;
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const queryClient = useQueryClient();

  const { data: summary } = useQuery({ queryKey: ['admin-summary'], queryFn: fetchAdminSummary });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  // Optimistic moderation — removed ids vanish instantly, cache refetches behind.
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);

  const stats = summary?.stats;
  const orders = summary?.recentOrders ?? [];
  const reviews = (summary?.reviews ?? []).filter((r) => !removedIds.includes(r.id));

  // ── Fulfilment status (same derived stages the customer track page uses) ──
  const stageLabel = (stage: number) =>
    [
      t('track.confirmed'),
      t('track.packing'),
      t('track.transit'),
      t('track.delivered'),
    ][stage] ?? t('track.confirmed');

  const exportCsv = () => {
    const book = summary?.orders ?? [];
    if (book.length === 0) return;
    const header = [
      'Order',
      'Date',
      'Customer',
      'Province',
      'Items',
      'Total USD',
      'Gift Wrap',
      'Delivery',
      'Payment',
      'Status',
    ];
    const esc = (value: string | number | boolean) => {
      const s = String(value);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = book.map((o) =>
      [
        o.orderNumber,
        new Date(o.createdAt).toISOString(),
        o.customerName,
        o.province,
        o.itemsCount,
        o.total.toFixed(2),
        o.giftWrap ? 'yes' : 'no',
        o.deliveryMethod,
        o.paymentMethod,
        stageLabel(orderStageIndex(o.createdAt)),
      ]
        .map(esc)
        .join(','),
    );
    // BOM keeps Khmer customer names readable in Excel.
    const csv = `\uFEFF${[header.join(','), ...rows].join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovann-farm-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('admin.exported', { n: book.length }));
  };

  const lowStock = (products ?? [])
    .filter((p) => p.stock <= 20)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const productName = (productId: string) => {
    const p = products?.find((x) => x.id === productId);
    if (!p) return productId;
    return lang === 'kh' && p.nameKh ? p.nameKh : p.name;
  };

  const handleDelete = async (id: string) => {
    setPendingId(id);
    const res = await deleteReview(id);
    setPendingId(null);
    if (res.ok) {
      setRemovedIds((prev) => [...prev, id]);
      toast.success(t('admin.deleted'));
      void queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
    } else {
      toast.error(res.message ?? t('admin.deleteFailed'));
    }
  };

  const statCards = stats
    ? [
        {
          key: 'revenue',
          icon: Wallet,
          label: t('admin.stat.revenue'),
          value: formatPrice(stats.revenue),
          note: tt(`${stats.giftOrders} gift-wrapped`, `${stats.giftOrders} ការខ្ចប់កាដូ`),
        },
        {
          key: 'orders',
          icon: ShoppingBag,
          label: t('admin.stat.orders'),
          value: String(stats.orders),
          note: tt('across all provinces', 'គ្រប់ខេត្តទាំងអស់'),
        },
        {
          key: 'newsletter',
          icon: Mail,
          label: t('admin.stat.newsletter'),
          value: String(stats.newsletter),
          note: tt('journal subscribers', 'អ្នកតាមដានទស្សនាវដ្ដី'),
        },
        {
          key: 'reviews',
          icon: Star,
          label: t('admin.stat.reviews'),
          value: String(stats.reviews),
          note: `${tt('average', 'មធ្យមភាគ')} ${stats.avgReview.toFixed(1)} / 5`,
        },
      ]
    : Array.from({ length: 4 }).map((_, i) => ({ key: `skeleton-${i}` }));

  return (
    <div className="container-editorial pb-28 pt-14 md:pt-24">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Reveal>
        <p className="eyebrow text-terracotta">{t('admin.eyebrow')}</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-[1.05] text-charcoal md:text-7xl">
            {t('admin.title')}
          </h1>
          <p className="flex items-center gap-2 border border-charcoal/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
            <BadgeCheck className="h-3.5 w-3.5 text-moss" strokeWidth={1.5} aria-hidden="true" />
            {t('admin.demoNote')}
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone">{t('admin.subtitle')}</p>
      </Reveal>

      {/* ── Vitals ─────────────────────────────────────────────────────────── */}
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) =>
          'value' in card ? (
            <Reveal key={card.key} delay={i * 70} className="h-full">
              <div className="stat-card group h-full">
                <card.icon className="h-4 w-4 text-stone transition-colors duration-300 group-hover:text-gold" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-4 font-display text-4xl tabular-nums tracking-tight text-charcoal">
                  {card.value}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone">
                  {card.label}
                </p>
                <p className="mt-1 text-xs text-stone/80">{card.note}</p>
              </div>
            </Reveal>
          ) : (
            <div key={card.key} className="stat-card h-36 animate-pulse bg-parchment/60" aria-hidden="true" />
          ),
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* ── Recent orders ────────────────────────────────────────────────── */}
        <Reveal delay={120} className="lg:col-span-3">
          <section className="card-editorial h-full p-6 md:p-8" aria-label={t('admin.recentOrders')}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="eyebrow flex items-center gap-2.5 text-forest">
                <Inbox className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                {t('admin.recentOrders')}
              </h2>
              {orders.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                    {orders.length}
                  </span>
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="flex cursor-pointer items-center gap-1.5 border border-charcoal/15 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone transition-all duration-300 hover:border-forest hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    <Download className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                    {t('admin.export')}
                  </button>
                </div>
              )}
            </div>

            {!summary ? (
              <div className="mt-6 space-y-3" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse bg-parchment/70" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="mt-6 text-sm text-stone">{t('admin.ordersEmpty')}</p>
            ) : (
              <div className="mt-6 max-h-80 overflow-y-auto pr-1">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-charcoal/15 text-[9px] font-bold uppercase tracking-[0.2em] text-stone">
                      <th scope="col" className="py-2.5 pr-3 font-bold">{t('admin.th.order')}</th>
                      <th scope="col" className="hidden py-2.5 pr-3 font-bold sm:table-cell">{t('admin.th.customer')}</th>
                      <th scope="col" className="hidden py-2.5 pr-3 font-bold md:table-cell">{t('admin.th.status')}</th>
                      <th scope="col" className="py-2.5 pr-3 text-right font-bold">{t('admin.th.items')}</th>
                      <th scope="col" className="py-2.5 text-right font-bold">{t('cart.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const stage = orderStageIndex(o.createdAt);
                      const delivered = stage === 3;
                      return (
                        <tr
                          key={o.id}
                          className="group cursor-pointer border-b border-charcoal/8 transition-colors last:border-0 hover:bg-parchment/50"
                          onClick={() => navigate({ name: 'track', orderNumber: o.orderNumber })}
                          title={t('account.trackOrder')}
                        >
                          <td className="py-3 pr-3 align-top">
                            <span className="text-xs font-bold tabular-nums text-forest group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                              {o.orderNumber}
                            </span>
                            <span className="block text-[10px] uppercase tracking-[0.14em] text-stone">
                              {formatDateShort(o.createdAt, lang)}
                              {o.giftWrap && (
                                <span className="ml-1.5 text-gold" title={t('admin.giftWrap')}>◆</span>
                              )}
                            </span>
                          </td>
                          <td className="hidden py-3 pr-3 align-top text-xs text-charcoal sm:table-cell">
                            {o.customerName}
                            <span className="block text-[10px] uppercase tracking-[0.12em] text-stone">
                              {o.province}
                            </span>
                          </td>
                          <td className="hidden py-3 pr-3 align-top md:table-cell">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em]',
                                delivered
                                  ? 'border-gold/60 bg-gold/10 text-[#8a6d10]'
                                  : 'border-forest/25 bg-forest/5 text-forest',
                              )}
                            >
                              {delivered ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                              ) : (
                                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-60" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-forest" />
                                </span>
                              )}
                              {stageLabel(stage)}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-right align-top text-xs tabular-nums text-stone">
                            {o.itemsCount}
                          </td>
                          <td className="py-3 text-right align-top text-xs font-semibold tabular-nums text-charcoal">
                            {formatPrice(o.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>

        {/* ── Low-stock watch ──────────────────────────────────────────────── */}
        <Reveal delay={180} className="lg:col-span-2">
          <section className="card-editorial h-full p-6 md:p-8" aria-label={t('admin.lowStock')}>
            <h2 className="eyebrow flex items-center gap-2.5 text-terracotta">
              <PackageSearch className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {t('admin.lowStock')}
            </h2>
            {lowStock.length === 0 ? (
              <p className="mt-6 text-sm text-stone">{t('admin.stockHealthy')}</p>
            ) : (
              <ul className="mt-6 space-y-1">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => navigate({ name: 'product', slug: p.slug })}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-charcoal/8 py-3 text-left transition-colors last:border-0 hover:bg-parchment/50 focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-charcoal">
                          {lang === 'kh' && p.nameKh ? p.nameKh : p.name}
                        </span>
                        <span className="block text-[10px] uppercase tracking-[0.14em] text-stone">
                          {p.farmerName}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] tabular-nums',
                          p.stock <= 5 ? 'text-terracotta' : 'text-stone',
                        )}
                      >
                        {p.stock <= 5 && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-terracotta" aria-hidden="true" />
                        )}
                        {p.stock} {t('admin.left')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </div>

      {/* ── Review moderation ────────────────────────────────────────────────── */}
      <Reveal delay={140}>
        <section className="card-editorial mt-4 p-6 md:p-8" aria-label={t('admin.moderation')}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="eyebrow flex items-center gap-2.5 text-forest">
              <HeartHandshake className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {t('admin.moderation')}
            </h2>
            {reviews.length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                {reviews.length} {t('admin.pending')}
              </span>
            )}
          </div>

          {!summary ? (
            <div className="mt-6 space-y-3" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse bg-parchment/70" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="mt-6">
              <p className="text-sm text-stone">{t('admin.reviewsEmpty')}</p>
            </div>
          ) : (
            <ul className="mt-6 max-h-96 space-y-0 overflow-y-auto pr-1">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-4 border-b border-charcoal/8 py-4 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold text-charcoal">{r.title}</span>
                      <RatingStars value={r.rating} size="sm" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone">{r.body}</p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
                      {r.name}
                      {r.location ? ` · ${r.location}` : ''} · {formatDateShort(r.createdAt, lang)}
                      <span className="mx-1.5 text-charcoal/25" aria-hidden="true">/</span>
                      <button
                        type="button"
                        onClick={() => {
                          const p = products?.find((x) => x.id === r.productId);
                          if (p) navigate({ name: 'product', slug: p.slug });
                        }}
                        className="cursor-pointer text-moss underline decoration-moss/40 underline-offset-2 transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        {productName(r.productId)}
                      </button>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    disabled={pendingId === r.id}
                    aria-label={`${t('admin.delete')} — ${r.title}`}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-charcoal/15 text-stone transition-all duration-300 hover:border-terracotta hover:bg-terracotta hover:text-ivory focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-40"
                  >
                    {pendingId === r.id ? (
                      <RotateCcw className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

    </div>
  );
}
