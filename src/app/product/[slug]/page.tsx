import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Undo2,
  Star,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/shop/product-card";
import { Breadcrumbs } from "@/app/shop/page";
import { effectivePrice, formatKES } from "@/lib/utils";
import { AddToCartBar } from "@/components/shop/add-to-cart-bar";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: p.short_description ?? p.description.slice(0, 140),
    openGraph: { images: p.images.map((i) => i.url) },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const { price, type } = effectivePrice(product);
  const savings =
    type === "offer" && product.offer_price
      ? product.original_price - product.offer_price
      : type === "discounted" && product.discounted_price
      ? product.original_price - product.discounted_price
      : 0;
  const pct = savings > 0 ? Math.round((savings / product.original_price) * 100) : 0;
  const related = (
    await getProducts({
      categorySlug: product.category?.slug,
      limit: 5,
    })
  ).filter((p) => p.id !== product.id).slice(0, 4);

  const outOfStock = product.stock_quantity === 0;
  const lowStock =
    product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="container py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          product.category
            ? { label: product.category.name, href: `/shop/${product.category.slug}` }
            : { label: "Products" },
          { label: product.name },
        ]}
      />

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand ?? product.category?.name}
          </p>
          <h1 className="mt-1 font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-balance">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < Math.round(product.rating_avg)
                      ? "fill-brand-orange-500 text-brand-orange-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="ml-1 font-semibold">{product.rating_avg.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.rating_count} reviews)</span>
            </div>
            {product.sku && (
              <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
            )}
          </div>

          <div className="mt-5 flex items-end gap-3 flex-wrap">
            <span className="font-display font-bold text-3xl">{formatKES(price)}</span>
            {type !== "regular" && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatKES(product.original_price)}
                </span>
                <Badge variant="warning" className="uppercase">
                  <Tag className="size-3 mr-1" /> Save {pct}%
                </Badge>
              </>
            )}
          </div>

          <div className="mt-3 text-sm">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-destructive font-semibold">
                <AlertTriangle className="size-4" /> Currently out of stock
              </span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-1.5 text-brand-orange-600 font-semibold">
                <AlertTriangle className="size-4" /> Only {product.stock_quantity} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-brand-green-600 font-semibold">
                <CheckCircle2 className="size-4" /> In stock — ready to ship
              </span>
            )}
          </div>

          <p className="mt-5 text-[15px] text-foreground/90 leading-relaxed">
            {product.description}
          </p>

          {/* Specs */}
          {Object.keys(product.specs).length > 0 && (
            <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm rounded-xl border bg-card p-4">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-muted-foreground">{k}:</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Add to cart */}
          <AddToCartBar product={product} />

          {/* Perks */}
          <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-xs">
            {[
              { icon: Truck, label: "Same-day Nairobi dispatch" },
              { icon: ShieldCheck, label: "12-month warranty" },
              { icon: Undo2, label: "7-day hassle-free returns" },
            ].map((perk) => (
              <li key={perk.label} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                <perk.icon className="size-4 text-primary" />
                <span className="font-medium">{perk.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">You may also like</h2>
            <Link
              href={`/shop/${product.category?.slug ?? ""}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View more
            </Link>
          </div>
          <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt?: string | null }[];
  name: string;
}) {
  const primary = images[0];
  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-black/5">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt ?? name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : null}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${i + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
