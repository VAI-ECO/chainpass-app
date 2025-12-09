import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Shield, Sparkles, AlertTriangle } from "lucide-react";
import chainpassLogo from "@/assets/chainpass-logo.svg";
import { supabase } from "@/integrations/supabase/client";
import { sessionManager } from "@/utils/sessionManager";
import { useVAIStore } from "@/store/vaiStore";

type ProcessingState = "verifying" | "generating" | "error";

const PROGRESS_CAP = 96;

export default function VaiProcessing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingState, setProcessingState] = useState<ProcessingState>("verifying");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { vaiNumber, setVAI, isGenerating, setGenerating } = useVAIStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_CAP) {
          clearInterval(interval);
          return PROGRESS_CAP;
        }
        return prev + 1.5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (vaiNumber) {
      navigate("/vai-success", { state: { vaiNumber, isTrial: false } });
      return;
    }

    if (!isGenerating) {
      createVaiRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaiNumber]);

  const runDuplicateCheck = async (hash: string) => {
    const dobDayRaw = sessionStorage.getItem("dob_day");
    const sex = sessionStorage.getItem("sex");
    if (!dobDayRaw && !sex) return null;

    try {
      const payload: Record<string, string | number> = { biometric_hash: hash };
      if (dobDayRaw) {
        const parsed = parseInt(dobDayRaw, 10);
        if (!Number.isNaN(parsed)) {
          payload.dob_day = parsed;
        }
      }
      if (sex) {
        payload.sex = sex;
      }

      const { data, error } = await supabase.functions.invoke("check-vai-duplicate", {
        body: payload,
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.warn("[VaiProcessing] duplicate check skipped", error);
      return null;
    }
  };

  const createVaiRecord = async () => {
    const sessionId =
      sessionStorage.getItem("verification_session_id") || sessionManager.getSessionId();
    const complycubeCheckId = sessionStorage.getItem("complycube_check_id");
    const biometricHash = sessionStorage.getItem("biometric_hash");

    if (!sessionId || !complycubeCheckId || !biometricHash) {
      setProcessingState("error");
      setErrorMessage(
        "Missing verification data. Please restart the verification process from the beginning.",
      );
      return;
    }

    try {
      setGenerating(true);
      setProcessingState("generating");
      setErrorMessage(null);

      const duplicateResult = await runDuplicateCheck(biometricHash);
      if (duplicateResult?.duplicate) {
        toast({
          title: "Existing V.A.I. detected",
          description: "We found an existing V.A.I. tied to your biometrics. Please continue through the returning-user flow.",
        });
        navigate("/existing-vai", { state: { vaiNumber: duplicateResult.existing_vai || undefined } });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-vai-record", {
        body: {
          session_id: sessionId,
          complycube_check_id: complycubeCheckId,
          biometric_hash: biometricHash,
          platform_source: sessionStorage.getItem("platform_source") ?? "chainpass",
          referral_vai: sessionStorage.getItem("referral_vai") || null,
        },
      });

      if (error) {
        if (error.status === 409 || error.message?.toLowerCase().includes("biometric")) {
          navigate("/existing-vai", {
            state: {
              existingVai: (error as any)?.details?.existing_vai,
              message: error.message,
            },
          });
          return;
        }

        throw new Error(error.message ?? "Failed to create V.A.I. record");
      }

      if (!data?.vai_number) {
        throw new Error("V.A.I. number missing from server response");
      }

      setVAI(data.vai_number, "", false);
      sessionManager.setVaiCode(data.vai_number);
      sessionStorage.setItem("vai_number", data.vai_number);
      if (data.payment_due_at) {
        sessionStorage.setItem("payment_due_at", data.payment_due_at);
      }

      navigate("/vai-success", {
        state: {
          vaiNumber: data.vai_number,
          isTrial: data.status === "trial",
          paymentDueAt: data.payment_due_at,
          trialHoursRemaining: data.trial_hours_remaining,
        },
      });
    } catch (error) {
      console.error("[VaiProcessing] create-vai-record error", error);
      setProcessingState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error while creating V.A.I.",
      );
      toast({
        title: "V.A.I. Creation Failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRetry = () => {
    setProcessingState("verifying");
    setProgress(0);
    setErrorMessage(null);
    createVaiRecord();
  };

  if (processingState === "error") {
    return (
      <div className="min-h-screen bg-[#1F2937] py-8 px-4 flex items-center justify-center">
        <Card className="max-w-lg w-full bg-[#1F2937]/90 border border-red-500/30">
          <CardContent className="p-8 space-y-6 text-center">
            <div className="flex items-center justify-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <p className="text-lg font-semibold">We couldn't finish creating your V.A.I.</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {errorMessage ||
                "An unexpected error occurred. Please retry the verification process."}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={handleRetry} className="h-12 bg-purple-600 hover:bg-purple-700">
                Retry
              </Button>
              <Button
                variant="outline"
                className="h-12 border-gray-600 text-white"
                onClick={() => navigate("/" )}
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F2937] py-8 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full animate-fade-in">
        <div className="flex items-center justify-center mb-12">
          <img src={chainpassLogo} alt="ChainPass" className="h-32" />
        </div>

        <div className="relative">
          <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-xl blur-sm opacity-75"></div>
          <Card className="relative bg-[#1F2937]/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardContent className="p-12 text-center space-y-8">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-40 animate-ping"></div>
                <div className="relative w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                  {processingState === "verifying" ? (
                    <Shield className="w-16 h-16 text-white animate-pulse" />
                  ) : (
                    <Sparkles className="w-16 h-16 text-white animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white">
                  {processingState === "verifying"
                    ? "Confirming Biometrics"
                    : "Generating Your V.A.I."}
                </h1>
                <p className="text-gray-300 text-lg">
                  {processingState === "verifying"
                    ? "Validating biometric data from ComplyCube..."
                    : "Creating your Verified Anonymous Identity..."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {processingState === "verifying" ? "Preparing secure channel" : "Issuing V.A.I."}
                </p>
              </div>

              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">Payment verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">Identity documents validated</span>
                </div>
                <div className="flex items-center gap-3">
                  {processingState === "generating" ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  )}
                  <span className="text-sm text-gray-300">Biometric signature confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  {processingState === "generating" ? (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                  )}
                  <span className="text-sm text-gray-300">Creating secure V.A.I. number</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Please keep this tab open. This step usually takes less than a minute.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
