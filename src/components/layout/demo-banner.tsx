import { AlertTriangle } from "lucide-react";
import { supabaseIsConfigured } from "@/lib/supabase/server";

export function DemoBanner() {
  if (supabaseIsConfigured()) return null;
  return (
    <div className="bg-amber-50 text-amber-900 border-b border-amber-200 text-xs">
      <div className="container flex items-center gap-2 py-2">
        <AlertTriangle className="size-4 shrink-0" />
        <p className="truncate">
          <span className="font-semibold">Demo mode:</span> Supabase is not
          configured — showing sample catalog. Add{" "}
          <code className="bg-amber-100 rounded px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="bg-amber-100 rounded px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          to enable orders & auth.
        </p>
      </div>
    </div>
  );
}
