import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCategories, getProductsByCategory } from "@/lib/data";
import { ShopGrid } from "@/components/shop/shop-grid";
import { Breadcrumbs } from "../page";
import { CATEGORY_META } from "@/lib/constants";
import type { CategorySlug } from "@/types";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: { category: string } },
): Promise<Metadata> {
  const meta = (CATEGORY_META as Record<string, { name: string; description: string }>)[
    params.category
  ];
  if (!meta) return { title: "Shop" };
  return {
    title: meta.name,
    description: meta.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams?: { q?: string };
}) {
  const meta = (CATEGORY_META as Record<string, { name: string; description: string; image: string }>)[
    params.category
  ];
  if (!meta) return notFound();
  const [products, categories] = await Promise.all([
    getProductsByCategory(params.category),
    getCategories(),
  ]);
  return (
    <div>
      {/* Category hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10">
          <Image
            src={meta.image}
            alt={meta.name}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/50" />
        </div>
        <div className="container py-12 md:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: meta.name },
            ]}
          />
          <h1 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-balance">
            {meta.name}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{meta.description}</p>
        </div>
      </section>
      <div className="container py-8 md:py-10">
        <ShopGrid
          products={products}
          categories={categories}
          activeCategorySlug={params.category as CategorySlug}
          initialSearch={searchParams?.q ?? ""}
        />
      </div>
    </div>
  );
}
