"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
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

    // Show button after 3 seconds
    const showTimer = setTimeout(() => {
      setShowButton(true);
    }, 3000);

    // Auto-hide after 15 seconds if not interacted with
    const hideTimer = setTimeout(() => {
      setShowButton(false);
    }, 18000);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      console.log('PWA install prompt available - will auto-trigger');
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowButton(true);
      
      // Auto-trigger install prompt after 3 seconds
      setTimeout(() => {
        console.log('Auto-triggering install prompt');
        promptEvent.prompt();
        promptEvent.userChoice.then((choice) => {
          console.log(`User ${choice.outcome} the install`);
          if (choice.outcome === 'accepted') {
            setShowButton(false);
          }
          setDeferredPrompt(null);
        });
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome/Edge - trigger native install prompt immediately
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`Install outcome: ${outcome}`);
        
        if (outcome === 'accepted') {
          setShowButton(false);
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error('Install prompt error:', error);
      }
    } else {
      // Browser doesn't support PWA install - hide button
      console.log('PWA install not supported in this browser');
      setShowButton(false);
    }
  };

  const handleDismiss = () => {
    setShowButton(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showButton) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-5">
      <div className="rounded-xl border bg-card shadow-lg p-3 max-w-xs relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 size-6 rounded-full bg-muted hover:bg-accent inline-flex items-center justify-center border shadow-sm"
          aria-label="Dismiss"
        >
          <X className="size-3" />
        </button>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-brand-gradient shrink-0 grid place-items-center">
            <Smartphone className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">Install App</p>
            <p className="text-[10px] text-muted-foreground">Quick access & offline mode</p>
          </div>
          <Button onClick={handleInstallClick} size="sm" variant="gradient" className="shrink-0">
            <Download className="size-3" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
