import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface CouponPaymentModalProps {
  isOpen: boolean;
  onProceedToPayment: () => void;
  onCancel: () => void;
}

export function CouponPaymentModal({
  isOpen,
  onProceedToPayment,
  onCancel,
}: CouponPaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <DialogTitle>Payment Required for Coupon</DialogTitle>
          </div>
          <DialogDescription>
            To activate your discount, payment must be completed immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            You&apos;ve entered a coupon code. To activate your discount, payment must be completed immediately.
          </p>
          <p className="text-sm text-muted-foreground">
            You&apos;ll be redirected to ChainPass to complete your payment.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={onProceedToPayment} className="w-full sm:w-auto">
            Proceed to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}









