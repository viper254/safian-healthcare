import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabaseIsConfigured()) {
    return NextResponse.json({ success: true, demo: true });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { path, metadata } = body;

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("analytics_events").insert({
      event_type: "page_view",
      user_id: user?.id ?? null,
      path: path || "/",
      metadata: metadata || {},
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to log analytics" }, { status: 500 });
  }
}
