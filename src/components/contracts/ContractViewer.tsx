import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type ViewerUiType = "terms_of_service" | "mutual_consent";

interface ContractViewerProps {
  contractType: ViewerUiType;
  session_id: string;
  onScrollComplete: () => void;
  onVersionShown: (agreement_version_id: string) => void;
}

function subtypeFromUi(ui: ViewerUiType): "terms" | "contract" {
  if (ui === "terms_of_service") return "terms";
  return "contract";
}

export function ContractViewer({
  contractType,
  session_id,
  onScrollComplete,
  onVersionShown,
}: ContractViewerProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [bodyText, setBodyText] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [versionLabel, setVersionLabel] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    shownRef.current = false;
    setBodyText(null);
    setLoadError(null);
    setHasScrolledToBottom(false);

    (async () => {
      const { data, error } = await supabase.functions.invoke("agreement-version", {
        body: { session_id, subtype: subtypeFromUi(contractType) },
      });
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        return;
      }
      if (data?.error) {
        setLoadError(String(data.error));
        return;
      }
      setBodyText(data.body);
      setNotice(typeof data.notice === "string" ? data.notice : null);
      setVersionLabel(typeof data.version === "string" ? data.version : "");
      onVersionShown(data.agreement_version_id);
    })();

    return () => {
      cancelled = true;
    };
  }, [session_id, contractType, onVersionShown]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!bodyText) return;
    const target = event.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      onScrollComplete();
    }
  };

  return (
    <Card className="w-full">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground">
          {contractType === "mutual_consent" ? "Agreement" : "Terms"}
          {versionLabel ? ` · ${versionLabel}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Please read this document carefully and scroll to the bottom to continue
        </p>
      </div>

      <ScrollArea className="h-[500px]" onScrollCapture={handleScroll}>
        <div className="p-6 prose prose-sm max-w-none">
          {loadError && (
            <p className="text-destructive">{loadError}</p>
          )}
          {!loadError && !bodyText && (
            <p className="text-muted-foreground">Loading document…</p>
          )}
          {notice && (
            <div className="mb-4 whitespace-pre-wrap text-foreground">{notice}</div>
          )}
          {bodyText && (
            <div className="whitespace-pre-wrap text-foreground">{bodyText}</div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/50">
        {hasScrolledToBottom ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              You have reviewed the entire document
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Scroll to the bottom to enable signing
          </p>
        )}
      </div>
    </Card>
  );
}
