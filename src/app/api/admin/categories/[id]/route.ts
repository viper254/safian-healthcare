import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update category
    const body = await request.json();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: body.name,
        description: body.description,
        image_url: body.image_url || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    if (data?.slug) {
      revalidatePath(`/shop/${data.slug}`);
    }
    revalidatePath("/admin/categories");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category has products
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${count} products` },
        { status: 400 }
      );
    }

    // Delete category and return the deleted row so we can revalidate its slug page.
    const { data: deleted, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("slug")
      .maybeSingle();

    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    if (deleted?.slug) {
      revalidatePath(`/shop/${deleted.slug}`);
    }
    revalidatePath("/admin/categories");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
