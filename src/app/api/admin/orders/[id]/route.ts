import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, context: { params: Params }) {
  const { id } = await context.params;
  const body = await request.json();

  const supabase = await createSupabaseServerClient();

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const updates: any = {};
  if (body.status) updates.status = body.status;
  if (body.payment_status) updates.payment_status = body.payment_status;

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
