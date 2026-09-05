'use client';

import { useId } from 'react';
import { Search } from 'lucide-react';
import type { Category, CategoryId, Province, ProvinceId } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// ─── FilterPanel — editorial filter rail shared by shop sidebar & mobile sheet ─

export type PriceRange = 'any' | 'lt10' | '10to20' | 'gt20';

const PRICE_OPTIONS: { value: PriceRange; en: string }[] = [
  { value: 'any', en: 'any' },
  { value: 'lt10', en: 'Under $10' },
  { value: '10to20', en: '$10 – $20' },
  { value: 'gt20', en: 'Over $20' },
];

export interface FilterPanelProps {
  categories: Category[];
  provinces: Province[];
  search: string;
  onSearchChange: (value: string) => void;
  category: CategoryId | null;
  onCategoryChange: (value: CategoryId | null) => void;
  province: ProvinceId | null;
  onProvinceChange: (value: ProvinceId | null) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (value: PriceRange) => void;
  organicOnly: boolean;
  onOrganicChange: (value: boolean) => void;
  sustainableOnly: boolean;
  onSustainableChange: (value: boolean) => void;
  activeCount: number;
  onClear: () => void;
  className?: string;
}

export function FilterPanel({
  categories,
  provinces,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  province,
  onProvinceChange,
  priceRange,
  onPriceRangeChange,
  organicOnly,
  onOrganicChange,
  sustainableOnly,
  onSustainableChange,
  activeCount,
  onClear,
  className,
}: FilterPanelProps) {
  const { t, lang } = useLang();
  // The panel renders twice (desktop rail + mobile sheet) — prefix ids to stay unique.
  const uid = useId();

  const priceLabel = (option: { value: PriceRange; en: string }) =>
    option.value === 'any' ? t('shop.allPrices') : option.en;

  return (
    <div className={cn('w-full', className)}>
      {/* Clear all */}
      <div className="flex min-h-6 items-center justify-end" aria-live="polite">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.22em] text-terracotta underline decoration-terracotta/50 underline-offset-4 transition-colors hover:text-terracotta/75 focus-visible:outline-2 focus-visible:outline-gold"
          >
            {t('shop.clearAll')}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="py-6">
        <p className="eyebrow mb-4 text-stone">{t('nav.search')}</p>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <label htmlFor={`${uid}-search`} className="sr-only">
            {t('search.placeholder')}
          </label>
          <input
            id={`${uid}-search`}
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search.placeholder')}
            className="input-editorial h-11 pl-10"
          />
        </div>
      </div>

      <div className="rule" />

      {/* Category */}
      <div className="py-6">
        <p className="eyebrow mb-4 text-stone">{t('shop.category')}</p>
        <RadioGroup
          value={category ?? 'all'}
          onValueChange={(v) => onCategoryChange(v === 'all' ? null : (v as CategoryId))}
          aria-label={t('shop.category')}
          className="gap-1"
        >
          <RadioRow
            key="all"
            id={`${uid}-cat-all`}
            value="all"
            checked={category === null}
            label={t('shop.allCategories')}
          />
          {categories.map((c) => (
            <RadioRow
              key={c.id}
              id={`${uid}-cat-${c.id}`}
              value={c.id}
              checked={category === c.id}
              label={lang === 'kh' ? c.nameKh : c.name}
            />
          ))}
        </RadioGroup>
      </div>

      <div className="rule" />

      {/* Province */}
      <div className="py-6">
        <p className="eyebrow mb-4 text-stone">{t('shop.province')}</p>
        <RadioGroup
          value={province ?? 'all'}
          onValueChange={(v) => onProvinceChange(v === 'all' ? null : (v as ProvinceId))}
          aria-label={t('shop.province')}
          className="gap-1"
        >
          <RadioRow
            key="all"
            id={`${uid}-prov-all`}
            value="all"
            checked={province === null}
            label={t('shop.allProvinces')}
          />
          {provinces.map((p) => (
            <RadioRow
              key={p.id}
              id={`${uid}-prov-${p.id}`}
              value={p.id}
              checked={province === p.id}
              label={lang === 'kh' ? p.nameKh : p.name}
            />
          ))}
        </RadioGroup>
      </div>

      <div className="rule" />

      {/* Price */}
      <div className="py-6">
        <p className="eyebrow mb-4 text-stone">{t('shop.price')}</p>
        <RadioGroup
          value={priceRange}
          onValueChange={(v) => onPriceRangeChange(v as PriceRange)}
          aria-label={t('shop.price')}
          className="gap-1"
        >
          {PRICE_OPTIONS.map((option) => (
            <RadioRow
              key={option.value}
              id={`${uid}-price-${option.value}`}
              value={option.value}
              checked={priceRange === option.value}
              label={priceLabel(option)}
            />
          ))}
        </RadioGroup>
      </div>

      <div className="rule" />

      {/* Farming practices */}
      <div className="py-6">
        <p className="eyebrow mb-4 text-stone">{t('product.production')}</p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`${uid}-organic`}
              checked={organicOnly}
              onCheckedChange={(v) => onOrganicChange(v === true)}
              className="rounded-none border-charcoal/30 shadow-none data-[state=checked]:border-forest data-[state=checked]:bg-forest"
            />
            <Label
              htmlFor={`${uid}-organic`}
              className="cursor-pointer text-sm text-charcoal/85 transition-colors hover:text-forest"
            >
              {t('shop.organic')}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id={`${uid}-sustainable`}
              checked={sustainableOnly}
              onCheckedChange={(v) => onSustainableChange(v === true)}
              className="rounded-none border-charcoal/30 shadow-none data-[state=checked]:border-forest data-[state=checked]:bg-forest"
            />
            <Label
              htmlFor={`${uid}-sustainable`}
              className="cursor-pointer text-sm text-charcoal/85 transition-colors hover:text-forest"
            >
              {t('shop.sustainable')}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row — a single editorial radio line ──────────────────────────────────────

function RadioRow({
  id,
  value,
  checked,
  label,
}: {
  id: string;
  value: string;
  checked: boolean;
  label: string;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-3 py-2 text-sm transition-colors',
        checked ? 'font-semibold text-forest' : 'font-normal text-charcoal/75 hover:text-forest',
      )}
    >
      <RadioGroupItem
        value={value}
        id={id}
        className="rounded-none border-charcoal/30 shadow-none data-[state=checked]:border-forest"
      />
      <span>{label}</span>
    </Label>
  );
}
