'use client';

import { useState, type FormEvent, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BadgeCheck,
  BellRing,
  Download,
  HeartHandshake,
  Inbox,
  KeyRound,
  Lock,
  Mail,
  PackageSearch,
  RotateCcw,
  ShoppingBag,
  Sprout,
  Star,
  Trash2,
  Wallet,
} from 'lucide-react';
import type { ViewProps } from '@/lib/types';
import { deleteReview, fetchAdminSummary, fetchProducts } from '@/lib/api';
import { useLang } from '@/lib/stores/lang';
import { useRouterStore } from '@/lib/stores/router';
import { copyTextToClipboard } from '@/lib/clipboard';
import { formatDateShort } from '@/lib/format-date';
import { orderStageIndex } from '@/components/checkout/OrderTimeline';
import { Reveal } from '@/components/shared/Reveal';
import { StageMeter } from '@/components/shared/StageMeter';
import { RatingStars } from '@/components/shared/RatingStars';
import { SeasonCalendar } from '@/components/admin/SeasonCalendar';
import { formatPrice } from '@/components/shared/ProductCard';
import { cn } from '@/lib/utils';

// ─── AdminView — the Storekeeper's Desk (demo back-of-house, #/admin) ─────────
// A light-weight operations surface: commerce vitals, recent orders,
// low-stock watch and community-review moderation (real DELETE API).
// A quiet passphrase gate (session-scoped) keeps the desk out of casual reach.

const DESK_PASSPHRASE = 'harvest2026';
const DESK_KEY_STORAGE = 'sovann-desk-unlocked';

/** sessionStorage is an external system — subscribe so the gate re-reads it. */
const subscribeDeskStorage = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

export default function AdminView({ view }: ViewProps) {
  void view;
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const queryClient = useQueryClient();

  // ── Passphrase gate (session-scoped; demo-honest with a visible hint) ──
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [keyError, setKeyError] = useState(false);
  const storedUnlocked = useSyncExternalStore(
    subscribeDeskStorage,
    () => {
      try {
        return sessionStorage.getItem(DESK_KEY_STORAGE) === '1';
      } catch {
        return false;
      }
    },
    () => false, // server snapshot — the gate renders first, then hydrates
  );
  const unlocked = justUnlocked || storedUnlocked;

  const unlockDesk = (e: FormEvent) => {
    e.preventDefault();
    if (passphrase.trim().toLowerCase() === DESK_PASSPHRASE) {
      try {
        sessionStorage.setItem(DESK_KEY_STORAGE, '1');
      } catch {
        /* private mode — the gate simply won't persist for the session */
      }
      setKeyError(false);
      setJustUnlocked(true);
      toast.success(t('admin.gate.welcome'));
    } else {
      setKeyError(true);
      toast.error(t('admin.gate.wrong'));
    }
  };

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

  // ── The waiting book — everyone who asked to hear from a resting harvest ──
  const waiting = summary?.waiting ?? [];

  const groupEmails = (group: (typeof waiting)[number]) => {
    const set = new Set<string>([
      ...group.alerts.map((a) => a.email),
      ...group.reservations.map((r) => r.email),
    ]);
    return [...set];
  };

  const copyGroupEmails = async (group: (typeof waiting)[number]) => {
    const emails = groupEmails(group);
    if (emails.length === 0) return;
    const ok = await copyTextToClipboard(emails.join(', '));
    if (ok) toast.success(t('admin.waiting.copied', { n: emails.length }));
  };

  const exportWaitingCsv = () => {
    if (waiting.length === 0) return;
    const header = ['Harvest', 'Kind', 'Email', 'Size', 'Qty', 'Since'];
    const esc = (value: string | number) => {
      const s = String(value);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: string[] = [];
    for (const group of waiting) {
      const label = productName(group.productId);
      for (const a of group.alerts) {
        rows.push([label, 'wake-me', a.email, '', '', a.createdAt].map(esc).join(','));
      }
      for (const r of group.reservations) {
        rows.push([label, 'reservation', r.email, r.sizeLabel, r.qty, r.createdAt].map(esc).join(','));
      }
    }
    // BOM keeps Khmer product names readable in Excel.
    const csv = `\uFEFF${[header.join(','), ...rows].join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovann-farm-waiting-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('admin.waiting.exported'));
  };


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

  // ── Gate render ──────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-forest-deep px-6 py-20 text-ivory">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-ivory/20">
            <Lock className="h-6 w-6 text-honey" strokeWidth={1.25} aria-hidden="true" />
          </span>
          <p className="eyebrow mt-8 justify-center text-honey">{t('admin.gate.eyebrow')}</p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight md:text-5xl">
            {t('admin.gate.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ivory/70">
            {t('admin.gate.body')}
          </p>

          <form onSubmit={unlockDesk} className="mt-8 space-y-3" aria-label={t('admin.gate.title')}>
            <label htmlFor="desk-passphrase" className="sr-only">
              {t('admin.gate.label')}
            </label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <input
                id="desk-passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setKeyError(false);
                }}
                placeholder={t('admin.gate.placeholder')}
                autoComplete="off"
                aria-invalid={keyError}
                aria-describedby={keyError ? 'desk-key-error' : undefined}
                className="h-12 w-full border border-ivory/25 bg-transparent pl-11 pr-4 text-sm tracking-[0.08em] text-ivory placeholder:text-ivory/35 focus:border-honey focus:outline-none"
              />
            </div>
            {keyError && (
              <p id="desk-key-error" role="alert" className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                {t('admin.gate.wrong')}
              </p>
            )}
            <button type="submit" className="btn-gold h-12 w-full text-[11px]">
              {t('admin.gate.unlock')}
            </button>
          </form>

          <p className="mt-5 text-xs text-ivory/50">
            {t('admin.gate.hint', { pass: DESK_PASSPHRASE })}
          </p>

          <button
            type="button"
            onClick={() => navigate({ name: 'home' })}
            className="mt-8 inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ivory/60 underline decoration-ivory/30 underline-offset-4 transition-colors hover:text-ivory focus-visible:outline-2 focus-visible:outline-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {t('admin.gate.back')}
          </button>
        </div>
      </div>
    );
  }

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
                            <StageMeter stage={stage} label={stageLabel(stage)} />
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

      {/* ── The Year's Harvest — season ledger for the desk ─────────────────── */}
      {products && products.length > 0 && (
        <Reveal delay={120} className="mt-4">
          <SeasonCalendar products={products} />
        </Reveal>
      )}

      {/* ── Write to the Waiting — the resting-harvest book ──────────────── */}
      <Reveal delay={130}>
        <section className="card-editorial mt-4 p-6 md:p-8" aria-label={t('admin.waiting.title')}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="eyebrow flex items-center gap-2.5 text-terracotta">
              <BellRing className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {t('admin.waiting.title')}
            </h2>
            {waiting.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                  {waiting.reduce((n, g) => n + g.alerts.length + g.reservations.length, 0)}
                </span>
                <button
                  type="button"
                  onClick={exportWaitingCsv}
                  className="flex cursor-pointer items-center gap-1.5 border border-charcoal/15 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone transition-all duration-300 hover:border-forest hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <Download className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                  {t('admin.waiting.export')}
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-stone">
            {t('admin.waiting.subtitle')}
          </p>

          {!summary ? (
            <div className="mt-6 space-y-3" aria-hidden="true">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-parchment/70" />
              ))}
            </div>
          ) : waiting.length === 0 ? (
            <p className="mt-6 text-sm text-stone">{t('admin.waiting.empty')}</p>
          ) : (
            <ul className="mt-6 space-y-0">
              {waiting.map((group) => (
                <li key={group.productId} className="border-b border-charcoal/8 py-4 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          const p = products?.find((x) => x.id === group.productId);
                          if (p) navigate({ name: 'product', slug: p.slug });
                        }}
                        className="cursor-pointer text-left text-sm font-semibold text-charcoal transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        {productName(group.productId)}
                      </button>
                      <p
                        className={cn(
                          'mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em]',
                          group.inSeason ? 'text-gold' : 'text-stone',
                        )}
                      >
                        {group.inSeason ? (
                          <>
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />
                            {t('admin.waiting.inSeason')}
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-stone/50" aria-hidden="true" />
                            {t('admin.waiting.resting')}
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyGroupEmails(group)}
                      className="flex shrink-0 cursor-pointer items-center gap-1.5 border border-charcoal/15 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-stone transition-all duration-300 hover:border-forest hover:text-forest focus-visible:outline-2 focus-visible:outline-gold"
                    >
                      <Mail className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                      {t('admin.waiting.copy')}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    {group.alerts.length > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-clay">
                        <BellRing className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                        {t('admin.waiting.alerts', { n: group.alerts.length })}
                      </span>
                    )}
                    {group.reservations.length > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-forest">
                        <Sprout className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                        {t('admin.waiting.reservations', { n: group.reservations.length })}
                      </span>
                    )}
                  </div>
                  {group.reservations.length > 0 && (
                    <ul className="mt-2 border-l border-gold/40 pl-3">
                      {group.reservations.map((r) => (
                        <li
                          key={`${r.email}-${r.sizeLabel}`}
                          className="flex items-baseline justify-between gap-4 py-1"
                        >
                          <span className="truncate text-xs text-stone">{r.email}</span>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] tabular-nums text-forest">
                            {r.sizeLabel} × {r.qty}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

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
