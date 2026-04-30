"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="container py-20 text-center">
      <div className="mx-auto size-16 rounded-full bg-muted grid place-items-center text-muted-foreground">
        <WifiOff className="size-8" />
      </div>
      <h1 className="mt-6 font-display font-bold text-3xl">You're offline</h1>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        It looks like you've lost your internet connection. Some features may not be available until you're back online.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <Button onClick={() => window.location.reload()} variant="gradient">
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
