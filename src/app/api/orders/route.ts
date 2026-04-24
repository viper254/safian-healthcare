import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import type { CartLine, PaymentMethod } from "@/types";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status?: string;
  status?: string;
  lines: CartLine[];
  subtotal: number;
  delivery_fee: number;
  total: number;
};

function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAF-${ts}-${rand}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || !body.lines?.length) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const reference = generateReference();

  if (!supabaseIsConfigured()) {
    return NextResponse.json({
      reference,
      demo: true,
      message: "Order recorded locally (Supabase not configured).",
    });
  }

  try {
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

    return NextResponse.json({ reference, id: order.id });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" }, 
      { status: 500 }
    );
  }
}
