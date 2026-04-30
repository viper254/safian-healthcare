import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In read-only contexts (e.g. during RSC render) this can throw; safe to ignore.
          }
        },
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });
        },
      },
    },
  );
}

/**
 * Returns true if Supabase env vars are missing. Used by pages that should
 * gracefully degrade to demo/mock data instead of crashing in preview envs.
 */
export function supabaseIsConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
