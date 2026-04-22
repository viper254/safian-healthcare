"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";
import { DELIVERY_FEE_KES, FREE_DELIVERY_OVER_KES } from "@/lib/constants";

export default function CartPage() {
  const { lines, setQuantity, remove, clear, subtotal } = useCart();
  const sub = subtotal();
  const delivery = sub >= FREE_DELIVERY_OVER_KES || sub === 0 ? 0 : DELIVERY_FEE_KES;
  const total = sub + delivery;

  if (lines.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto size-16 rounded-full bg-brand-gradient grid place-items-center text-white shadow-lg">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="mt-6 font-display font-bold text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our catalogue and add some products to get started.
        </p>
        <Button asChild size="lg" variant="gradient" className="mt-6">
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="font-display font-bold text-3xl">Your cart</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {lines.length} {lines.length === 1 ? "item" : "items"} — review and proceed to checkout.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <div className="space-y-3">
          {lines.map((l) => (
            <article
              key={l.product_id}
              className="flex gap-4 rounded-2xl border bg-card p-3 sm:p-4 shadow-sm"
            >
              <div className="relative w-20 sm:w-28 aspect-square rounded-xl overflow-hidden bg-muted shrink-0">
                {l.image && (
                  <Image src={l.image} alt={l.name} fill sizes="112px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/product/${l.slug}`}
                    className="font-semibold hover:text-primary line-clamp-2"
                  >
                    {l.name}
                  </Link>
                  <button
                    onClick={() => remove(l.product_id)}
                    className="shrink-0 size-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-accent"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Unit: {formatKES(l.unit_price)}
                </span>
                <div className="mt-auto pt-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="inline-flex items-center rounded-full border bg-background overflow-hidden">
                    <button
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-accent disabled:opacity-40"
                      onClick={() => setQuantity(l.product_id, l.quantity - 1)}
                      disabled={l.quantity <= 1}
                      aria-label="Decrease"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{l.quantity}</span>
                    <button
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-accent"
                      onClick={() => setQuantity(l.product_id, l.quantity + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="font-bold">{formatKES(l.unit_price * l.quantity)}</span>
                </div>
              </div>
            </article>
          ))}
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="size-4" /> Clear cart
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <aside className="sticky top-24 self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatKES(sub)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium">
                  {delivery === 0 ? "Free" : formatKES(delivery)}
                </dd>
              </div>
              {sub < FREE_DELIVERY_OVER_KES && (
                <p className="text-xs text-muted-foreground">
                  Spend {formatKES(FREE_DELIVERY_OVER_KES - sub)} more for free delivery.
                </p>
              )}
              <div className="border-t pt-3 flex justify-between text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold">{formatKES(total)}</dd>
              </div>
            </dl>
            <Button asChild variant="gradient" size="lg" className="w-full">
              <Link href="/checkout">
                Proceed to checkout
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Safe & secure · M-Pesa · Card · Cash on delivery
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
