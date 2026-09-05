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
): Promise<{ ok: boolean; order?: StoredOrder; message?: string }> {
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
