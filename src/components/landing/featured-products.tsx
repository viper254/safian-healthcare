import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="container py-16 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-4" /> Featured
          </p>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl text-balance">
            Best sellers this month
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
