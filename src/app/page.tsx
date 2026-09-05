'use client';

import dynamic from 'next/dynamic';
import { useRouterStore } from '@/lib/stores/router';
import { ViewSkeleton } from '@/components/views/ViewSkeleton';
import type { ViewProps } from '@/lib/types';

// Lazy-loaded views — code-split so the homepage stays fast on Cambodian mobile networks.
const HomeView = dynamic(() => import('@/components/views/HomeView'), { ssr: false, loading: () => <ViewSkeleton /> });
const ShopView = dynamic(() => import('@/components/views/ShopView'), { ssr: false, loading: () => <ViewSkeleton /> });
const ProductView = dynamic(() => import('@/components/views/ProductView'), { ssr: false, loading: () => <ViewSkeleton /> });
const FarmersView = dynamic(() => import('@/components/views/FarmersView'), { ssr: false, loading: () => <ViewSkeleton /> });
const FarmerProfileView = dynamic(() => import('@/components/views/FarmerProfileView'), { ssr: false, loading: () => <ViewSkeleton /> });
const StoriesView = dynamic(() => import('@/components/views/StoriesView'), { ssr: false, loading: () => <ViewSkeleton /> });
const StoryArticleView = dynamic(() => import('@/components/views/StoryArticleView'), { ssr: false, loading: () => <ViewSkeleton /> });
const AboutView = dynamic(() => import('@/components/views/AboutView'), { ssr: false, loading: () => <ViewSkeleton /> });
const CartView = dynamic(() => import('@/components/views/CartView'), { ssr: false, loading: () => <ViewSkeleton /> });
const CheckoutView = dynamic(() => import('@/components/views/CheckoutView'), { ssr: false, loading: () => <ViewSkeleton /> });
const ConfirmationView = dynamic(() => import('@/components/views/ConfirmationView'), { ssr: false, loading: () => <ViewSkeleton /> });
const WishlistView = dynamic(() => import('@/components/views/WishlistView'), { ssr: false, loading: () => <ViewSkeleton /> });
const AccountView = dynamic(() => import('@/components/views/AccountView'), { ssr: false, loading: () => <ViewSkeleton /> });

function renderView(view: ReturnType<typeof useRouterStore.getState>['view']) {
  const props: ViewProps = { view };
  switch (view.name) {
    case 'shop':
      return <ShopView {...props} />;
    case 'product':
      return <ProductView {...props} />;
    case 'farmers':
      return <FarmersView {...props} />;
    case 'farmer':
      return <FarmerProfileView {...props} />;
    case 'stories':
      return <StoriesView {...props} />;
    case 'story':
      return <StoryArticleView {...props} />;
    case 'about':
      return <AboutView {...props} />;
    case 'cart':
      return <CartView {...props} />;
    case 'checkout':
      return <CheckoutView {...props} />;
    case 'confirmation':
      return <ConfirmationView {...props} />;
    case 'wishlist':
      return <WishlistView {...props} />;
    case 'account':
      return <AccountView {...props} />;
    case 'home':
    default:
      return <HomeView {...props} />;
  }
}

export default function Page() {
  const view = useRouterStore((s) => s.view);
  return <div key={JSON.stringify(view)} className="animate-fade-in">{renderView(view)}</div>;
}
