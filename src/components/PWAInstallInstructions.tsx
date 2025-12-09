import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Share2, Plus, Check, X } from "lucide-react";

interface PWAInstallInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "ios" | "android";
}

export function PWAInstallInstructions({ isOpen, onClose, platform }: PWAInstallInstructionsProps) {
  if (platform === "ios") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Install ChainPass on iOS
            </DialogTitle>
            <DialogDescription>
              Follow these steps to add ChainPass to your home screen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Tap the Share Button</h4>
                <p className="text-sm text-muted-foreground">
                  Look for the share icon <Share2 className="inline h-4 w-4" /> at the bottom of your Safari browser
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Select "Add to Home Screen"</h4>
                <p className="text-sm text-muted-foreground">
                  Scroll down in the share menu and tap "Add to Home Screen" <Plus className="inline h-4 w-4" />
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Confirm Installation</h4>
                <p className="text-sm text-muted-foreground">
                  Tap "Add" in the top right corner to confirm
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> ChainPass will appear on your home screen like a native app. You can access it offline and it will load faster.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Android instructions
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install ChainPass on Android
          </DialogTitle>
          <DialogDescription>
            Follow these steps to install ChainPass on your device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">1</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Look for the Install Prompt</h4>
              <p className="text-sm text-muted-foreground">
                A banner or popup will appear asking if you want to install ChainPass
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">2</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Tap "Install"</h4>
              <p className="text-sm text-muted-foreground">
                Click the Install button in the prompt
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">3</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Or Use Browser Menu</h4>
              <p className="text-sm text-muted-foreground">
                If no prompt appears, tap the menu (⋮) and select "Install app" or "Add to Home screen"
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> ChainPass will be installed like a native app. You can access it offline and it will load faster.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}









