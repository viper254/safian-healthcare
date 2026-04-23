"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import type { Product } from "@/types";

interface FeaturedBundlesProps {
  products: Product[];
}

export function FeaturedBundles({ products }: FeaturedBundlesProps) {
  // Filter for bundle products (products with "bundle" tag)
  const bundles = products.filter(p => p.tags?.includes("bundle"));

  if (bundles.length === 0) {
    return null; // Don't show section if no bundles
  }

  return (
    <section className="container py-16 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Package className="size-4" /> Curated bundles
          </p>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl text-balance">
            Ready-to-use <span className="text-brand-gradient">survival kits</span>
          </h2>
        </div>
        <p className="max-w-md text-muted-foreground text-sm">
          Pre-packaged bundles designed for specific medical rotations and career stages.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.slice(0, 6).map((bundle, i) => (
          <BundleCard key={bundle.id} bundle={bundle} index={i} />
        ))}
      </div>

      {bundles.length > 6 && (
        <div className="mt-12 text-center">
          <Link
            href="/shop?tag=bundle"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View all bundles
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

function BundleCard({ bundle, index }: { bundle: Product; index: number }) {
  const discount = bundle.discounted_price
    ? Math.round(((bundle.original_price - bundle.discounted_price) / bundle.original_price) * 100)
    : 0;

  const price = bundle.discounted_price || bundle.original_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/product/${bundle.slug}`}
        className="group relative block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
      >
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            Save {discount}%
          </div>
        )}

        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {bundle.images[0]?.url && (
            <Image
              src={bundle.images[0].url}
              alt={bundle.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{bundle.name}</h3>
              {bundle.category && (
                <p className="text-sm text-muted-foreground">{bundle.category.name}</p>
              )}
            </div>
            <div className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-green-500 text-white shrink-0">
              <Package className="size-4" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {bundle.short_description || bundle.description}
          </p>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                KES {price.toLocaleString()}
              </span>
              {bundle.discounted_price && (
                <span className="text-sm text-muted-foreground line-through">
                  KES {bundle.original_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">
              View details
            </span>
            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
