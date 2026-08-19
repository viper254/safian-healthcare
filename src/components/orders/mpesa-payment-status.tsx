"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MpesaPaymentStatus({ reference }: { reference: string }) {
  const [state, setState] = useState<"pending" | "paid" | "failed" | "timeout">("pending");
  const [message, setMessage] = useState("Waiting for M-Pesa confirmation…");

  useEffect(() => {
    let active = true;
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const response = await fetch(
          `/api/payments/mpesa/status?reference=${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        const data = await response.json().catch(() => ({}));
        if (!active) return;

        if (response.ok && data.paymentStatus === "paid") {
          setState("paid");
          setMessage("Payment confirmed. Your order is now being processed.");
          return;
        }
        if (response.ok && data.paymentStatus === "failed") {
          setState("failed");
          setMessage("The M-Pesa payment was cancelled or declined. You can contact us or try again.");
          return;
        }
        if (Date.now() - startedAt >= 120_000) {
          setState("timeout");
          setMessage("The payment is still processing. Check your order history shortly for the final status.");
          return;
        }
      } catch {
        if (Date.now() - startedAt >= 120_000 && active) {
          setState("timeout");
          setMessage("We could not confirm the payment yet. Check your order history shortly.");
          return;
        }
      }

      if (active) timer = setTimeout(poll, 3_000);
    }

    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  const paid = state === "paid";
  const failed = state === "failed";
  const timeout = state === "timeout";

  return (
    <div
      className={`mt-6 rounded-xl border p-5 ${
        paid
          ? "border-brand-green-500 bg-brand-green-50 dark:bg-brand-green-950/20"
          : failed
            ? "border-destructive/50 bg-destructive/10"
            : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {paid ? (
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-brand-green-600" />
        ) : failed ? (
          <CircleAlert className="mt-0.5 size-6 shrink-0 text-destructive" />
        ) : timeout ? (
          <Clock className="mt-0.5 size-6 shrink-0 text-blue-600" />
        ) : (
          <Loader2 className="mt-0.5 size-6 shrink-0 animate-spin text-blue-600" />
        )}
        <div>
          <p className="font-semibold">
            {paid ? "M-Pesa payment confirmed" : failed ? "Payment not completed" : timeout ? "Payment confirmation is taking longer" : "Confirming M-Pesa payment"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {(paid || failed || timeout) && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild size="sm" variant={paid ? "gradient" : "outline"}>
            <Link href="/account/orders">View my orders</Link>
          </Button>
          {failed && (
            <Button asChild size="sm" variant="outline">
              <Link href="/checkout">Return to checkout</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
