'use client';

import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { Farmer, Product, Province } from '@/lib/types';
import { useLang } from '@/lib/stores/lang';
import {
  MAP_VIEWBOX,
  fillerShapes,
  provinceShapes,
  tonleSapPath,
} from '@/lib/data/provinces';
import { SmartImage } from '@/components/shared/SmartImage';
import { cn } from '@/lib/utils';

// ─── OriginChain — the story of one product in four steps ─────────────────────
// 01 Cambodia (map) → 02 Province → 03 Farm → 04 Product

interface OriginChainProps {
  product: Product;
  province?: Province;
  farmer?: Farmer;
}

interface ChainStep {
  caption: string;
  visual: ReactNode;
}

export function OriginChain({ product, province, farmer }: OriginChainProps) {
  const { lang } = useLang();

  const productName = lang === 'kh' && product.nameKh ? product.nameKh : product.name;
  const farmName = farmer ? farmer.name : product.farmerName;
  const provinceCaption =
    product.province === 'multi'
      ? lang === 'kh'
        ? 'ខេត្តច្រើន'
        : 'Multiple Provinces'
      : province
        ? lang === 'kh'
          ? province.nameKh
          : province.name
        : 'Cambodia';

  const targetProvince = product.province; // 'multi' highlights every province

  const steps: ChainStep[] = [
    {
      caption: 'Cambodia',
      visual: (
        <svg
          viewBox={MAP_VIEWBOX}
          className="h-24 w-auto"
          aria-hidden="true"
          role="img"
          aria-label={`Map of Cambodia${province ? ` — ${province.name}` : ''}`}
        >
          {/* neutral backdrop provinces */}
          {fillerShapes.map((shape) => (
            <path
              key={shape.id}
              d={shape.path}
              className="fill-parchment stroke-charcoal/15"
              strokeWidth={1}
            />
          ))}
          {/* sourceable provinces — the product's province glows gold */}
          {(Object.keys(provinceShapes) as (keyof typeof provinceShapes)[]).map((id) => {
            const highlighted = targetProvince === 'multi' || targetProvince === id;
            return (
              <path
                key={id}
                d={provinceShapes[id].path}
                className={cn(
                  highlighted
                    ? 'fill-gold stroke-forest-deep'
                    : 'fill-moss/15 stroke-charcoal/25',
                )}
                strokeWidth={1}
              />
            );
          })}
          {/* Tonle Sap */}
          <path d={tonleSapPath} className="fill-mekong/30 stroke-mekong/40" strokeWidth={1} />
        </svg>
      ),
    },
    {
      caption: provinceCaption,
      visual: province ? (
        <SmartImage
          src={province.image}
          alt={`${province.name} — ${province.tagline}`}
          ratio="square"
          className="h-24 w-24 border border-charcoal/15"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center border border-charcoal/15 bg-parchment">
          <span className="font-display text-2xl text-stone">KH</span>
        </div>
      ),
    },
    {
      caption: farmName,
      visual: (
        <SmartImage
          src={farmer?.farmImage ?? province?.image ?? product.image}
          alt={`${farmName} — farm`}
          ratio="square"
          className="h-24 w-24 border border-charcoal/15"
        />
      ),
    },
    {
      caption: productName,
      visual: (
        <SmartImage
          src={product.image}
          alt={productName}
          ratio="square"
          className="h-24 w-24 border border-charcoal/15"
        />
      ),
    },
  ];

  return (
    <div>
      {/* Desktop — horizontal journey */}
      <ol className="hidden items-center justify-between gap-4 md:flex" aria-label="Origin chain">
        {steps.map((step, i) => (
          <li key={`desktop-${i}`} className="flex flex-1 items-center gap-4 last:flex-none">
            <Step index={i} caption={step.caption}>
              {step.visual}
            </Step>
            {i < steps.length - 1 && (
              <ArrowRight
                className="h-5 w-5 shrink-0 text-gold"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>

      {/* Mobile — vertical journey */}
      <ol className="flex flex-col items-center gap-5 md:hidden" aria-label="Origin chain">
        {steps.map((step, i) => (
          <li key={`mobile-${i}`} className="flex flex-col items-center">
            <Step index={i} caption={step.caption}>
              {step.visual}
            </Step>
            {i < steps.length - 1 && (
              <ArrowDown
                className="mt-5 h-5 w-5 text-gold"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Step — numbered editorial node ───────────────────────────────────────────

function Step({
  index,
  caption,
  children,
}: {
  index: number;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex flex-col items-center text-center">
      <figcaption className="eyebrow text-terracotta">
        {String(index + 1).padStart(2, '0')}
      </figcaption>
      <div className="mt-4">{children}</div>
      <p className="eyebrow mt-4 max-w-[150px] leading-relaxed text-charcoal">{caption}</p>
    </figure>
  );
}
