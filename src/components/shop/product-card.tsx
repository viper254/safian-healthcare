"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Tag, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatKES, effectivePrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { motion } from "framer-motion";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const { price, type } = effectivePrice(product);
  const savings =
    type === "offer" && product.offer_price
      ? product.original_price - product.offer_price
      : type === "discounted" && product.discounted_price
      ? product.original_price - product.discounted_price
      : 0;
  const pct = savings > 0 ? Math.round((savings / product.original_price) * 100) : 0;
  const lowStock =
    product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
  const outOfStock = product.stock_quantity === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className="group relative flex flex-col rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        {product.images[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {pct > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-orange-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            <Tag className="size-3" /> -{pct}%
          </span>
        )}
        {product.is_featured && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-green-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            Featured
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-background px-4 py-1.5 text-sm font-semibold">
              Out of stock
            </span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          {product.brand ?? product.category?.name}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold hover:text-primary transition-colors min-h-[2.5rem]"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-lg">{formatKES(price)}</span>
          {type !== "regular" && (
            <span className="text-xs text-muted-foreground line-through">
              {formatKES(product.original_price)}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {outOfStock ? (
            <>
              <AlertTriangle className="size-3 text-destructive" />
              Out of stock
            </>
          ) : lowStock ? (
            <>
              <AlertTriangle className="size-3 text-brand-orange-600" />
              Only {product.stock_quantity} left
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3 text-brand-green-500" />
              In stock
            </>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="gradient"
            className="flex-1"
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
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
            className={cn("px-3", outOfStock && "opacity-70")}
          >
            <Link href={`/product/${product.slug}`}>View</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
