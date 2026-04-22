import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories, getProducts } from "@/lib/data";
import { ShopGrid } from "@/components/shop/shop-grid";

export const metadata: Metadata = {
  title: "Shop all products",
  description:
    "Browse every product at Safian Healthcare — student kits, professional tools, facility items and patient supplies.",
};

export const revalidate = 60;

type SP = { q?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: SP;
}) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const q = searchParams?.q ?? "";
  return (
    <div className="container py-8 md:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <div className="mt-3 mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl">All products</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} products across {categories.length} categories.
        </p>
      </div>
      <ShopGrid products={products} categories={categories} initialSearch={q} />
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3" />}
          {it.href ? (
            <Link href={it.href} className="hover:text-primary">
              {it.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
