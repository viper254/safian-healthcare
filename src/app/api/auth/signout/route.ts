import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";

async function handleSignOut(request: Request) {
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

export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}
