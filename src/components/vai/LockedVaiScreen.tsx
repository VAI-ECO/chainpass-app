import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface LockedVaiScreenProps {
  vaiNumber: string;
  lockedAt?: string | null;
  expiresAt?: string | null;
  remainingDays?: number | null;
  onUnlock: () => void;
}

export function LockedVaiScreen({
  vaiNumber,
  lockedAt,
  expiresAt,
  remainingDays,
  onUnlock,
}: LockedVaiScreenProps) {
  return (
    <Card className="bg-gray-900 border border-orange-500/40 p-6 space-y-4 text-center">
      <div className="flex justify-center">
        <div className="h-14 w-14 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
          <Lock className="h-7 w-7" />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400">V.A.I. number</p>
        <p className="text-2xl font-mono tracking-[0.3em] text-white">{vaiNumber}</p>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-sm text-orange-100 space-y-2">
        <p className="font-semibold text-orange-300">This V.A.I. is locked.</p>
        {remainingDays !== undefined && remainingDays !== null && (
          <p>Remaining annual access: {remainingDays} day{remainingDays === 1 ? "" : "s"}</p>
        )}
        {lockedAt && <p>Locked on: {new Date(lockedAt).toLocaleString()}</p>}
        {expiresAt && <p>Annual cycle ends: {new Date(expiresAt).toLocaleDateString()}</p>}
        <p>Pay the renewal fee to unlock instantly.</p>
      </div>

      <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={onUnlock}>
        Pay &amp; Unlock
      </Button>
    </Card>
  );
}

export default LockedVaiScreen;

