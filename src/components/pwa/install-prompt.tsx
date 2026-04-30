"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show in production or when explicitly testing
    if (process.env.NODE_ENV !== 'production' && !window.location.search.includes('pwa-test')) {
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ PWA is already installed');
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show again for 7 days
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      console.log('📱 Install prompt available');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 10 seconds in dev, 30 seconds in prod
      const delay = process.env.NODE_ENV === 'production' ? 30000 : 10000;
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="rounded-2xl border bg-card shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 size-8 rounded-full hover:bg-accent inline-flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
        <div className="flex gap-3">
          <div className="size-12 rounded-xl bg-brand-gradient shrink-0 grid place-items-center">
            <Download className="size-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Install Safian Healthcare</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add to your home screen for quick access and offline browsing
            </p>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleInstall} size="sm" variant="gradient">
                Install
              </Button>
              <Button onClick={handleDismiss} size="sm" variant="ghost">
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
