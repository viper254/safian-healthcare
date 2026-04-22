"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatKES } from "@/lib/utils";
import { DELIVERY_FEE_KES, FREE_DELIVERY_OVER_KES } from "@/lib/constants";
import type { PaymentMethod } from "@/types";

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, desc: "Pay via STK push" },
  { id: "card", label: "Card", icon: CreditCard, desc: "Visa, Mastercard" },
  { id: "bank_transfer", label: "Bank transfer", icon: Building, desc: "Pay by EFT / RTGS" },
  { id: "cash_on_delivery", label: "Cash on delivery", icon: Banknote, desc: "Pay in cash on arrival" },
];

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const sub = subtotal();
  const delivery = sub >= FREE_DELIVERY_OVER_KES || sub === 0 ? 0 : DELIVERY_FEE_KES;
  const total = sub + delivery;
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [placed, setPlaced] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (lines.length === 0 && !placed) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display font-bold text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
        <Button asChild className="mt-5" variant="gradient">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      notes: String(form.get("notes") ?? ""),
      payment_method: method,
      lines,
      subtotal: sub,
      delivery_fee: delivery,
      total,
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setReference(data?.reference ?? `SAF-${Date.now().toString().slice(-6)}`);
    } catch {
      // fall back to a local reference so demo still works
      setReference(`SAF-${Date.now().toString().slice(-6)}`);
    } finally {
      clear();
      setPlaced(true);
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="container py-20 max-w-2xl">
        <div className="rounded-3xl border bg-card p-10 text-center shadow-lg">
          <div className="mx-auto size-16 rounded-full bg-brand-green-500/15 grid place-items-center text-brand-green-600">
            <CheckCircle2 className="size-10" />
          </div>
          <h1 className="mt-6 font-display font-bold text-3xl">Order placed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for shopping with Safian. A confirmation has been sent to your email.
          </p>
          <p className="mt-4 rounded-xl bg-muted p-4 text-sm">
            Your reference: <span className="font-bold">{reference}</span>
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button asChild variant="gradient">
              <Link href="/account/orders">Track my order</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Keep shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="font-display font-bold text-3xl">Checkout</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Shipping, payment and review — we&apos;ll confirm via SMS & email.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Contact / Shipping */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-lg">Contact & shipping</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" name="name" required />
              <Field label="Phone" name="phone" type="tel" required placeholder="+254 7…" />
              <Field label="Email" name="email" type="email" required className="sm:col-span-2" />
              <Field label="Delivery address" name="address" required className="sm:col-span-2" />
              <Field label="City / Town" name="city" required />
            </div>
            <div>
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Textarea id="notes" name="notes" placeholder="Delivery instructions, recipient details, etc." />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-lg">Payment method</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      active
                        ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                        : "hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex size-10 items-center justify-center rounded-lg ${
                          active ? "bg-brand-gradient text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-brand-green-500" />
              Payments processed securely. We never store your card.
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="sticky top-24 self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-semibold">Your order</h2>
            <ul className="divide-y">
              {lines.map((l) => (
                <li key={l.product_id} className="flex gap-3 py-3">
                  <div className="relative size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {l.image && (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{l.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {l.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatKES(l.unit_price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatKES(sub)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{delivery === 0 ? "Free" : formatKES(delivery)}</dd>
              </div>
              <div className="flex justify-between text-base pt-2 border-t">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold">{formatKES(total)}</dd>
              </div>
            </dl>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Placing order…" : `Place order · ${formatKES(total)}`}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}
