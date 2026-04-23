import { AdminTopbar } from "@/components/admin/topbar";
import { getCategories, getProducts } from "@/lib/data";
import { CategoryEditCard } from "@/components/admin/category-edit-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <AdminTopbar 
        title="Categories" 
        subtitle="Edit category names, descriptions, and images" 
      />
      <div className="p-4 sm:p-6">
        <div className="flex justify-end mb-4">
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = products.filter((p) => p.category?.slug === c.slug).length;
            return (
              <CategoryEditCard 
                key={c.id} 
                category={c} 
                productCount={count} 
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
