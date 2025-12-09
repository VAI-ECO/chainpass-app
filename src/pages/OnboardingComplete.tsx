import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { vaiValidationService } from "@/services/vaiValidationService";
import {
  createVairifyAccountWithExistingVAI,
  getSignupSession,
  clearSignupSession,
} from "@/services/accountService";
import { getVAIErrorFromError } from "@/constants/vaiErrors";

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCompletion = async () => {
      const vai = searchParams.get("vai");
      const success = searchParams.get("success");
      const sessionId = searchParams.get("session_id");

      if (success !== "true" || !vai) {
        setStatus("error");
        setErrorMessage("Invalid completion parameters");
        return;
      }

      try {
        // Verify VAI is now qualified
        const vaiData = await vaiValidationService.checkVAIRequirements(vai, "vairify");

        if (!vaiData.valid) {
          const error = getVAIErrorFromError({ message: vaiData.message || "VAI not found" });
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }

        if (!vaiData.qualified_for_platform) {
          setStatus("error");
          setErrorMessage(
            "Requirements not completed. Please contact support if you believe this is an error."
          );
          return;
        }

        // Get signup session data
        let sessionData = null;
        if (sessionId) {
          sessionData = getSignupSession(sessionId);
          if (sessionData) {
            clearSignupSession(sessionId);
          }
        }

        // If we have session data, create account
        if (sessionData) {
          const result = await createVairifyAccountWithExistingVAI({
            email: sessionData.email,
            password: sessionData.password,
            vaiNumber: vai,
            referralCode: sessionData.referralCode,
            couponCode: sessionData.couponCode,
          });

          if (result.success) {
            setStatus("success");
            toast({
              title: "Success",
              description: "Account created successfully!",
            });
            // Redirect to profile setup
            setTimeout(() => {
              navigate("/onboarding/profile");
            }, 2000);
          } else {
            setStatus("error");
            setErrorMessage(result.error || "Failed to create account");
          }
        } else {
          // No session data - user might already be logged in or session expired
          // Just redirect to profile
          setStatus("success");
          setTimeout(() => {
            navigate("/onboarding/profile");
          }, 2000);
        }
      } catch (error: any) {
        console.error("Onboarding completion error:", error);
        const vaiError = getVAIErrorFromError(error);
        setStatus("error");
        setErrorMessage(vaiError.message);
      }
    };

    handleCompletion();
  }, [searchParams, navigate, toast]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Completing setup...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Setup Error</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Setup Complete!</h1>
        <p className="text-muted-foreground">Redirecting to your profile...</p>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}









