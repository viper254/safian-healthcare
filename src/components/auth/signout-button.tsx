"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
  children?: React.ReactNode;
  asMenuItem?: boolean;
}

export function SignOutButton({ variant = "outline", className, children, asMenuItem = false }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (asMenuItem) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
      >
        <LogOut className="size-3.5" />
        {loading ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleSignOut}
      disabled={loading}
    >
      {children || (
        <>
          <LogOut className="size-4" />
          {loading ? "Signing out..." : "Sign out"}
        </>
      )}
    </Button>
  );
}
