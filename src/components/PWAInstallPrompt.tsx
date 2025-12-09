import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { PWAInstallInstructions } from "./PWAInstallInstructions";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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

    // Check if user has dismissed the prompt
    const dismissedPrompt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedPrompt) {
      const dismissedTime = parseInt(dismissedPrompt, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isStandaloneMode && !dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS installation instructions
      setShowInstructions(true);
      return;
    }

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setShowPrompt(false);
        setDeferredPrompt(null);
      } else {
        console.log("User dismissed the install prompt");
      }
    } else {
      // Fallback: show instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setDismissed(true);
  };

  // Don't show if already installed or dismissed
  if (isStandalone || dismissed || (!showPrompt && !isIOS)) {
    return null;
  }

  // For iOS, show a button to open instructions
  if (isIOS && !showPrompt) {
    return (
      <>
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
          <div className="rounded-lg border bg-background p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">Install ChainPass</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add ChainPass to your home screen for faster access and offline support.
                </p>
                <Button
                  onClick={() => setShowInstructions(true)}
                  size="sm"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Show Instructions
                </Button>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {showInstructions && (
          <PWAInstallInstructions
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            platform="ios"
          />
        )}
      </>
    );
  }

  // Android/Chrome install prompt
  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
        <div className="rounded-lg border bg-background p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Install ChainPass App</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Access offline, faster loading, and home screen icon.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstallClick} size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="px-3"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showInstructions && (
        <PWAInstallInstructions
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          platform="android"
        />
      )}
    </>
  );
}









