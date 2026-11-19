import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export interface DocumentScrutinyData {
  documentId: string;
  documentType: string;
  documentLabel: string;
  originalFilename: string;
  version: number;
  sizeBytes: number;
  action: "verify" | "reject";
  companyName: string;
  applicationNumber: string;
}

interface DocumentScrutinyModalProps {
  data: DocumentScrutinyData | null;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: (comment: string) => void;
  onClose: () => void;
}

const docIcons: Record<string, { icon: React.ElementType; bg: string; border: string }> = {
  COMPANY_REGISTRATION: {
    icon: Building2,
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  GST_CERTIFICATE: {
    icon: Receipt,
    bg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
  PAN_CERTIFICATE: {
    icon: CreditCard,
    bg: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
  BANK_GUARANTEE: {
    icon: ShieldCheck,
    bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
};

const VERIFY_PRESETS = [
  "Certificate verified compliant with Scheme rules.",
  "CIN & legal entity details match registered profile.",
  "Statutory document valid and authentic.",
];

const REVERT_PRESETS = [
  "Uploaded certificate is blurry or illegible. Please upload a clear scan.",
  "Certificate has expired. Please upload the valid current certificate.",
  "CIN or company name does not match the registration details.",
  "Authorized signatory stamp/signature missing.",
  "Bank guarantee format or amount does not meet statutory criteria.",
];

export function DocumentScrutinyModal({
  data,
  isOpen,
  isPending,
  onConfirm,
  onClose,
}: DocumentScrutinyModalProps) {
  const [comment, setComment] = useState("");

  const isVerify = data?.action === "verify";
  const isRevert = data?.action === "reject";

  // Reset or initialize default comment whenever modal opens with new data
  useEffect(() => {
    if (data) {
      if (data.action === "verify") {
        setComment("Certificate scrutinized and verified compliant.");
      } else {
        setComment("");
      }
    } else {
      setComment("");
    }
  }, [data]);

  if (!data) return null;

  const docMeta = docIcons[data.documentType] || {
    icon: FileText,
    bg: "bg-muted text-foreground",
    border: "border-border",
  };
  const DocIcon = docMeta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevert && !comment.trim()) {
      return;
    }
    onConfirm(comment.trim() || (isVerify ? "Verified during scrutiny" : "Reverted with objection during scrutiny"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                {isVerify ? (
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                )}
                <DialogTitle className="font-heading font-bold text-lg text-foreground">
                  {isVerify ? "Verify Statutory Certificate" : "Revert Certificate with Objection"}
                </DialogTitle>
              </div>

              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isVerify
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {isVerify ? "Scrutiny · Verify" : "Scrutiny · Revert"}
              </span>
            </div>

            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {isVerify
                ? "Confirm that this certificate complies with the statutory requirements under the Delhi Motor Vehicles Aggregator Scheme, 2023."
                : "Reverting this certificate marks it with an objection. The applicant will be notified to re-upload a compliant certificate."}
            </DialogDescription>
          </DialogHeader>

          {/* Document Preview Card */}
          <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className={`grid h-7 w-7 place-items-center rounded-md border ${docMeta.bg} ${docMeta.border} shrink-0`}>
                <DocIcon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate">{data.documentLabel}</h4>
                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  {data.originalFilename} • v{data.version} ({(data.sizeBytes / 1024).toFixed(0)} KB)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2">
              <span>
                Applicant: <b className="text-foreground">{data.companyName}</b>
              </span>
              <span className="font-mono">#{data.applicationNumber}</span>
            </div>
          </div>

          {/* Remarks Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="scrutiny-remarks" className="font-semibold text-foreground flex items-center gap-1">
                {isVerify ? "Officer Verification Remarks" : "Deficiency / Objection Remarks"}
                {isRevert && <span className="text-destructive font-bold">*</span>}
              </label>
              {isVerify && <span className="text-[10px] text-muted-foreground">Optional</span>}
            </div>

            <Textarea
              id="scrutiny-remarks"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isVerify
                  ? "Enter optional verification remarks (e.g., Certificate verified compliant)..."
                  : "Explain why this certificate is reverted so the applicant knows what to fix..."
              }
              rows={3}
              className="resize-none text-xs"
              required={isRevert}
            />

            {/* Quick Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-medium text-muted-foreground block">
                Quick preset remarks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(isVerify ? VERIFY_PRESETS : REVERT_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setComment(preset)}
                    className="rounded-md border border-border/70 bg-background px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isRevert && !comment.trim() && (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Please provide a deficiency remark to guide the applicant.
            </p>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
              className="rounded-xl font-semibold text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || (isRevert && !comment.trim())}
              className={`rounded-xl text-xs h-9 px-4 gap-1.5 font-semibold shadow-xs ${
                isVerify
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating…
                </>
              ) : isVerify ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  Confirm & Verify Certificate
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Confirm & Revert Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

