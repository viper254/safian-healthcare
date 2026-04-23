import { redirect } from "next/navigation";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <>
      <AdminTopbar
        title="Add New Product"
        subtitle="Create a new product in your catalog"
      />
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <ProductForm />
        </div>
      </div>
    </>
  );
}
