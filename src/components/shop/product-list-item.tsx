"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Tag, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatKES, effectivePrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { motion } from "framer-motion";

export function ProductListItem({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const { price, type } = effectivePrice(product);
  const savings =
    type === "offer" && product.offer_price
      ? product.original_price - product.offer_price
      : type === "discounted" && product.discounted_price
      ? product.original_price - product.discounted_price
      : 0;
  const pct = savings > 0 ? Math.round((savings / product.original_price) * 100) : 0;
  const outOfStock = product.stock_quantity === 0;
  return (
    <motion.article
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04 }}
      className="group relative flex gap-4 rounded-2xl border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md transition-all"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative w-28 sm:w-40 aspect-square shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {product.images[0]?.url && (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt ?? product.name}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {pct > 0 && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            <Tag className="size-3" /> -{pct}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
              {product.brand ?? product.category?.name}
            </p>
            <Link
              href={`/product/${product.slug}`}
              className="mt-0.5 block font-semibold hover:text-primary transition-colors line-clamp-1"
            >
              {product.name}
            </Link>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Star className="size-3.5 fill-brand-orange-500 text-brand-orange-500" />
            {product.rating_avg.toFixed(1)}
            <span className="hidden sm:inline">({product.rating_count})</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.short_description ?? product.description}
        </p>
        <div className="mt-auto pt-3 flex items-end justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg">{formatKES(price)}</span>
              {type !== "regular" && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatKES(product.original_price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {outOfStock ? (
                <>
                  <AlertTriangle className="size-3 text-destructive" />
                  Out of stock
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3 text-brand-green-500" />
                  In stock ({product.stock_quantity})
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="gradient"
              disabled={outOfStock}
              onClick={() =>
                add({
                  product_id: product.id,
                  slug: product.slug,
                  name: product.name,
                  category_slug: product.category?.slug ?? "",
                  unit_price: price,
                  price_type: type,
                  quantity: 1,
                  image: product.images[0]?.url ?? "",
                  stock: product.stock_quantity,
                })
              }
            >
              <ShoppingCart className="size-4" />
              Add to cart
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/product/${product.slug}`}>Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
