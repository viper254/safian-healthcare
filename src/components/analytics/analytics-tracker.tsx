"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        
        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: url,
            metadata: {
              referrer: document.referrer,
              screen_resolution: `${window.screen.width}x${window.screen.height}`,
              user_agent: navigator.userAgent,
            },
          }),
        });
      } catch (error) {
        // Silently fail analytics
        console.error("Failed to track page view:", error);
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
