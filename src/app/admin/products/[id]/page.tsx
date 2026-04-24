import { notFound } from "next/navigation";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(*)
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return notFound();
  }

  return (
    <>
      <AdminTopbar title="Edit Product" subtitle={product.name} />
      <div className="p-4 sm:p-6 max-w-4xl">
        <ProductEditForm product={product} />
      </div>
    </>
  );
}
