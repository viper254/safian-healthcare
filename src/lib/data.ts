import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_META } from "@/lib/constants";
import type { Category, Product } from "@/types";

type AnyRecord = Record<string, unknown>;

/**
 * Production data access - all data comes from Supabase
 * No mock data fallbacks - requires proper database setup
 */

function mapProduct(row: AnyRecord, categories: Category[]): Product {
  const cat = categories.find((c) => c.id === row.category_id);
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    short_description: (row.short_description as string) || "",
    description: row.description as string,
    brand: (row.brand as string) || "",
    sku: (row.sku as string) || "",
    category_id: row.category_id as string,
    category: cat
      ? { 
          id: cat.id, 
          slug: cat.slug, 
          name: cat.name,
          description: null,
          icon: null,
          image_url: null,
          sort_order: 0,
          created_at: ""
        }
      : undefined,
    original_price: Number(row.original_price),
    discounted_price: row.discounted_price ? Number(row.discounted_price) : null,
    offer_price: row.offer_price ? Number(row.offer_price) : null,
    offer_expires_at: row.offer_expires_at ? (row.offer_expires_at as string) : null,
    stock_quantity: Number(row.stock_quantity),
    low_stock_threshold: Number(row.low_stock_threshold ?? 5),
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    tags: (row.tags as string[]) || [],
    specs: (row.specs as Record<string, string>) || {},
    rating_avg: Number(row.rating_avg ?? 0),
    rating_count: Number(row.rating_count ?? 0),
    images: Array.isArray(row.media)
      ? (row.media as AnyRecord[]).map((m) => ({
          id: m.id as string,
          url: m.url as string,
          alt: (m.alt as string) || "",
          sort_order: Number(m.sort_order ?? 0),
        }))
      : [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) throw error;
    return (data as Category[]) || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching categories:", error);
    }
    return [];
  }
}

export async function getProducts(opts?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const cats = await getCategories();

    let query = supabase
      .from("products")
      .select("*, media:product_images(*)")
      .eq("is_active", true);

    if (opts?.categorySlug) {
      const cat = cats.find((c) => c.slug === opts.categorySlug);
      if (cat) query = query.eq("category_id", cat.id);
    }

    if (opts?.featured) {
      query = query.eq("is_featured", true);
    }

    if (opts?.search) {
      query = query.or(
        `name.ilike.%${opts.search}%,description.ilike.%${opts.search}%,brand.ilike.%${opts.search}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    if (opts?.limit) {
      query = query.limit(opts.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return (data as AnyRecord[]).map((r) => mapProduct(r, cats));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching products:", error);
    }
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const supabase = await createSupabaseServerClient();
    const cats = await getCategories();
    
    const { data, error } = await supabase
      .from("products")
      .select("*, media:product_images(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return undefined;
    }
    
    if (!data) {
      console.log(`No product found with slug: ${slug}`);
      return undefined;
    }
    
    return mapProduct(data as AnyRecord, cats);
  } catch (error) {
    console.error("Error fetching product:", error);
    return undefined;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ featured: true, limit: 8 });
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return getProducts({ categorySlug: slug });
}
