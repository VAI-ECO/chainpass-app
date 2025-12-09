import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Zap, WifiOff } from "lucide-react";
import { PWAInstallInstructions } from "./PWAInstallInstructions";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // Check if user has dismissed the banner
    const dismissedBanner = localStorage.getItem("pwa-banner-dismissed");
    if (dismissedBanner) {
      const dismissedTime = parseInt(dismissedBanner, 10);
      // Show again after 30 days
      if (Date.now() - dismissedTime < 30 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isStandaloneMode) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show banner after a delay
    if (iOS && !isStandaloneMode && !dismissedBanner) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isStandalone || !showBanner) {
    return null;
  }

  return (
    <>
      <div className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Install ChainPass for better experience</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Faster loading</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline access</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    <span>Home screen icon</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={handleInstallClick} size="sm" className="whitespace-nowrap">
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showInstructions && (
        <PWAInstallInstructions
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          platform={isIOS ? "ios" : "android"}
        />
      )}
    </>
  );
}









