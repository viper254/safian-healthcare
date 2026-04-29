"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="size-8" />
      </div>
      
      <h1 className="font-display font-bold text-2xl mb-3">Admin Error</h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        An error occurred in the admin panel. Please try again or contact support if the issue persists.
      </p>

      {process.env.NODE_ENV === "development" && (
        <details className="mb-8 text-left max-w-2xl w-full">
          <summary className="cursor-pointer text-sm font-medium mb-2">Error details</summary>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
            {error.message}
          </pre>
        </details>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset} variant="default">
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">
            <Home className="size-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
