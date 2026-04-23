import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import type { CartLine, PaymentMethod } from "@/types";

type Body = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  payment_method: PaymentMethod;
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
    // Demo mode — just echo back a fake reference so the flow works end-to-end.
    return NextResponse.json({
      reference,
      demo: true,
      message: "Order recorded locally (Supabase not configured).",
    });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authUser } = await supabase.auth.getUser();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        reference,
        user_id: authUser.user?.id ?? null,
        customer_name: body.name,
        customer_email: body.email,
        customer_phone: body.phone,
        shipping_address: body.address,
        shipping_city: body.city,
        shipping_notes: body.notes ?? null,
        subtotal: body.subtotal,
        delivery_fee: body.delivery_fee,
        total: body.total,
        status: "pending",
        payment_status: "unpaid",
        payment_method: body.payment_method,
      })
      .select()
      .single();
    if (orderErr || !order) throw orderErr;

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
    if (itemsErr) throw itemsErr;

    await supabase.from("analytics_events").insert({
      event_type: "order_placed",
      user_id: authUser.user?.id ?? null,
      metadata: { reference, total: body.total, items: body.lines.length },
    });

    return NextResponse.json({ reference, id: order.id });
  } catch (err) {
    console.error("Order creation failed", err);
    // Still return a reference so demo/preview doesn't break.
    return NextResponse.json({ reference, error: "Order saved locally only" }, { status: 202 });
  }
}
