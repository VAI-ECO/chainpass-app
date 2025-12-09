import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

export default function VaiEntryCheck() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  const handleHasVai = () => navigate("/existing-vai");
  const handleNoVai = () => setShowWarning(true);
  const handleProceedNew = () => navigate("/vai-contact");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="max-w-md w-full p-8 bg-gray-900 border-gray-800 space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-14 w-14 text-purple-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Do you have an existing V.A.I.?</h1>
          <p className="text-gray-400 text-sm">
            If you've verified on any ChainPass partner platform, you already have a V.A.I.
          </p>
        </div>

        {!showWarning ? (
          <div className="space-y-4">
            <Button className="w-full h-12 text-lg" onClick={handleHasVai}>
              Yes, I already have one
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-lg border-gray-700 text-white"
              onClick={handleNoVai}
            >
              No, I'm new
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 text-sm text-yellow-50">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-300">IMPORTANT: One V.A.I. per person</p>
                  <p className="mt-2">
                    Duplicate V.A.I. attempts are automatically rejected and payments are not
                    refunded. If you're not sure, please check your email for "Your V.A.I. Number"
                    first.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowWarning(false)}>
                Go Back
              </Button>
              <Button className="flex-1" onClick={handleProceedNew}>
                I Understand, Continue
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-gray-500">
          Not sure? Contact support@chainpass.id for help.
        </p>
      </Card>
    </div>
  );
}

