import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DevVaiTestToolsProps {
  onSelectVAI: (vai: string) => void;
}

/**
 * Development-only component for testing different VAI scenarios
 * Only visible in development mode
 */
export function DevVaiTestTools({ onSelectVAI }: DevVaiTestToolsProps) {
  if (import.meta.env.PROD) {
    return null;
  }

  const testVAIs = [
    { code: "9I7T35L", label: "Fully Qualified" },
    { code: "TEST001", label: "Missing Requirements" },
    { code: "TEST002", label: "Payment Warning" },
    { code: "TEST003", label: "Grace Period" },
  ];

  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="text-sm">🧪 Dev Mode: Test VAI Numbers</CardTitle>
        <CardDescription className="text-xs">
          Click a button to populate the VAI field with a test number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {testVAIs.map((test) => (
            <Button
              key={test.code}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectVAI(test.code)}
              className="text-xs"
            >
              {test.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}









