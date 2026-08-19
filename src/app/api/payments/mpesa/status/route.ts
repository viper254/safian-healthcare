import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!supabaseIsConfigured()) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const reference = new URL(request.url).searchParams.get("reference")?.trim();
  if (!reference || !/^SAF-[A-Z0-9-]{6,40}$/.test(reference)) {
    return NextResponse.json({ error: "A valid order reference is required." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, reference, payment_method, payment_status, payment_ref, status, total")
      .eq("reference", reference)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    let transaction: Record<string, unknown> | null = null;
    try {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("mpesa_transactions")
        .select("status, result_code, result_description, mpesa_receipt_number, amount, updated_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      transaction = data;
    } catch (error) {
      console.error("M-Pesa status lookup failed", error);
    }

    return NextResponse.json({
      reference: order.reference,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: order.status,
      paymentReference: order.payment_ref,
      total: Number(order.total),
      transaction,
    });
  } catch (error) {
    console.error("M-Pesa status request failed", error);
    return NextResponse.json({ error: "Could not retrieve payment status." }, { status: 500 });
  }
}
