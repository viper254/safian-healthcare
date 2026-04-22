import { AdminTopbar } from "@/components/admin/topbar";
import { getCategories, getProducts } from "@/lib/data";
import Image from "next/image";
import { CATEGORY_META } from "@/lib/constants";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <AdminTopbar title="Categories" subtitle="Manage the four product categories" />
      <div className="p-4 sm:p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => {
          const meta = (CATEGORY_META as Record<string, { image: string }>)[c.slug];
          const count = products.filter((p) => p.category?.slug === c.slug).length;
          return (
            <article
              key={c.id}
              className="relative overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                {meta?.image && (
                  <Image
                    src={meta.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">
                    {count} products
                  </p>
                  <h3 className="font-semibold text-lg drop-shadow-sm">{c.name}</h3>
                </div>
              </div>
              <div className="p-4 text-sm text-muted-foreground">
                {c.description}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
