import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, ShieldCheck, XCircle, RefreshCw, Loader2 } from "lucide-react";

export interface ConfirmActionData {
  action: string;
  applicationNumber: string;
  companyName: string;
  reason?: string;
}

interface ApplicationActionConfirmDialogProps {
  data: ConfirmActionData | null;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ApplicationActionConfirmDialog({
  data,
  isOpen,
  isPending,
  onConfirm,
  onClose,
}: ApplicationActionConfirmDialogProps) {
  if (!data) return null;

  const getActionConfig = (action: string) => {
    switch (action) {
      case "dc-approve":
        return {
          title: "Confirm DC Scrutiny Recommendation",
          badge: "Step 1 Scrutiny Completion",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
          icon: <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
          description: (
            <span>
              Are you sure you want to complete DC Scrutiny for{" "}
              <b>{data.companyName}</b> (<code>{data.applicationNumber}</code>) and recommend it to{" "}
              <b>SCoT (EV)</b> for statutory licence approval?
            </span>
          ),
          note: "All 4 statutory certificates and bank guarantee have been scrutinized and verified.",
          confirmText: "Confirm & Recommend to SCoT (EV)",
          confirmClass: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
        };
      case "issue-license":
        return {
          title: "Confirm 5-Year Licence Grant",
          badge: "Step 2: Statutory Licence Grant",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
          icon: <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          description: (
            <span>
              Are you sure you want to grant executive approval for{" "}
              <b>{data.companyName}</b> (<code>{data.applicationNumber}</code>) and issue the official{" "}
              <b>5-Year Statutory Licence</b> under the Delhi Aggregator Scheme, 2023?
            </span>
          ),
          note: "This grants the aggregator legal authority to operate electric vehicle fleets across Delhi NCR.",
          confirmText: "Confirm & Issue 5-Year Licence",
          confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold",
        };
      case "deficiency":
        return {
          title: "Confirm Reverting Application (Deficiency)",
          badge: "Revert / Deficiency Notice",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
          icon: <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          description: (
            <span>
              Are you sure you want to revert application <code>{data.applicationNumber}</code> for{" "}
              <b>{data.companyName}</b> back to the operator for document correction?
            </span>
          ),
          note: "The operator will be notified of the reverted documents and your remarks to re-upload the necessary certificates.",
          confirmText: "Confirm & Revert Application",
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white font-semibold",
        };
      case "dc-reject":
        return {
          title: "Confirm Departmental Rejection",
          badge: "Official Rejection",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
          icon: <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
          description: (
            <span>
              Are you sure you want to reject application <code>{data.applicationNumber}</code> for{" "}
              <b>{data.companyName}</b>?
            </span>
          ),
          note: "This will officially reject the application and notify the operator of their statutory 30-day appeal period.",
          confirmText: "Confirm & Reject Application",
          confirmClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold",
        };
      case "appellate-approve":
        return {
          title: "Confirm Appellate Approval",
          badge: "Appellate Order",
          badgeClass: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
          icon: <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />,
          description: (
            <span>
              Are you sure you want to allow the appeal for{" "}
              <b>{data.companyName}</b> (<code>{data.applicationNumber}</code>) and issue the 5-Year Operating Licence?
            </span>
          ),
          note: "The previous rejection order will be overturned by the Appellate Authority.",
          confirmText: "Confirm & Allow Appeal",
          confirmClass: "bg-purple-600 hover:bg-purple-700 text-white font-semibold",
        };
      case "appellate-reject":
        return {
          title: "Confirm Final Appellate Rejection",
          badge: "Final Appellate Order",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
          icon: <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
          description: (
            <span>
              Are you sure you want to uphold the rejection for{" "}
              <b>{data.companyName}</b> (<code>{data.applicationNumber}</code>)?
            </span>
          ),
          note: "This decision is final under statutory appellate jurisdiction.",
          confirmText: "Confirm Final Rejection",
          confirmClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold",
        };
      default:
        return {
          title: "Confirm Action",
          badge: "Departmental Decision",
          badgeClass: "bg-muted text-muted-foreground",
          icon: <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />,
          description: <span>Are you sure you want to proceed with this action?</span>,
          note: undefined,
          confirmText: "Confirm & Proceed",
          confirmClass: "bg-primary text-primary-foreground font-semibold",
        };
    }
  };

  const config = getActionConfig(data.action);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md sm:max-w-lg rounded-2xl p-6">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {config.icon}
              <AlertDialogTitle className="font-heading font-bold text-lg text-foreground">
                {config.title}
              </AlertDialogTitle>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeClass}`}
            >
              {config.badge}
            </span>
          </div>

          <AlertDialogDescription className="text-sm text-foreground/80 leading-relaxed pt-1">
            {config.description}
          </AlertDialogDescription>

          {config.note && (
            <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
              {config.note}
            </div>
          )}

          {data.reason?.trim() && (
            <div className="rounded-xl border bg-slate-50 dark:bg-slate-900/60 p-3.5 space-y-1 text-xs">
              <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block">
                Official Scrutiny Remarks
              </span>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                "{data.reason.trim()}"
              </p>
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isPending}
            onClick={onClose}
            className="rounded-xl border font-semibold text-xs h-10 px-4"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={`rounded-xl text-xs h-10 px-5 gap-2 shadow-sm ${config.confirmClass}`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing…
              </>
            ) : (
              config.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

