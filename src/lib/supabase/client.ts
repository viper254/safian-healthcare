"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });
        },
      },
    }
  );
}
