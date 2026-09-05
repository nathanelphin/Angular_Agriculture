'use client';

import type { ViewProps } from '@/lib/types';
import { Hero } from '@/components/home/Hero';
import { LandSection } from '@/components/home/LandSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { CampaignSection } from '@/components/home/CampaignSection';
import { StorytellingSection } from '@/components/home/StorytellingSection';
import { FarmerSpotlight } from '@/components/home/FarmerSpotlight';
import { OriginMapSection } from '@/components/home/OriginMapSection';
import { SustainabilitySection } from '@/components/home/SustainabilitySection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

/**
 * SOVANN FARM homepage — narrative order:
 * CAMBODIA → LAND → HARVEST → PRODUCTS → CATEGORIES → CAMPAIGN →
 * STORIES → FARMERS → ORIGIN → FUTURE → NEWSLETTER
 */
export default function HomeView({ view }: ViewProps) {
  void view;

  return (
    <>
      <Hero />
      <LandSection />
      <FeaturedProducts />
      <CategoriesSection />
      <CampaignSection />
      <StorytellingSection />
      <FarmerSpotlight />
      <OriginMapSection />
      <SustainabilitySection />
      <NewsletterSection />
    </>
  );
}
