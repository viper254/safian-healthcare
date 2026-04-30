"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="size-8" />
      </div>
      
      <h1 className="font-display font-bold text-3xl mb-3">Something went wrong</h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error. Our team has been notified and we're working to fix it.
      </p>

      {process.env.NODE_ENV === "development" && (
        <details className="mb-8 text-left max-w-2xl w-full">
          <summary className="cursor-pointer text-sm font-medium mb-2">Error details (dev only)</summary>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset} variant="gradient" size="lg">
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="size-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
