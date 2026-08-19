import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import { calculateDeliveryFee, normalizeKenyanPhone } from "@/lib/checkout";
import { effectivePrice } from "@/lib/utils";
import { initiateStkPush, MpesaError } from "@/lib/mpesa";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(9).max(20),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().max(250).optional().default("To be confirmed"),
  notes: z.string().trim().max(500).optional(),
  lines: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1)
    .max(50),
});

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  original_price: number | string;
  discounted_price: number | string | null;
  offer_price: number | string | null;
  offer_expires_at: string | null;
  stock_quantity: number;
  is_active: boolean;
};

function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `SAF-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(
    `mpesa-initiate:${getClientIdentifier(request)}`,
    RATE_LIMITS.orders,
  );
  const headers = rateLimit.headers;

  if (!supabaseIsConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 503, headers },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid checkout details", details: validation.error.issues },
        { status: 400, headers },
      );
    }

    const input = validation.data;
    const phone = normalizeKenyanPhone(input.phone);
    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid Kenyan Safaricom phone number, for example 0712345678." },
        { status: 400, headers },
      );
    }

    const productIds = [...new Set(input.lines.map((line) => line.product_id))];
    if (productIds.length !== input.lines.length) {
      return NextResponse.json(
        { error: "Each product may appear only once in the cart." },
        { status: 400, headers },
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json(
        { error: "Please sign in before paying with M-Pesa." },
        { status: 401, headers },
      );
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id, slug, name, original_price, discounted_price, offer_price, offer_expires_at, stock_quantity, is_active",
      )
      .in("id", productIds);

    if (productsError) throw productsError;
    const productMap = new Map(
      ((products ?? []) as ProductRow[]).map((product) => [product.id, product]),
    );

    const pricedLines = [] as Array<{
      product_id: string;
      product_name: string;
      product_slug: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;

    for (const line of input.lines) {
      const product = productMap.get(line.product_id);
      if (!product || !product.is_active) {
        return NextResponse.json(
          { error: "One or more products are no longer available." },
          { status: 400, headers },
        );
      }
      if (line.quantity > product.stock_quantity) {
        return NextResponse.json(
          {
            error: `${product.name} has only ${product.stock_quantity} item(s) available.`,
          },
          { status: 400, headers },
        );
      }

      const { price } = effectivePrice({
        original_price: Number(product.original_price),
        discounted_price: Number(product.discounted_price ?? 0) || null,
        offer_price: Number(product.offer_price ?? 0) || null,
        offer_expires_at: product.offer_expires_at,
      });
      const lineTotal = Number((price * line.quantity).toFixed(2));
      pricedLines.push({
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        quantity: line.quantity,
        unit_price: price,
        line_total: lineTotal,
      });
    }

    const subtotal = Number(
      pricedLines.reduce((sum, line) => sum + line.line_total, 0).toFixed(2),
    );
    const deliveryFee = calculateDeliveryFee(input.city, subtotal);
    const total = Number((subtotal + deliveryFee).toFixed(2));

    if (!Number.isSafeInteger(total) || total < 1) {
      return NextResponse.json(
        { error: "M-Pesa payments must be a positive whole number of Kenya shillings." },
        { status: 400, headers },
      );
    }

    const reference = generateReference();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        reference,
        user_id: auth.user.id,
        customer_name: input.name,
        customer_email: auth.user.email ?? "",
        customer_phone: phone.local,
        shipping_address: input.address || "To be confirmed",
        shipping_city: input.city,
        shipping_notes: input.notes ?? null,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status: "pending",
        payment_status: "unpaid",
        payment_method: "mpesa",
      })
      .select("id, reference, total")
      .single();

    if (orderError || !order) throw orderError ?? new Error("Order was not created");

    const { error: itemsError } = await supabase.from("order_items").insert(
      pricedLines.map((line) => ({
        order_id: order.id,
        product_id: line.product_id,
        product_name: line.product_name,
        product_slug: line.product_slug,
        unit_price: line.unit_price,
        quantity: line.quantity,
        line_total: line.line_total,
      })),
    );

    if (itemsError) {
      try {
        await createSupabaseAdminClient().from("orders").delete().eq("id", order.id);
      } catch (cleanupError) {
        console.error("Failed to clean up incomplete M-Pesa order", cleanupError);
      }
      throw itemsError;
    }

    let stkPush: Awaited<ReturnType<typeof initiateStkPush>>;
    try {
      stkPush = await initiateStkPush({
        amount: total,
        phone: phone.international,
        accountReference: reference,
        transactionDescription: `Safian order ${reference}`,
      });
    } catch (error) {
      console.error("M-Pesa STK Push initiation failed", error);
      return NextResponse.json(
        {
          error:
            error instanceof MpesaError
              ? error.message
              : "M-Pesa could not start the payment request. Please try again.",
          reference,
        },
        { status: error instanceof MpesaError ? error.status : 502, headers },
      );
    }

    const admin = createSupabaseAdminClient();
    const { error: transactionError } = await admin
      .from("mpesa_transactions")
      .insert({
        order_id: order.id,
        merchant_request_id: stkPush.merchantRequestId || null,
        checkout_request_id: stkPush.checkoutRequestId,
        phone: phone.international,
        amount: total,
        status: "initiated",
      });

    if (transactionError) {
      console.error("Failed to persist M-Pesa transaction", transactionError);
      return NextResponse.json(
        { error: "Payment started, but its status could not be saved. Contact support with reference " + reference },
        { status: 500, headers },
      );
    }

    await admin
      .from("orders")
      .update({ payment_ref: stkPush.checkoutRequestId })
      .eq("id", order.id);

    return NextResponse.json(
      {
        reference,
        orderId: order.id,
        status: "pending",
        customerMessage: stkPush.customerMessage,
      },
      { headers },
    );
  } catch (error) {
    console.error("M-Pesa checkout failed", error);
    return NextResponse.json(
      { error: "We could not create the M-Pesa payment. Please try again." },
      { status: 500, headers },
    );
  }
}
