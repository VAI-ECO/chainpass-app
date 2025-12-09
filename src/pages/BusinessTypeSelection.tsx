import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BUSINESS_TYPES = [
  {
    id: "service",
    title: "Service Business",
    description: "Employees provide adult services (escorts, massage, clubs). Full compliance and V.A.I. verification required.",
    note: "Owner must be verified. Employees receive composite work VAIs via coupons.",
  },
  {
    id: "non_service",
    title: "Community Business",
    description: "Adult retail, entertainment, and venues that don't provide direct services.",
    note: "Directory listing only. No employee VAIs needed.",
  },
];

export default function BusinessTypeSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    sessionStorage.setItem("business_type", selected);
    if (selected === "service") {
      navigate("/business-packages");
    } else {
      navigate("/business-registration");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
      <Card className="max-w-3xl w-full p-8 bg-gray-900 border-gray-800 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-purple-300 text-sm uppercase tracking-wide">Business onboarding</p>
          <h1 className="text-3xl font-bold text-white">What type of business are you?</h1>
          <p className="text-gray-400 text-sm">Pick the option that best matches your operation.</p>
        </div>

        <div className="space-y-4">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`w-full text-left p-6 rounded-2xl border transition ${
                selected === type.id ? "border-purple-500 bg-purple-500/10" : "border-gray-800 bg-gray-900"
              }`}
            >
              <p className="text-lg font-semibold text-white">{type.title}</p>
              <p className="text-gray-400 text-sm mt-2">{type.description}</p>
              <p className="text-xs text-purple-300 mt-3">{type.note}</p>
            </button>
          ))}
        </div>

        <Button className="w-full h-12" disabled={!selected} onClick={handleContinue}>
          Continue
        </Button>
      </Card>
    </div>
  );
}

