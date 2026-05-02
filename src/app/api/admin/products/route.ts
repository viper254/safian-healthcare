import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  short_description: z.string().max(200).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  category_id: z.string().uuid("Invalid category ID").optional().nullable(),
  category_ids: z.array(z.string().uuid()).optional().default([]), // Multiple categories
  original_price: z.number().positive("Price must be positive"),
  discounted_price: z.number().positive().optional().nullable(),
  offer_price: z.number().positive().optional().nullable(),
  stock_quantity: z.number().int().nonnegative("Stock must be non-negative"),
  low_stock_threshold: z.number().int().positive().default(5),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export async function POST(request: Request) {
  // Rate limiting - edge-compatible
  const identifier = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(`admin:products:${identifier}`, RATE_LIMITS.api);
  
  const rateLimitHeaders = rateLimitResult.headers;

  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate input
    const rawBody = await request.json();
    const validation = productSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const body = validation.data;

    // Create product
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        short_description: body.short_description || null,
        brand: body.brand || null,
        sku: body.sku || null,
        category_id: body.category_id || null,
        original_price: body.original_price,
        discounted_price: body.discounted_price || null,
        offer_price: body.offer_price || null,
        stock_quantity: body.stock_quantity,
        low_stock_threshold: body.low_stock_threshold,
        is_featured: body.is_featured,
        is_active: body.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      
      // Handle specific errors
      if (error.code === '23505') {
        return NextResponse.json({ error: "Product with this slug or SKU already exists" }, { status: 409 });
      }
      
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    // Insert product-category relationships
    if (body.category_ids && body.category_ids.length > 0) {
      const categoryRelations = body.category_ids.map(categoryId => ({
        product_id: data.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from("product_categories")
        .insert(categoryRelations);

      if (categoryError) {
        console.error("Error creating product-category relations:", categoryError);
        // Don't fail the whole operation, just log the error
      }
    }

    return NextResponse.json(data, { headers: rateLimitHeaders });
  } catch (error) {
    console.error("Error in POST /api/admin/products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
