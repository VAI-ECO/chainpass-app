import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { vaiValidationService, VAIValidationService } from "@/services/vaiValidationService";
import { PaymentWarningModal } from "@/components/PaymentWarningModal";
import { CouponPaymentModal } from "@/components/CouponPaymentModal";
import { getVAIErrorFromError } from "@/constants/vaiErrors";
import {
  createVairifyAccountWithExistingVAI,
  createSignupSession,
} from "@/services/accountService";
import { DevVaiTestTools } from "@/components/DevVaiTestTools";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function VairifySignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validatingVAI, setValidatingVAI] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Existing VAI fields
  const [hasExistingVAI, setHasExistingVAI] = useState(false);
  const [existingVAI, setExistingVAI] = useState("");

  // Modals
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [paymentWarningData, setPaymentWarningData] = useState<any>(null);
  const [showCouponPayment, setShowCouponPayment] = useState(false);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (hasExistingVAI && existingVAI) {
        if (!VAIValidationService.validateVAIFormat(existingVAI)) {
          toast({
            title: "Invalid V.A.I. Format",
            description: "V.A.I. numbers must be exactly 7 characters (letters and numbers only).",
            variant: "destructive",
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);

    try {
      // If user has existing VAI, validate it first
      if (hasExistingVAI && existingVAI) {
        setValidatingVAI(true);

        try {
          const vaiData = await vaiValidationService.checkVAIRequirements(
            existingVAI,
            "vairify"
          );

          // Invalid VAI
          if (!vaiData.valid) {
            const error = getVAIErrorFromError({ message: vaiData.message || "VAI not found" });
            toast({
              title: error.title,
              description: error.message,
              variant: "destructive",
            });
            setLoading(false);
            setValidatingVAI(false);
            return;
          }

          // Suspended/Banned
          if (vaiData.reason) {
            const error = getVAIErrorFromError({ message: vaiData.reason });
            toast({
              title: error.title,
              description: error.message,
              variant: "destructive",
            });
            setLoading(false);
            setValidatingVAI(false);
            return;
          }

          // Check coupon payment requirement
          if (couponCode && !vaiData.payment_status?.is_paid) {
            setShowCouponPayment(true);
            setLoading(false);
            setValidatingVAI(false);
            return;
          }

          // Fully qualified
          if (vaiData.qualified_for_platform) {
            // Check payment warning
            if (vaiData.payment_status?.warning) {
              setPaymentWarningData(vaiData.payment_status);
              setShowPaymentWarning(true);
              setLoading(false);
              setValidatingVAI(false);
              return;
            }

            // Create account directly
            const result = await createVairifyAccountWithExistingVAI({
              email,
              password,
              vaiNumber: existingVAI,
              referralCode: referralCode || undefined,
              couponCode: couponCode || undefined,
            });

            if (result.success) {
              toast({
                title: "Success",
                description: "Account created successfully!",
              });
              navigate("/onboarding/profile");
            } else {
              toast({
                title: "Error",
                description: result.error || "Failed to create account",
                variant: "destructive",
              });
            }
            setLoading(false);
            setValidatingVAI(false);
            return;
          }

          // Missing requirements - redirect to ChainPass
          if (vaiData.missing_requirements && vaiData.missing_requirements.length > 0) {
            const returnUrl = encodeURIComponent(
              `${window.location.origin}/onboarding/complete`
            );
            const requirements = vaiData.missing_requirements
              .map((r) => r.requirement)
              .join(",");

            // Store signup session for later
            const session = await createSignupSession(
              email,
              password,
              referralCode || undefined,
              couponCode || undefined
            );

            window.location.href = `https://chainpass.com/complete-requirements?vai=${existingVAI}&platform=vairify&requirements=${requirements}&return_url=${returnUrl}&session_id=${session.id}`;
            setLoading(false);
            setValidatingVAI(false);
            return;
          }
        } catch (error: any) {
          console.error("VAI validation error:", error);
          const vaiError = getVAIErrorFromError(error);
          toast({
            title: vaiError.title,
            description: vaiError.message,
            variant: "destructive",
          });
          setLoading(false);
          setValidatingVAI(false);
          return;
        }
      } else {
        // New VAI - normal ChainPass flow
        const session = await createSignupSession(
          email,
          password,
          referralCode || undefined,
          couponCode || undefined
        );

        const returnUrl = encodeURIComponent(`${window.location.origin}/onboarding/complete`);
        window.location.href = `https://chainpass.com/create-vai?session_id=${session.id}&platform=vairify&return_url=${returnUrl}`;
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setLoading(false);
      setValidatingVAI(false);
    }
  };

  const handlePaymentWarningConfirm = async () => {
    setShowPaymentWarning(false);
    setLoading(true);

    try {
      const result = await createVairifyAccountWithExistingVAI({
        email,
        password,
        vaiNumber: existingVAI,
        referralCode: referralCode || undefined,
        couponCode: couponCode || undefined,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        navigate("/onboarding/profile");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCouponPaymentProceed = () => {
    setShowCouponPayment(false);
    // Redirect to ChainPass payment flow
    const returnUrl = encodeURIComponent(`${window.location.origin}/onboarding/complete`);
    window.location.href = `https://chainpass.com/payment?vai=${existingVAI}&platform=vairify&return_url=${returnUrl}&coupon=${couponCode}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up for Vairify</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            {/* Existing VAI Section */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-existing-vai"
                  checked={hasExistingVAI}
                  onCheckedChange={(checked) => {
                    setHasExistingVAI(checked as boolean);
                    if (!checked) {
                      setExistingVAI("");
                    }
                  }}
                />
                <Label
                  htmlFor="has-existing-vai"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have an existing V.A.I. number from another platform
                </Label>
              </div>

              {hasExistingVAI && (
                <div className="space-y-2">
                  <Label htmlFor="existing-vai">V.A.I. Number</Label>
                  <Input
                    id="existing-vai"
                    type="text"
                    placeholder="9I7T35L"
                    value={existingVAI}
                    onChange={(e) => {
                      const formatted = VAIValidationService.formatVAI(e.target.value);
                      setExistingVAI(formatted);
                    }}
                    pattern="[A-Z0-9]{7}"
                    maxLength={7}
                    className="uppercase"
                  />
                  <p className="text-xs text-muted-foreground">
                    7-character V.A.I. number from ChainPass
                  </p>
                </div>
              )}
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <Label htmlFor="referral-code">Referral Code (Optional)</Label>
              <Input
                id="referral-code"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>

            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code (Optional)</Label>
              <Input
                id="coupon-code"
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>

            {/* Dev Test Tools */}
            {import.meta.env.DEV && (
              <DevVaiTestTools
                onSelectVAI={(vai) => {
                  setHasExistingVAI(true);
                  setExistingVAI(vai);
                }}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading || validatingVAI}>
              {(loading || validatingVAI) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {validatingVAI ? "Validating V.A.I..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modals */}
      {paymentWarningData && (
        <PaymentWarningModal
          isOpen={showPaymentWarning}
          paymentStatus={paymentWarningData}
          onConfirm={handlePaymentWarningConfirm}
          onCancel={() => {
            setShowPaymentWarning(false);
            setLoading(false);
          }}
        />
      )}

      <CouponPaymentModal
        isOpen={showCouponPayment}
        onProceedToPayment={handleCouponPaymentProceed}
        onCancel={() => {
          setShowCouponPayment(false);
          setLoading(false);
        }}
      />
    </div>
  );
}









