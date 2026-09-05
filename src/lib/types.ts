// ─── SOVANN FARM — Core type contracts ───────────────────────────────────────

export type CategoryId =
  | 'rice'
  | 'fruits'
  | 'spices'
  | 'sweeteners'
  | 'nuts'
  | 'farm-goods'
  | 'artisan'
  | 'gifts';

export type ProvinceId =
  | 'battambang'
  | 'siemreap'
  | 'kampongthom'
  | 'mondulkiri'
  | 'kampongcham'
  | 'preyveng'
  | 'takeo'
  | 'kampot';

export interface ProductSize {
  label: string; // e.g. "100g", "1kg", "Each"
  price: number; // USD
}

export interface Product {
  id: string;
  slug: string; // used in #/product/:slug
  name: string;
  nameKh?: string;
  category: CategoryId;
  province: ProvinceId | 'multi';
  farmerId: string | null;
  farmerName: string;
  price: number; // base price (first size) USD
  sizes: ProductSize[];
  unit: string; // e.g. "250g bag"
  rating: number; // 0–5
  reviews: number;
  organic: boolean;
  sustainable: boolean;
  bestseller: boolean;
  isNew: boolean;
  featured: boolean; // shows in homepage "From Our Fields"
  image: string;
  description: string;
  story: string; // origin paragraph used on product page
  stock: number;
}

export interface Farmer {
  id: string;
  slug: string;
  name: string;
  nameKh?: string;
  role: string; // e.g. "Rice Farmer"
  roleKh?: string;
  province: ProvinceId;
  specialty: string;
  yearsFarming: number;
  farmSize: string; // e.g. "6 hectares"
  portrait: string;
  farmImage: string;
  quote: string;
  story: string[]; // long-form paragraphs (Their Story)
  farm: string[]; // paragraphs (The Farm)
  practices: string[]; // farming practice bullets
  sustainability: string;
  products: string[]; // product slugs
}

export type StoryBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; caption?: string }
  | { type: 'image'; image: string; caption?: string };

export interface Story {
  id: string;
  slug: string;
  title: string;
  titleKh?: string;
  excerpt: string;
  category: string; // e.g. "Spices", "People", "Traditions"
  author: string;
  date: string; // ISO
  readTime: number; // minutes
  image: string;
  featured: boolean;
  content: StoryBlock[];
  relatedProductSlug?: string; // CTA at article end
}

export interface Province {
  id: ProvinceId;
  name: string;
  nameKh: string;
  path: string; // SVG path on 640×440 viewBox
  label: { x: number; y: number };
  image: string;
  description: string;
  tagline: string; // e.g. "Pepper Coast"
  knownFor: string[]; // e.g. ["Kampot pepper", "Sea salt", "Durian"]
}

export interface Category {
  id: CategoryId;
  name: string;
  nameKh: string;
  description: string;
  image: string;
}

// ─── View router ─────────────────────────────────────────────────────────────

export type View =
  | { name: 'home' }
  | { name: 'shop'; category?: CategoryId; province?: ProvinceId; query?: string }
  | { name: 'product'; slug: string }
  | { name: 'farmers' }
  | { name: 'farmer'; slug: string }
  | { name: 'stories' }
  | { name: 'story'; slug: string }
  | { name: 'about'; anchor?: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'confirmation'; orderId: string }
  | { name: 'track'; orderNumber: string }
  | { name: 'wishlist' }
  | { name: 'account' };

export interface ViewProps {
  view: View;
}

// ─── Cart & orders ───────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  size: string; // size label
  qty: number;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
  farmerName: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string; // e.g. SF-2026-0481
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number; // harvest loyalty −5%
  promoCode?: string; // e.g. HARVEST10
  promoDiscount?: number; // USD
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    district?: string;
    instructions?: string;
  };
  delivery: string; // standard | express | pickup
  payment: string; // card | aba | acleda | wing | cod
  farmersSupported: number;
  eta: string; // human readable
  giftWrap?: boolean; // hand-tied kraft wrap + story card
  giftNote?: string; // handwritten message
}

export interface DeliveryMethod {
  id: 'standard' | 'express' | 'pickup';
  fee: number;
}

export interface PaymentMethod {
  id: 'card' | 'aba' | 'acleda' | 'wing' | 'cod';
}
