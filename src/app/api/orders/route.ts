import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import type { CartLine, PaymentMethod } from "@/types";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

const cartLineSchema = z.object({
  product_id: z.string().uuid(),
  slug: z.string(),
  name: z.string().min(1),
  category_slug: z.string(),
  unit_price: z.number().positive(),
  price_type: z.enum(["offer", "discounted", "regular"]),
  quantity: z.number().int().positive().max(999),
  image: z.string().url().optional().or(z.literal("")),
  stock: z.number().int().nonnegative(),
});

const orderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^0\d{9}$/, "Phone must be 10 digits starting with 0").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(2, "City is required").optional(),
  notes: z.string().optional(),
  payment_method: z.enum(["mpesa", "till", "card", "cash_on_delivery", "bank_transfer"]),
  payment_status: z.enum(["unpaid", "paid", "refunded", "failed"]).optional(),
  status: z.enum(["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled"]).optional(),
  lines: z.array(cartLineSchema).min(1, "Cart must have at least one item"),
  subtotal: z.number().nonnegative(),
  delivery_fee: z.number().nonnegative(),
  total: z.number().positive(),
});

type Body = z.infer<typeof orderSchema>;

function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAF-${ts}-${rand}`;
}

export async function POST(request: Request) {
  // Rate limiting - now edge-compatible
  const identifier = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(`orders:${identifier}`, RATE_LIMITS.orders);
  
  // Add rate limit headers to response
  const rateLimitHeaders = rateLimitResult.headers;

  try {
    const rawBody = await request.json().catch(() => null);
    
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Validate input
    const validation = orderSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const body = validation.data;

    // Verify total calculation
    const calculatedSubtotal = body.lines.reduce((sum, line) => sum + (line.unit_price * line.quantity), 0);
    const calculatedTotal = calculatedSubtotal + body.delivery_fee;
    
    if (Math.abs(calculatedSubtotal - body.subtotal) > 0.01 || Math.abs(calculatedTotal - body.total) > 0.01) {
      return NextResponse.json({ 
        error: "Price calculation mismatch. Please refresh and try again." 
      }, { status: 400 });
    }

    const reference = generateReference();

    if (!supabaseIsConfigured()) {
      return NextResponse.json({
        reference,
        demo: true,
        message: "Order recorded locally (Supabase not configured).",
      });
    }

    const supabase = await createSupabaseServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    
    // For WhatsApp orders, use placeholder data if not provided
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        reference,
        user_id: authUser.user?.id ?? null,
        customer_name: body.name || "WhatsApp Customer",
        customer_email: body.email || "",
        customer_phone: body.phone || "",
        shipping_address: body.address || "To be confirmed via WhatsApp",
        shipping_city: body.city || "Nairobi",
        shipping_notes: body.notes ?? null,
        subtotal: body.subtotal,
        delivery_fee: body.delivery_fee,
        total: body.total,
        status: body.status || "pending",
        payment_status: body.payment_status || "unpaid",
        payment_method: body.payment_method,
      })
      .select()
      .single();
      
    if (orderErr) {
      console.error("Order creation error:", orderErr);
      throw orderErr;
    }
    
    if (!order) {
      throw new Error("Order not created");
    }

    const items = body.lines.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      product_name: l.name,
      product_slug: l.slug,
      unit_price: l.unit_price,
      quantity: l.quantity,
      line_total: l.unit_price * l.quantity,
    }));
    
    const { error: itemsErr } = await supabase.from("order_items").insert(items);
    if (itemsErr) {
      console.error("Order items error:", itemsErr);
      throw itemsErr;
    }

    // Log analytics event
    const { error: analyticsErr } = await supabase.from("analytics_events").insert({
      event_type: "order_placed",
      user_id: authUser.user?.id ?? null,
      metadata: { reference, total: body.total, items: body.lines.length },
    });
    if (analyticsErr) {
      console.error("Analytics error:", analyticsErr);
    }

    return NextResponse.json({ reference, id: order.id }, { headers: rateLimitHeaders });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    
    // Don't expose internal errors to client
    const message = err.code === 'PGRST116' 
      ? "One or more products are no longer available" 
      : "Failed to create order. Please try again.";
    
    return NextResponse.json(
      { error: message }, 
      { status: 500 }
    );
  }
}
