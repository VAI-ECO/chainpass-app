import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import LockedVaiScreen from "@/components/vai/LockedVaiScreen";
import { FacialVerification as FacialVerificationWidget } from "@/components/contracts/FacialVerification";
import { supabase } from "@/integrations/supabase/client";

type Step = "enter" | "verify" | "result";

interface VaiStatusResponse {
  vai_number: string;
  status: string;
  expires_at?: string | null;
  locked_at?: string | null;
  remaining_days?: number | null;
}

export default function ExistingVai() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const prefillVai = (location.state as any)?.vaiNumber ?? "";
  const [vaiNumber, setVaiNumber] = useState(prefillVai);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("enter");
  const [status, setStatus] = useState<VaiStatusResponse | null>(null);

  const handleLookup = async () => {
    if (vaiNumber.length !== 7) {
      toast({
        title: "Invalid V.A.I.",
        description: "Your V.A.I. number must be exactly 7 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-vai-status", {
        body: { vai_number: vaiNumber },
      });
      if (error) throw new Error(error.message);

      setStatus(data);
      if (["active", "trial"].includes(data.status)) {
        setStep("verify");
      } else {
        setStep("result");
      }
    } catch (error) {
      console.error("[ExistingVai] lookup failed", error);
      toast({
        title: "V.A.I. not found",
        description: error instanceof Error ? error.message : "Please check the number.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacialSuccess = () => {
    sessionStorage.setItem("verified_vai", vaiNumber);
    navigate("/vai-success", { state: { vaiNumber, isTrial: false } });
  };

  if (step === "verify" && status) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-6 bg-gray-900 border-gray-800 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">Verifying ownership of</p>
            <p className="text-3xl font-mono tracking-[0.3em] text-white">{status.vai_number}</p>
          </div>
          <FacialVerificationWidget
            vaiNumber={status.vai_number}
            contractType="existing_vai"
            onVerificationSuccess={() => handleFacialSuccess()}
            onVerificationFailed={() =>
              toast({
                title: "Verification failed",
                description: "Face did not match the green band. Please try again.",
                variant: "destructive",
              })
            }
          />
        </Card>
      </div>
    );
  }

  if (step === "result" && status) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <LockedVaiScreen
            vaiNumber={status.vai_number}
            lockedAt={status.locked_at}
            expiresAt={status.expires_at}
            remainingDays={status.remaining_days ?? undefined}
            onUnlock={() => navigate("/payment", { state: { vaiNumber: status.vai_number } })}
          />
          <Button variant="outline" className="w-full" onClick={() => setStep("enter")}>
            Check another V.A.I.
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-gray-900 border-gray-800 space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-purple-300 text-sm uppercase tracking-wide">Returning user</p>
          <h1 className="text-3xl font-bold text-white">Enter Your V.A.I.</h1>
          <p className="text-gray-400 text-sm">
            Use your existing number to continue verification or unlock access.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">V.A.I. Number</Label>
          <Input
            value={vaiNumber}
            placeholder="ABC1234"
            onChange={(e) => setVaiNumber(e.target.value.toUpperCase().slice(0, 7))}
            className="text-center text-2xl font-mono tracking-[0.5em] bg-gray-800 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-500 text-center">Exactly 7 letters or numbers.</p>
        </div>

        <Button className="w-full h-12" disabled={isLoading} onClick={handleLookup}>
          {isLoading ? "Checking..." : "Continue"}
        </Button>

        <Button variant="ghost" className="w-full text-gray-400" onClick={() => navigate("/recover-vai")}>
          Forgot your V.A.I.?
        </Button>
      </Card>
    </div>
  );
}

