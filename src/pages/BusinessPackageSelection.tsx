import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    id: "1_vai",
    name: "Starter",
    price: 69,
    description: "Solo owner-operator. Includes 1 business V.A.I.",
    coupons: 0,
  },
  {
    id: "4_vai",
    name: "Small Team",
    price: 199,
    description: "Owner + up to 3 employees (4 total VAIs).",
    coupons: 3,
    popular: true,
  },
  {
    id: "10_vai",
    name: "Enterprise",
    price: 499,
    description: "Owner + up to 9 employees (10 total VAIs).",
    coupons: 9,
  },
];

export default function BusinessPackageSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("4_vai");

  const handleContinue = () => {
    sessionStorage.setItem("business_package", selected);
    navigate("/business-registration");
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
      <Card className="max-w-4xl w-full p-8 bg-gray-900 border-gray-800 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-purple-300 text-sm uppercase tracking-wide">Service business</p>
          <h1 className="text-3xl font-bold text-white">Select your package</h1>
          <p className="text-gray-400 text-sm">Includes business V.A.I., owner verification, and employee coupons.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              className={`p-6 rounded-2xl border text-left transition space-y-3 ${
                selected === pkg.id ? "border-purple-500 bg-purple-500/10" : "border-gray-800 bg-gray-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-white">{pkg.name}</p>
                {pkg.popular && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">Most Popular</span>
                )}
              </div>
              <p className="text-3xl font-bold text-white">${pkg.price}</p>
              <p className="text-gray-400 text-sm">{pkg.description}</p>
              <p className="text-xs text-gray-500">Includes {pkg.coupons} employee coupons.</p>
            </button>
          ))}
        </div>

        <Button className="w-full h-12" onClick={handleContinue}>
          Continue
        </Button>
      </Card>
    </div>
  );
}

