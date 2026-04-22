import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import type { Category, Product } from "@/types";
import {
  mockCategories,
  mockFeatured,
  mockProductBySlug,
  mockProducts,
  mockProductsByCategory,
} from "@/lib/mock-data";

/**
 * All data access is isolated here so pages can ignore whether the data is
 * coming from a Supabase project or from the local mock seed.
 */

type AnyRecord = Record<string, unknown>;

function mapProduct(row: AnyRecord, cats: Category[]): Product {
  const category = cats.find((c) => c.id === row.category_id);
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ""),
    short_description: (row.short_description as string | null) ?? null,
    category_id: String(row.category_id),
    category,
    original_price: Number(row.original_price),
    discounted_price: row.discounted_price === null ? null : Number(row.discounted_price),
    offer_price: row.offer_price === null ? null : Number(row.offer_price),
    offer_expires_at: (row.offer_expires_at as string | null) ?? null,
    stock_quantity: Number(row.stock_quantity ?? 0),
    low_stock_threshold: Number(row.low_stock_threshold ?? 5),
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active === undefined ? true : Boolean(row.is_active),
    sku: (row.sku as string | null) ?? null,
    brand: (row.brand as string | null) ?? null,
    tags: (row.tags as string[] | null) ?? [],
    images: Array.isArray(row.images)
      ? (row.images as Array<{ url: string; alt?: string | null }>)
      : [],
    specs: (row.specs as Record<string, string> | null) ?? {},
    rating_avg: Number(row.rating_avg ?? 0),
    rating_count: Number(row.rating_count ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getCategories(): Promise<Category[]> {
  if (!supabaseIsConfigured()) return mockCategories;
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data) return mockCategories;
    return data as Category[];
  } catch {
    return mockCategories;
  }
}

export async function getProducts(opts?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}): Promise<Product[]> {
  if (!supabaseIsConfigured()) {
    let list = [...mockProducts];
    if (opts?.categorySlug) {
      list = list.filter((p) => p.category?.slug === opts.categorySlug);
    }
    if (opts?.featured) list = list.filter((p) => p.is_featured);
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q),
      );
    }
    if (opts?.limit) list = list.slice(0, opts.limit);
    return list;
  }

  try {
    const supabase = createSupabaseServerClient();
    const cats = await getCategories();
    let query = supabase.from("products").select("*").eq("is_active", true);
    if (opts?.featured) query = query.eq("is_featured", true);
    if (opts?.categorySlug) {
      const cat = cats.find((c) => c.slug === opts.categorySlug);
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (opts?.search) {
      query = query.ilike("name", `%${opts.search}%`);
    }
    if (opts?.limit) query = query.limit(opts.limit);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as AnyRecord[]).map((r) => mapProduct(r, cats));
  } catch {
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!supabaseIsConfigured()) return mockProductBySlug(slug);
  try {
    const supabase = createSupabaseServerClient();
    const cats = await getCategories();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return undefined;
    return mapProduct(data as AnyRecord, cats);
  } catch {
    return mockProductBySlug(slug);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!supabaseIsConfigured()) return mockFeatured();
  return getProducts({ featured: true, limit: 8 });
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  if (!supabaseIsConfigured()) return mockProductsByCategory(slug as never);
  return getProducts({ categorySlug: slug });
}

export function isUsingMockData(): boolean {
  return !supabaseIsConfigured();
}
