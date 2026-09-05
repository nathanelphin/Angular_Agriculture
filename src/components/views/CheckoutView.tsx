'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  CreditCard,
  Info,
  Landmark,
  Loader2,
  Lock,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { OrderItem, StoredOrder, ViewProps } from '@/lib/types';
import { createOrder, fetchProducts } from '@/lib/api';
import { useCartStore } from '@/lib/stores/cart';
import { useOrdersStore } from '@/lib/stores/orders';
import { useRouterStore } from '@/lib/stores/router';
import { useLang } from '@/lib/stores/lang';
import { useMounted } from '@/lib/hooks';
import { provinces } from '@/lib/data/provinces';
import { findPromo } from '@/components/checkout/totals';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Reveal } from '@/components/shared/Reveal';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatPrice } from '@/components/shared/ProductCard';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { OrderSummary, type OrderSummaryItem } from '@/components/checkout/OrderSummary';
import {
  etaFor,
  GIFT_WRAP_FEE,
  harvestDiscountFor,
  shippingFor,
  type DeliveryId,
  type PaymentId,
} from '@/components/checkout/totals';
import { cn } from '@/lib/utils';

const PROVINCE_OPTIONS = [
  'Phnom Penh',
  ...provinces.map((p) => p.name),
  'Kandal',
  'Koh Kong',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ErrorKey = 'name' | 'email' | 'phone' | 'address';
type Errors = Partial<Record<ErrorKey, string>>;

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  instructions: string;
}

const INITIAL_FORM: CheckoutForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  province: 'Phnom Penh',
  district: '',
  instructions: '',
};

/** Labelled field wrapper with inline editorial error. */
function Field({
  label,
  htmlFor,
  required = false,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-[0.18em] text-stone"
      >
        {label}
        {required && (
          <span className="text-terracotta" aria-hidden="true">
            {' '}*
          </span>
        )}
      </Label>
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutView({ view }: ViewProps) {
  void view;
  const { t, lang } = useLang();
  const navigate = useRouterStore((s) => s.navigate);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const promoCode = useCartStore((s) => s.promoCode);
  const addOrder = useOrdersStore((s) => s.add);
  const mounted = useMounted();
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const tt = (en: string, kh: string) => (lang === 'kh' ? kh : en);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [delivery, setDelivery] = useState<DeliveryId>('standard');
  const [payment, setPayment] = useState<PaymentId>('card');
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [placing, setPlacing] = useState(false);

  // Join cart lines with the catalogue for pricing + order snapshot.
  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = products?.find((p) => p.id === item.productId);
        if (!product) return [];
        const unitPrice =
          product.sizes.find((s) => s.label === item.size)?.price ?? product.price;
        return [{ item, product, unitPrice }];
      }),
    [items, products],
  );

  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.item.qty, 0);
  const promo = promoCode ? findPromo(promoCode) : undefined;
  const promoOk = Boolean(promo && subtotal >= promo.minSubtotal);
  const shipping = shippingFor(delivery, subtotal, promoOk ? promo : undefined);
  const discount = harvestDiscountFor(subtotal);
  const giftFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const promoDiscount = promoOk
    ? promo!.kind === 'percent'
      ? Math.round(subtotal * (promo!.value / 100) * 100) / 100
      : promo!.kind === 'amount'
        ? promo!.value
        : 0
    : 0;
  const total = subtotal + shipping + giftFee - discount - promoDiscount;

  const summaryItems: OrderSummaryItem[] = lines.map(({ item, product, unitPrice }) => ({
    key: `${item.productId}-${item.size}`,
    name: lang === 'kh' && product.nameKh ? product.nameKh : product.name,
    size: item.size || product.unit,
    qty: item.qty,
    unitPrice,
    image: product.image,
  }));

  // Calm scroll to top when the shopper advances between steps.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const setField = (key: keyof CheckoutForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as ErrorKey];
      return next;
    });
  };

  const validateInformation = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim())
      next.name = tt('Please enter your full name.', 'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក។');
    if (!form.email.trim())
      next.email = tt('Please enter your email address.', 'សូមបញ្ចូលអ៊ីមែលរបស់អ្នក។');
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = tt(
        'That email address doesn\u2019t look right.',
        'អ៊ីមែលនេះមិនត្រឹមត្រូវទេ។',
      );
    if (!form.phone.trim())
      next.phone = tt('Please enter your phone number.', 'សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក។');
    if (!form.address.trim())
      next.address = tt('Please enter your street address.', 'សូមបញ្ចូលអាសយដ្ឋានរបស់អ្នក។');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    if (placing || lines.length === 0) return;
    setPlacing(true);

    const orderItems: OrderItem[] = lines.map(({ item, product, unitPrice }) => ({
      productId: product.id,
      slug: product.slug,
      name: lang === 'kh' && product.nameKh ? product.nameKh : product.name,
      size: item.size || product.unit,
      qty: item.qty,
      unitPrice,
      image: product.image,
      farmerName: product.farmerName,
    }));

    const payload: Omit<StoredOrder, 'id' | 'orderNumber' | 'createdAt'> = {
      items: orderItems,
      subtotal,
      shipping,
      discount,
      promoCode: promoOk ? promo!.code : undefined,
      promoDiscount: promoOk && promoDiscount > 0 ? promoDiscount : undefined,
      total,
      giftWrap,
      giftNote: giftWrap && giftNote.trim() ? giftNote.trim() : undefined,
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        province: form.province,
        district: form.district.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
      },
      delivery,
      payment,
      farmersSupported: new Set(orderItems.map((i) => i.farmerName)).size,
      eta: etaFor(delivery),
    };

    try {
      const res = await createOrder(payload);
      if (res.ok && res.order) {
        addOrder(res.order);
        clearCart();
        toast.success(t('confirm.title'));
        navigate({ name: 'confirmation', orderId: res.order.id });
      } else {
        setPlacing(false);
        toast.error(
          tt(
            'Order failed. Please try again.',
            'ការបញ្ជាទិញមិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។',
          ),
        );
      }
    } catch {
      setPlacing(false);
      toast.error(
        tt('Order failed. Please try again.', 'ការបញ្ជាទិញមិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។'),
      );
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateInformation()) setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    void placeOrder();
  };

  const goBack = () => {
    if (step === 1) navigate({ name: 'cart' });
    else setStep(step === 2 ? 1 : 2);
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  const cartUnavailable =
    mounted &&
    !placing &&
    (items.length === 0 || (Boolean(products) && lines.length === 0));

  if (cartUnavailable) {
    return (
      <div className="container-editorial">
        <EmptyState
          title={items.length === 0 ? t('cart.empty') : tt('Your basket is no longer available.', 'រទេះរបស់អ្នកលែងមានទំនិញហើយ។')}
          description={t('cart.emptyDesc')}
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
      </div>
    );
  }

  const deliveryMethods: { id: DeliveryId; name: string; desc: string; fee: number }[] = [
    {
      id: 'standard',
      name: t('delivery.standard'),
      desc: t('delivery.standard.desc'),
      fee: shippingFor('standard', subtotal, promoOk ? promo : undefined),
    },
    {
      id: 'express',
      name: t('delivery.express'),
      desc: t('delivery.express.desc'),
      fee: shippingFor('express', subtotal, promoOk ? promo : undefined),
    },
    {
      id: 'pickup',
      name: t('delivery.pickup'),
      desc: t('delivery.pickup.desc'),
      fee: 0,
    },
  ];

  const paymentMethods: { id: PaymentId; name: string; icon: LucideIcon }[] = [
    { id: 'card', name: t('payment.card'), icon: CreditCard },
    { id: 'aba', name: t('payment.aba'), icon: Landmark },
    { id: 'acleda', name: t('payment.acleda'), icon: Building2 },
    { id: 'wing', name: t('payment.wing'), icon: Smartphone },
    { id: 'cod', name: t('payment.cod'), icon: Banknote },
  ];

  const stepTitles = [t('checkout.step.information'), t('checkout.step.delivery'), t('checkout.step.payment')];

  return (
    <div className="pb-28">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="container-editorial pt-14 md:pt-20">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-terracotta">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
            Secure Checkout
          </p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] text-charcoal md:text-6xl">
            {t('checkout.title')}
          </h1>
        </Reveal>
        <CheckoutStepper
          steps={stepTitles}
          current={step}
          onStepClick={(s) => {
            if (s < step) setStep(s as 1 | 2 | 3);
          }}
          className="mt-10 max-w-xl"
        />
      </header>

      <div className="container-editorial mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        {/* ── Step card ──────────────────────────────────────────────────────── */}
        <Reveal>
          <form noValidate onSubmit={handleSubmit}>
            <div className="card-editorial p-6 md:p-10">
              <p className="eyebrow text-terracotta">
                {tt('Step', 'ជំហាន')} 0{step} / 03
              </p>
              <h2 className="mt-3 font-display text-3xl text-charcoal md:text-4xl">
                {stepTitles[step - 1]}
              </h2>

              {/* ── STEP 1 · INFORMATION ── */}
              {step === 1 && (
                <div className="mt-9 grid gap-5 sm:grid-cols-2">
                  <Field label={t('field.name')} htmlFor="co-name" required error={errors.name}>
                    <input
                      id="co-name"
                      autoComplete="name"
                      className="input-editorial"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                    />
                  </Field>
                  <Field label={t('field.email')} htmlFor="co-email" required error={errors.email}>
                    <input
                      id="co-email"
                      type="email"
                      autoComplete="email"
                      className="input-editorial"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                    />
                  </Field>
                  <Field label={t('field.phone')} htmlFor="co-phone" required error={errors.phone}>
                    <input
                      id="co-phone"
                      type="tel"
                      autoComplete="tel"
                      className="input-editorial"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                    />
                  </Field>
                  <Field label={t('field.district')} htmlFor="co-district">
                    <input
                      id="co-district"
                      autoComplete="address-level2"
                      className="input-editorial"
                      value={form.district}
                      onChange={(e) => setField('district', e.target.value)}
                    />
                  </Field>
                  <Field label={t('field.address')} htmlFor="co-address" required error={errors.address} className="sm:col-span-2">
                    <input
                      id="co-address"
                      autoComplete="street-address"
                      className="input-editorial"
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      aria-invalid={Boolean(errors.address)}
                    />
                  </Field>
                  <Field label={t('field.province')} htmlFor="co-province">
                    <Select value={form.province} onValueChange={(v) => setField('province', v)}>
                      <SelectTrigger
                        id="co-province"
                        aria-label={t('field.province')}
                        className="input-editorial h-12 w-full justify-between"
                      >
                        <SelectValue placeholder={t('field.province')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-charcoal/15">
                        {PROVINCE_OPTIONS.map((name) => (
                          <SelectItem key={name} value={name} className="rounded-none">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t('field.instructions')} htmlFor="co-instructions" className="sm:col-span-2">
                    <Textarea
                      id="co-instructions"
                      rows={3}
                      className="input-editorial h-24 resize-none py-3 leading-relaxed"
                      value={form.instructions}
                      onChange={(e) => setField('instructions', e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* ── STEP 2 · DELIVERY ── */}
              {step === 2 && (
                <fieldset className="mt-9">
                  <legend className="sr-only">{t('checkout.step.delivery')}</legend>
                  <div className="space-y-3">
                    {deliveryMethods.map((m) => {
                      const selected = delivery === m.id;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setDelivery(m.id)}
                          aria-pressed={selected}
                          className={cn(
                            'flex w-full items-center justify-between gap-4 border p-5 text-left transition-colors duration-300',
                            selected
                              ? 'border-forest bg-parchment/50'
                              : 'border-charcoal/15 bg-transparent hover:border-charcoal/30',
                          )}
                        >
                          <span>
                            <span className="block text-sm font-bold uppercase tracking-[0.14em] text-charcoal">
                              {m.name}
                            </span>
                            <span className="mt-1 block text-xs text-stone">{m.desc}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-4">
                            <span
                              className={cn(
                                'text-sm font-semibold tabular-nums',
                                m.fee === 0 ? 'text-terracotta' : 'text-charcoal',
                              )}
                            >
                              {m.fee === 0 ? t('cart.free') : formatPrice(m.fee)}
                            </span>
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex h-5 w-5 items-center justify-center border transition-colors duration-300',
                                selected
                                  ? 'border-forest bg-forest text-ivory'
                                  : 'border-charcoal/25 text-transparent',
                              )}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Gift options */}
                  <div
                    className={cn(
                      'mt-8 border p-5 transition-colors duration-300',
                      giftWrap ? 'border-gold/60 bg-gold/5' : 'border-charcoal/15',
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={giftWrap}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#1c3a2a]"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-sm font-bold uppercase tracking-[0.14em] text-charcoal">
                            {tt('Gift wrap this harvest', 'ខ្ចប់ជាកាដូ')}
                          </span>
                          <span className="text-xs font-semibold text-gold">
                            +{formatPrice(GIFT_WRAP_FEE)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-stone">
                          {tt(
                            'Hand-tied kraft wrap, beeswax seal and a farmer story card — ready to give.',
                            'ក្រដាសស្លុងដៃ ត្រីមាសស្រាឈេះ និងកាតរឿងកសិករ — ត្រៀមជាកាដូ។',
                          )}
                        </span>
                      </span>
                    </label>
                    {giftWrap && (
                      <div className="mt-4">
                        <Label htmlFor="gift-note" className="text-xs text-stone">
                          {tt('Handwritten note (optional)', 'សំបុត្រដោយដៃ (ស្រេចចិត្ត)')}
                        </Label>
                        <Textarea
                          id="gift-note"
                          rows={2}
                          maxLength={220}
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          placeholder={tt(
                            'e.g. For Mum — grown by Sokha Chea in Prey Veng.',
                            'ឧ. សម្រាប់មាតា — ដាំដោយសុខា នៅព្រៃវែង។',
                          )}
                          className="input-editorial mt-2 h-20 resize-none py-3 leading-relaxed"
                        />
                        <p className="mt-1.5 text-right text-[10px] tabular-nums text-stone">
                          {giftNote.length}/220
                        </p>
                      </div>
                    )}
                  </div>
                </fieldset>
              )}

              {/* ── STEP 3 · PAYMENT ── */}
              {step === 3 && (
                <div className="mt-9">
                  <div className="flex items-start gap-3 border border-gold/40 bg-parchment p-4 text-xs leading-relaxed text-stone">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                    <p>{t('checkout.note')}</p>
                  </div>

                  <fieldset className="mt-8">
                    <legend className="eyebrow text-stone">{t('payment.method')}</legend>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((m) => {
                        const selected = payment === m.id;
                        const Icon = m.icon;
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setPayment(m.id)}
                            aria-pressed={selected}
                            className={cn(
                              'flex items-center gap-3 border p-4 text-left transition-colors duration-300',
                              selected
                                ? 'border-forest bg-parchment/50'
                                : 'border-charcoal/15 bg-transparent hover:border-charcoal/30',
                            )}
                          >
                            <Icon className="h-5 w-5 shrink-0 text-forest" strokeWidth={1.5} />
                            <span className="flex-1 text-sm font-semibold text-charcoal">
                              {m.name}
                            </span>
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-300',
                                selected
                                  ? 'border-forest bg-forest text-ivory'
                                  : 'border-charcoal/25 text-transparent',
                              )}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {payment === 'card' && (
                    <div className="mt-5 border border-charcoal/15 bg-parchment/40 p-5">
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-stone">
                        <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {tt('Demo card — nothing will be charged', 'កាតសាកល្បង — គ្មានប្រាក់ត្រូវគិត')}
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Label htmlFor="cc-number" className="text-xs text-stone">
                            {tt('Card number', 'លេខកាត')}
                          </Label>
                          <input
                            id="cc-number"
                            disabled
                            placeholder="•••• •••• •••• 1234"
                            className="input-editorial mt-2 opacity-70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cc-name" className="text-xs text-stone">
                            {tt('Name on card', 'ឈ្មោះលើកាត')}
                          </Label>
                          <input
                            id="cc-name"
                            disabled
                            placeholder="A N Other"
                            className="input-editorial mt-2 opacity-70"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cc-expiry" className="text-xs text-stone">
                              {tt('Expiry', 'ថ្ងៃផុតកំណត់')}
                            </Label>
                            <input
                              id="cc-expiry"
                              disabled
                              placeholder="MM / YY"
                              className="input-editorial mt-2 opacity-70"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cc-cvc" className="text-xs text-stone">
                              CVC
                            </Label>
                            <input
                              id="cc-cvc"
                              disabled
                              placeholder="•••"
                              className="input-editorial mt-2 opacity-70"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step navigation ── */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={placing}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                      {tt('Placing…', 'កំពុងដាក់…')}
                    </>
                  ) : step === 3 ? (
                    <>
                      <Lock className="h-4 w-4" strokeWidth={1.5} />
                      {t('checkout.place')}
                    </>
                  ) : (
                    t('checkout.continue')
                  )}
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={placing}
                  className="btn-outline flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  {t('checkout.back')}
                </button>
              </div>
            </div>
          </form>
        </Reveal>

        {/* ── Summary ─────────────────────────────────────────────────────────── */}
        <aside className="self-start lg:sticky lg:top-24" aria-label={t('checkout.summary')}>
          <Reveal delay={100}>
            <OrderSummary
              items={summaryItems}
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              giftFee={giftFee}
              promoCode={promoOk && promoDiscount > 0 ? promo!.code : undefined}
              promoLabel={promoOk ? (lang === 'kh' ? promo!.labelKh : promo!.labelEn) : undefined}
              promoDiscount={promoOk && promoDiscount > 0 ? promoDiscount : undefined}
              allowPromo
              showEdits={step === 3}
              onEdit={(s) => setStep(s)}
              className="p-6 md:p-8"
            />
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
