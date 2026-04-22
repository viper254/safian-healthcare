"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { effectivePrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function AddToCartBar({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const { price, type } = effectivePrice(product);
  const outOfStock = product.stock_quantity === 0;
  const max = Math.max(1, product.stock_quantity);
  const handleAdd = (redirect: boolean) => {
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      category_slug: product.category?.slug ?? "",
      unit_price: price,
      price_type: type,
      quantity: qty,
      image: product.images[0]?.url ?? "",
      stock: product.stock_quantity,
    });
    if (redirect) router.push("/checkout");
  };
  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <div className="inline-flex h-12 items-center rounded-full border bg-background overflow-hidden shrink-0">
        <button
          type="button"
          className="h-full w-11 inline-flex items-center justify-center hover:bg-accent disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center font-semibold select-none">{qty}</span>
        <button
          type="button"
          className="h-full w-11 inline-flex items-center justify-center hover:bg-accent disabled:opacity-40"
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          disabled={qty >= max}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button
        size="lg"
        variant="gradient"
        disabled={outOfStock}
        onClick={() => handleAdd(false)}
        className="flex-1"
      >
        <ShoppingCart className="size-5" />
        {outOfStock ? "Out of stock" : `Add ${qty} to cart`}
      </Button>
      <Button
        size="lg"
        variant="outline"
        disabled={outOfStock}
        onClick={() => handleAdd(true)}
      >
        <Zap className="size-5" />
        Buy now
      </Button>
    </div>
  );
}
