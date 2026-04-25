import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

    // Create category
    const body = await request.json();
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", body.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image_url: body.image_url || null,
        sort_order: 999, // Put new categories at the end
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
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
    console.error("Error in POST /api/admin/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
