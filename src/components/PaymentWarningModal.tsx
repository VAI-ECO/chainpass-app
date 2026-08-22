import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { PaymentStatus } from "@/services/vaiValidationService";

interface PaymentWarningModalProps {
  isOpen: boolean;
  paymentStatus: PaymentStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentWarningModal({
  isOpen,
  paymentStatus,
  onConfirm,
  onCancel,
}: PaymentWarningModalProps) {
  if (!paymentStatus.warning) {
    return null;
  }

  const remainingDays = paymentStatus.remaining_if_paid_now || 0;
  const remainingMonths = Math.floor(remainingDays / 30);
  const remainingDaysInMonth = remainingDays % 30;

  const createdAt = paymentStatus.created_at ? new Date(paymentStatus.created_at) : null;
  const expiresAt = paymentStatus.expires_at_if_paid_now
    ? new Date(paymentStatus.expires_at_if_paid_now)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Important Payment Information</DialogTitle>
          </div>
          <DialogDescription>
            Please review this information before proceeding with payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Message */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {createdAt && (
                <>
                  Your V.A.I. was created on{" "}
                  <strong>{createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.
                </>
              )}
              {paymentStatus.time_elapsed_days !== undefined && (
                <>
                  {" "}It has been <strong>{paymentStatus.time_elapsed_days} days</strong> since creation.
                </>
              )}
            </p>
          </div>

          {/* Time Remaining */}
          <div className="rounded-lg border bg-muted/50 p-6 text-center">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">If you pay now:</h3>
            <div className="mb-2">
              <span className="text-4xl font-bold">
                {remainingMonths > 0 && `${remainingMonths} month${remainingMonths > 1 ? "s" : ""} `}
                {remainingDaysInMonth > 0 && `${remainingDaysInMonth} day${remainingDaysInMonth > 1 ? "s" : ""}`}
                {remainingDays === 0 && "0 days"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">remaining on your annual subscription</p>
          </div>

          {/* Explanation */}
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm">
              <strong>Why?</strong> Your annual timer started when your V.A.I. was created, not when you make payment.
              This is because ChainPass pays for identity verification upfront with ComplyCube.
            </p>
            {expiresAt && (
              <p className="text-sm">
                Your subscription expires on:{" "}
                <strong>{expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
              </p>
            )}
          </div>

          {/* Core Features Note */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
            <p className="text-sm">
              <strong>Remember:</strong> Vairify&apos;s core safety features (V.A.I. Check, DateGuard) are
              always free. Payment is only for premium convenience features.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Use Free Features Only
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            I Understand - Proceed with Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}









