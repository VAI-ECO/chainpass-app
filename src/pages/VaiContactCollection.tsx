import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function VaiContactCollection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;

  const handleContinue = async () => {
    if (!isPhoneValid || !acknowledged) return;

    setIsSubmitting(true);
    try {
      sessionStorage.setItem("vai_phone", phone);
      sessionStorage.setItem("vai_email", email);

      const { data, error } = await supabase.functions.invoke("create-verification-session", {
        body: { phone, email },
      });

      if (error) throw new Error(error.message);

      sessionStorage.setItem("verification_session_id", data.session_id);
      navigate("/vai-pricing");
    } catch (error) {
      console.error("[VaiContactCollection] create session failed", error);
      toast({
        title: "Unable to continue",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="max-w-md w-full p-8 bg-gray-900 border-gray-800 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Recovery Contact Information</h1>
          <p className="text-gray-400 text-sm">
            This is the only way to recover your V.A.I. if you ever lose access.
          </p>
        </div>

        <div className="bg-red-900/40 border border-red-600 rounded-xl p-4 text-sm text-red-50 space-y-2">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">We do not keep personal data.</p>
              <p>
                This phone (and optional email) is the only recovery path. If you lose both, the
                V.A.I. is lost forever – like losing a crypto wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone number <span className="text-red-400">*</span>
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500">Required. Used for OTP verifications.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email (optional)
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500">Extra recovery option if you lose phone access.</p>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-300 bg-gray-800/60 border border-gray-800 rounded-lg p-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span>I will maintain access to this phone/email and understand ChainPass cannot restore my V.A.I. without them.</span>
        </label>

        <Button
          className="w-full h-12"
          disabled={!isPhoneValid || !acknowledged || isSubmitting}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Card>
    </div>
  );
}

