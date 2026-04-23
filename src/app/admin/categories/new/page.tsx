import { AdminTopbar } from "@/components/admin/topbar";
import { NewCategoryForm } from "@/components/admin/new-category-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <>
      <AdminTopbar
        title="Add New Category"
        subtitle="Create a new product category"
      />
      <div className="p-4 sm:p-6">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to categories
        </Link>

        <div className="max-w-2xl">
          <NewCategoryForm />
        </div>
      </div>
    </>
  );
}
