"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Shop error:", error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[50vh] py-20 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="size-8" />
      </div>
      
      <h1 className="font-display font-bold text-2xl mb-3">Failed to load products</h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't load the products. This might be a temporary issue.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset} variant="gradient">
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
