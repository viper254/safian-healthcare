import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseMpesaCallback } from "@/lib/mpesa";

export const runtime = "nodejs";

const acceptedResponse = () =>
  NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

async function findTransaction(checkoutRequestId: string) {
  const admin = createSupabaseAdminClient();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data, error } = await admin
      .from("mpesa_transactions")
      .select("id, order_id, phone, amount, status, mpesa_receipt_number")
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle();
    if (error) throw error;
    if (data) return { admin, transaction: data };
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return { admin, transaction: null };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    console.warn("Received an invalid M-Pesa callback body");
    return acceptedResponse();
  }

  const callback = parseMpesaCallback(payload);
  if (!callback) {
    console.warn("Received an unrecognized M-Pesa callback payload");
    return acceptedResponse();
  }

  try {
    const { admin, transaction } = await findTransaction(callback.checkoutRequestId);
    if (!transaction) {
      console.warn("M-Pesa callback did not match a stored transaction", {
        checkoutRequestId: callback.checkoutRequestId,
      });
      return acceptedResponse();
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, total, payment_status")
      .eq("id", transaction.order_id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) {
      console.warn("M-Pesa callback matched a transaction with no order", {
        checkoutRequestId: callback.checkoutRequestId,
      });
      return acceptedResponse();
    }

    if (transaction.status === "paid") return acceptedResponse();

    if (callback.resultCode !== 0) {
      await admin
        .from("mpesa_transactions")
        .update({
          status: "failed",
          result_code: callback.resultCode,
          result_description: callback.resultDescription,
        })
        .eq("id", transaction.id)
        .neq("status", "paid");

      if (order.payment_status !== "paid") {
        await admin
          .from("orders")
          .update({ payment_status: "failed", payment_ref: callback.checkoutRequestId })
          .eq("id", order.id)
          .neq("payment_status", "paid");
      }
      return acceptedResponse();
    }

    const expectedAmount = Math.round(Number(order.total));
    const callbackAmount = callback.amount === null ? null : Math.round(callback.amount);
    const expectedPhone = String(transaction.phone);
    const callbackPhone = callback.phoneNumber
      ? callback.phoneNumber.replace(/\D/g, "")
      : null;
    const amountMatches = callbackAmount !== null && callbackAmount === expectedAmount;
    const phoneMatches = callbackPhone !== null && callbackPhone === expectedPhone;
    const receiptPresent = Boolean(callback.receiptNumber);

    if (!amountMatches || !phoneMatches || !receiptPresent) {
      const mismatchReason = !amountMatches
        ? "Callback amount did not match the order total"
        : !phoneMatches
          ? "Callback phone number did not match the payment phone"
          : "Successful callback did not include an M-Pesa receipt";
      console.warn("M-Pesa callback verification failed", {
        checkoutRequestId: callback.checkoutRequestId,
        reason: mismatchReason,
      });

      await admin
        .from("mpesa_transactions")
        .update({
          status: "mismatch",
          result_code: callback.resultCode,
          result_description: mismatchReason,
        })
        .eq("id", transaction.id)
        .neq("status", "paid");

      if (order.payment_status !== "paid") {
        await admin
          .from("orders")
          .update({ payment_status: "failed", payment_ref: callback.checkoutRequestId })
          .eq("id", order.id)
          .neq("payment_status", "paid");
      }
      return acceptedResponse();
    }

    if (order.payment_status !== "paid") {
      const { error: paymentError } = await admin
        .from("orders")
        .update({
          payment_status: "paid",
          payment_ref: callback.receiptNumber,
        })
        .eq("id", order.id)
        .neq("payment_status", "paid");
      if (paymentError) throw paymentError;
    }

    const { error: transactionError } = await admin
      .from("mpesa_transactions")
      .update({
        status: "paid",
        result_code: callback.resultCode,
        result_description: callback.resultDescription,
        mpesa_receipt_number: callback.receiptNumber,
        transaction_date: callback.transactionDate,
      })
      .eq("id", transaction.id)
      .neq("status", "paid");
    if (transactionError) throw transactionError;
  } catch (error) {
    console.error("M-Pesa callback processing failed", error);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Callback processing failed" },
      { status: 500 },
    );
  }

  return acceptedResponse();
}
