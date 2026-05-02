"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  async function clearCache() {
    setIsClearing(true);
    
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      toast({
        title: "Cache cleared!",
        description: "The page will reload to apply changes.",
      });

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Failed to clear cache",
        description: "Please try refreshing the page manually.",
        variant: "destructive",
      });
      setIsClearing(false);
    }
  }

  return (
    <Button
      onClick={clearCache}
      disabled={isClearing}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`size-4 ${isClearing ? 'animate-spin' : ''}`} />
      {isClearing ? 'Clearing...' : 'Clear Cache'}
    </Button>
  );
}
