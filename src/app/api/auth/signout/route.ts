import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (supabaseIsConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", url.origin));
}
