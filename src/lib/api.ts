import type { Product, Farmer, Story, Province, StoredOrder } from '@/lib/types';

// ─── Typed client for mock REST API (easily swappable with a real backend) ───

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await get<{ products: Product[] }>('/api/products');
  return data.products;
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const data = await get<{ product: Product | null }>(`/api/products?slug=${encodeURIComponent(slug)}`);
  return data.product;
}

export async function fetchFarmers(): Promise<Farmer[]> {
  const data = await get<{ farmers: Farmer[] }>('/api/farmers');
  return data.farmers;
}

export async function fetchFarmer(slug: string): Promise<Farmer | null> {
  const data = await get<{ farmer: Farmer | null }>(`/api/farmers?slug=${encodeURIComponent(slug)}`);
  return data.farmer;
}

export async function fetchStories(): Promise<Story[]> {
  const data = await get<{ stories: Story[] }>('/api/stories');
  return data.stories;
}

export async function fetchStory(slug: string): Promise<Story | null> {
  const data = await get<{ story: Story | null }>(`/api/stories?slug=${encodeURIComponent(slug)}`);
  return data.story;
}

export async function fetchProvinces(): Promise<Province[]> {
  const data = await get<{ provinces: Province[] }>('/api/provinces');
  return data.provinces;
}

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function createOrder(
  payload: Omit<StoredOrder, 'id' | 'orderNumber' | 'createdAt'>,
): Promise<{ ok: boolean; order?: StoredOrder; adjusted?: boolean; message?: string }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── Customer reviews (persisted in SQLite via Prisma) ───────────────────────

export interface CustomerReview {
  id: string;
  productId: string;
  name: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
}

export async function fetchReviews(productId: string): Promise<CustomerReview[]> {
  const data = await get<{ reviews: CustomerReview[] }>(
    `/api/reviews?productId=${encodeURIComponent(productId)}`,
  );
  return data.reviews;
}

export async function createReview(input: {
  productId: string;
  name: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
}): Promise<{ ok: boolean; review?: CustomerReview; message?: string }> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
}

/** Moderation — remove a community review (storekeeper's desk). */
export async function deleteReview(id: string): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  return res.json();
}

// ─── "Notify me at harvest" (persisted in SQLite via Prisma) ─────────────────

export async function subscribeHarvestAlert(
  productId: string,
  email: string,
): Promise<{ ok: boolean; already?: boolean; watchers?: number; message?: string }> {
  const res = await fetch('/api/harvest-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, email }),
  });
  return res.json();
}

export async function fetchHarvestWatchers(productId: string): Promise<number> {
  try {
    const data = await get<{ watchers: number }>(
      `/api/harvest-alerts?productId=${encodeURIComponent(productId)}`,
    );
    return data.watchers;
  } catch {
    return 0;
  }
}

// ─── "Reserve next harvest" (persisted in SQLite via Prisma) ─────────────────

export interface ReserveResult {
  ok: boolean;
  already?: boolean;
  held?: number;
  sizeLabel?: string;
  holds?: number;
  watchers?: number;
  message?: string;
}

/** Hold units of a resting harvest at today's price — pay when it returns. */
export async function reserveHarvest(input: {
  productId: string;
  email: string;
  sizeLabel: string;
  qty: number;
}): Promise<ReserveResult> {
  const res = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function fetchHarvestReservations(
  productId: string,
): Promise<{ holds: number; qty: number }> {
  try {
    return await get<{ holds: number; qty: number }>(
      `/api/reservations?productId=${encodeURIComponent(productId)}`,
    );
  } catch {
    return { holds: 0, qty: 0 };
  }
}

// ─── Storekeeper's desk (demo back-of-house summary) ─────────────────────────

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  province: string;
  itemsCount: number;
  total: number;
  giftWrap: boolean;
  deliveryMethod: string;
  paymentMethod: string;
  createdAt: string;
}

export interface AdminSummary {
  stats: {
    orders: number;
    revenue: number;
    giftOrders: number;
    newsletter: number;
    reviews: number;
    avgReview: number;
    /** Harvest-alert subscribers across all resting harvests. */
    waiting: number;
  };
  recentOrders: AdminOrderRow[];
  /** Full order book (same shape) — feeds the CSV export on the desk. */
  orders: AdminOrderRow[];
  reviews: Omit<CustomerReview, 'verified'>[];
  /** The waiting book — alerts + reservations grouped per harvest. */
  waiting: AdminWaitingRow[];
}

export interface AdminWaitingRow {
  productId: string;
  inSeason: boolean;
  alerts: { email: string; createdAt: string }[];
  reservations: { email: string; sizeLabel: string; qty: number; createdAt: string }[];
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  return get<AdminSummary>('/api/admin/summary');
}
