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
  const categories = await getCategories();
  const dbCat = categories.find((c) => c.slug === params.category);
  const meta = (CATEGORY_META as Record<string, { name: string; description: string }>)[
    params.category
  ];
  const name = dbCat?.name || meta?.name;
  const description = dbCat?.description || meta?.description;
  if (!name) return { title: "Shop" };
  return {
    title: name,
    description: description ?? undefined,
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
  const [products, categories] = await Promise.all([
    getProductsByCategory(params.category),
    getCategories(),
  ]);
  const dbCat = categories.find((c) => c.slug === params.category);
  if (!dbCat && !meta) return notFound();
  const name = dbCat?.name || meta?.name || "";
  const description = dbCat?.description || meta?.description || "";
  const image = dbCat?.image_url || meta?.image;
  return (
    <div>
      {/* Category hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10">
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover opacity-30"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/50" />
        </div>
        <div className="container py-12 md:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: name },
            ]}
          />
          <h1 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-balance">
            {name}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
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
