import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function VaiPricing() {
  const navigate = useNavigate();

  const handlePayNow = () => navigate("/payment");
  const handleTrial = () => {
    sessionStorage.setItem("payment_deferred", "true");
    navigate("/vai-processing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="max-w-2xl w-full p-8 bg-gray-900 border-gray-800 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-wide text-purple-300">ChainPass Verification</p>
          <h1 className="text-3xl font-bold text-white">Your Permanent V.A.I.</h1>
          <p className="text-gray-400">
            One price unlocks every ChainPass partner platform. Pay now or try free for 48 hours.
          </p>
        </div>

        <div className="border border-purple-500/60 rounded-2xl p-6 space-y-6 bg-gradient-to-b from-purple-950/40 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-purple-300 uppercase tracking-wide">Personal V.A.I.</p>
              <h2 className="text-white text-3xl font-bold">$99</h2>
              <p className="text-gray-400 text-sm">Valid 1 year • works everywhere</p>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              {[
                "Permanent V.A.I. number",
                "95% biometric verification",
                "Age & compliance verified",
                "All partner platforms included",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2 text-left">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600/20 text-green-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
            <p className="text-green-300 font-semibold">48-Hour Trial</p>
            <p className="text-sm text-green-200">
              Complete verification now, pay within 48 hours to keep access. If you don't pay in
              time, your V.A.I. locks but is never deleted.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full h-12 text-lg" onClick={handlePayNow}>
            Pay $99 Now
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-lg border-green-600 text-green-300 hover:text-green-200"
            onClick={handleTrial}
          >
            Try it Free for 48 Hours First
          </Button>
        </div>
      </Card>
    </div>
  );
}

