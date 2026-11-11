import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  History,
  Inbox,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authorityApplicationMessage,
  getAuthorityApplicationActions,
} from "@/lib/applicationWorkflow";
import {
  decideApplication,
  decideAppellateApplication,
  downloadDocument,
  getDocumentContent,
  issueLicense,
  listApplicationsForReview,
  listAppellateApplications,
  listDocuments,
  reviewDocument,
  startAppellateReview,
  startReview,
  type ApplicationDocument,
  type RegistrationApplication,
} from "@/services/registrationService";
import { getErrorMessage } from "@/services/api";
import { toast } from "sonner";
import {
  ApplicationActionConfirmDialog,
  type ConfirmActionData,
} from "@/components/ApplicationActionConfirmDialog";
import {
  DocumentScrutinyModal,
  type DocumentScrutinyData,
} from "@/components/DocumentScrutinyModal";

type AuthorityAction =
  | "start-dc"
  | "start-appellate"
  | "deficiency"
  | "dc-approve"
  | "dc-reject"
  | "appellate-approve"
  | "appellate-reject"
  | "issue-license";

type QueueTab =
  | "all"
  | "action-required"
  | "under-review"
  | "deficiency"
  | "completed"
  | "rejected";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "LICENSE_ISSUED":
    case "DC_APPROVED":
    case "APPELLATE_APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "SUBMITTED":
    case "APPEAL_SUBMITTED":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "UNDER_REVIEW":
    case "UNDER_APPELLATE_REVIEW":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800";
    case "DEFICIENCY_RAISED":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "DC_REJECTED":
    case "APPELLATE_REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function DocumentStatusBadge({ status }: { status: string }) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        VERIFIED
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">
        <RefreshCw className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
        REVERTED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      PENDING REVIEW
    </span>
  );
}

function DocumentPreview({
  applicationId,
  document,
  onClose,
}: {
  applicationId: string;
  document: ApplicationDocument;
  onClose: () => void;
}) {
  const content = useQuery({
    queryKey: ["document-content", applicationId, document.id],
    queryFn: () => getDocumentContent(applicationId, document.id),
  });
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!content.data) return;
    const objectUrl = URL.createObjectURL(content.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [content.data]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const image = document.contentType.startsWith("image/");
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${document.originalFilename}`}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-6"
    >
      <section className="flex h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              {document.originalFilename}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {document.documentType.replaceAll("_", " ")} · version {document.version}
              </span>
              <DocumentStatusBadge status={document.verificationStatus} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => void downloadDocument(applicationId, document)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              aria-label="Close preview"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="grid min-h-0 flex-1 place-items-center overflow-auto bg-slate-200/70 p-3 sm:p-5">
          {content.isLoading && (
            <span className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading document…
            </span>
          )}
          {content.isError && (
            <p className="rounded-lg bg-background p-4 text-sm text-destructive">
              {getErrorMessage(
                content.error,
                "Document preview could not be loaded.",
              )}
            </p>
          )}
          {url &&
            (image ? (
              <img
                src={url}
                alt={document.originalFilename}
                className="max-h-full max-w-full rounded bg-white object-contain shadow"
              />
            ) : (
              <iframe
                title={document.originalFilename}
                src={url}
                className="h-full min-h-[65dvh] w-full rounded bg-white shadow"
              />
            ))}
        </div>
      </section>
    </div>
  );
}

function ApplicationCard({
  application,
  isExpanded,
  onToggle,
}: {
  application: RegistrationApplication;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<ApplicationDocument | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmActionData | null>(null);
  const [scrutinyModalData, setScrutinyModalData] = useState<DocumentScrutinyData | null>(null);

  const handleRequestAction = (actionName: AuthorityAction) => {
    setConfirmData({
      action: actionName,
      applicationNumber: application.applicationNumber,
      companyName: application.companyName,
      reason: reason.trim(),
    });
  };
  const permissions = getAuthorityApplicationActions(
    application.status,
    auth.role,
    auth.user?.id,
    application.assignedOfficerUserId,
    application.assignedAppellateUserId,
  );
  const docs = useQuery({
    queryKey: ["application-documents", application.id],
    queryFn: () => listDocuments(application.id),
    enabled: isExpanded,
  });
  const documentPages = useClientPagination(docs.data ?? []);
  const refresh = () => {
    setReason("");
    setConfirmData(null);
    setScrutinyModalData(null);
    void client.invalidateQueries({ queryKey: ["authority-applications"] });
    void client.invalidateQueries({
      queryKey: ["application-documents", application.id],
    });
  };
  const action = useMutation({
    mutationFn: async (name: AuthorityAction) => {
      if (name === "start-dc") return startReview(application.id);
      if (name === "start-appellate")
        return startAppellateReview(application.id);
      if (name === "issue-license")
        return issueLicense(application.id);
      if (name === "appellate-approve" || name === "appellate-reject") {
        return decideAppellateApplication(
          application.id,
          name === "appellate-approve" ? "approve" : "reject",
          reason,
        );
      }
      const dcAction =
        name === "dc-approve"
          ? "approve"
          : name === "dc-reject"
            ? "reject"
            : "deficiency";
      return decideApplication(application.id, dcAction, reason);
    },
    onSuccess: refresh,
  });
  const documentAction = useMutation({
    mutationFn: ({ id, name, comment }: { id: string; name: "verify" | "reject"; comment?: string }) =>
      reviewDocument(
        application.id,
        id,
        name,
        comment ||
          (name === "verify" ? "Verified during review" : "Reverted with objection during review"),
      ),
    onSuccess: (_data, variables) => {
      refresh();
      setScrutinyModalData(null);
      toast.success(
        variables.name === "verify"
          ? "Certificate verified"
          : "Certificate reverted with objection",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update certificate scrutiny"));
    },
  });
  const showReason =
    permissions.reviewDocuments ||
    permissions.decideDcReview ||
    permissions.issueLicense ||
    permissions.decideScotReview ||
    permissions.decideAppellateReview;
  const busy = action.isPending || documentAction.isPending;
  const hasReplacements = docs.data?.some(
    (document) => document.replacementUpload && document.currentVersion,
  );

  const allDocs = docs.data ?? [];
  const requiredDocTypes = [
    { type: "COMPANY_REGISTRATION", label: "Company Reg" },
    { type: "GST_CERTIFICATE", label: "GST Certificate" },
    { type: "PAN_CERTIFICATE", label: "PAN Certificate" },
    { type: "BANK_GUARANTEE", label: "Bank Guarantee" },
  ];

  const verificationMap = requiredDocTypes.map(({ type, label }) => {
    const doc = allDocs.find(
      (d) => d.documentType === type && d.currentVersion,
    );
    const isVerified = doc?.verificationStatus === "VERIFIED";
    const isRejected = doc?.verificationStatus === "REJECTED";
    const isPending = Boolean(doc && !isVerified && !isRejected);
    return {
      type,
      label,
      doc,
      isVerified,
      isRejected,
      isPending,
      status: isVerified
        ? "VERIFIED"
        : isRejected
          ? "REJECTED"
          : isPending
            ? "PENDING"
            : "MISSING",
    };
  });

  const verifiedDocsCount = verificationMap.filter((v) => v.isVerified).length;
  const allDocumentsVerified = verifiedDocsCount === 4;

  const isLicenseIssued = application.status === "LICENSE_ISSUED";
  const isAppellateApproved = application.status === "APPELLATE_APPROVED";
  const isDcApproved = application.status === "DC_APPROVED";
  const isDeficiency = application.status === "DEFICIENCY_RAISED";
  const isAppellateFlow =
    application.status === "DC_REJECTED" ||
    application.status === "APPELLATE_REVIEW_PENDING" ||
    application.status === "APPEAL_SUBMITTED" ||
    application.status === "UNDER_APPELLATE_REVIEW" ||
    application.status === "APPELLATE_APPROVED" ||
    application.status === "APPELLATE_REJECTED";

  const step1Completed = isDcApproved || isLicenseIssued || isAppellateApproved;
  const step1Active =
    application.status === "SUBMITTED" ||
    application.status === "UNDER_REVIEW" ||
    isDeficiency;

  const step2Completed = isLicenseIssued || isAppellateApproved;
  const step2Active = isDcApproved;
  const step3Completed = isLicenseIssued;

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-primary/40">
      {/* Collapsed Header / Summary Row */}
      {/* Clickable Header Row: Navigates to Application Page */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/admin/applications/${application.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/admin/applications/${application.id}`);
          }
        }}
        className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer select-none transition-colors ${
          isExpanded ? "bg-muted/40 border-b" : "hover:bg-muted/20"
        }`}
        title="Click to open full scrutiny workspace"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-background hover:bg-muted transition-transform duration-200 ${
              isExpanded
                ? "rotate-180 text-primary border-primary/30"
                : "text-muted-foreground"
            }`}
            title={isExpanded ? "Collapse inline preview" : "Expand inline preview"}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-base truncate">
                {application.companyName}
              </h2>
              <span className="font-mono text-xs rounded bg-muted px-2 py-0.5 text-muted-foreground">
                {application.applicationNumber}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ·
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {application.organizationType} · fleet{" "}
                {application.declaredFleetSize?.toLocaleString()}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="sm:hidden">
                {application.organizationType} · fleet{" "}
                {application.declaredFleetSize?.toLocaleString()} ·
              </span>
              <span>
                Submitted{" "}
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : application.createdAt
                    ? new Date(application.createdAt).toLocaleDateString()
                    : "—"}
              </span>
              <span>·</span>
              <span className="font-medium text-primary">
                {application.status === "UNDER_REVIEW"
                  ? "DC Scrutiny Desk"
                  : application.status === "DC_APPROVED"
                    ? "DC Scrutiny Verified"
                    : application.status === "LICENSE_ISSUED"
                      ? "Licence Active"
                      : "Departmental Desk"}
              </span>
              {application.assignedAppellateUserId && (
                <>
                  <span>·</span>
                  <span>
                    Appellate #{application.assignedAppellateUserId}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          {application.status === "UNDER_REVIEW" && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold hidden md:inline-flex items-center gap-1 ${
                allDocumentsVerified
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
              }`}
            >
              {allDocumentsVerified ? "✓ Ready for SCoT" : "1. DC Scrutiny"}
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(
              application.status,
            )}`}
          >
            {application.status.replaceAll("_", " ")}
          </span>
          <Link
            to={`/admin/applications/${application.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <span>Review File</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            title="Toggle quick inline view"
          >
            {isExpanded ? "Collapse" : "Quick View"}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 space-y-4 animate-in fade-in-50 duration-150">
          {/* Full Scrutiny Workspace Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-primary font-medium">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>Prefer spacious, full-screen document scrutiny?</span>
            </div>
            <Link
              to={`/admin/applications/${application.id}`}
              className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
            >
              Open Full Scrutiny Workspace →
            </Link>
          </div>

          {/* Two-Step Validation Stepper Banner */}
          <div className="rounded-xl border bg-muted/25 p-3.5 shadow-sm">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px]">
                Delhi Govt Two-Step Validation Process
              </span>
              {isLicenseIssued ? (
                <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 5-Year Licence Issued
                </span>
              ) : application.status === "DC_REJECTED" || application.status === "APPELLATE_REJECTED" ? (
                <span className="flex items-center gap-1 font-bold text-rose-700 dark:text-rose-400">
                  <XCircle className="h-3.5 w-3.5" /> Application Rejected
                </span>
              ) : isDeficiency ? (
                <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
                  <RefreshCw className="h-3.5 w-3.5" /> Deficiency Raised (Awaiting Operator Re-upload)
                </span>
              ) : isDcApproved ? (
                <span className="flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-400">
                  <Clock className="h-3.5 w-3.5" /> DC Scrutiny Passed · Awaiting SCoT (EV) Sign-off
                </span>
              ) : (
                <span className="text-muted-foreground text-[11px]">
                  Step 1 of 2: DC Scrutiny
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Step 1: DC Level */}
              <div
                className={`flex items-center gap-2.5 rounded-lg p-2.5 border transition-colors ${
                  step1Completed
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                    : step1Active
                      ? "bg-blue-50/80 border-blue-300 text-blue-950 ring-1 ring-blue-300 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200"
                      : "bg-muted/40 border-muted text-muted-foreground"
                }`}
              >
                <div
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    step1Completed
                      ? "bg-emerald-600 text-white"
                      : step1Active
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground border"
                  }`}
                >
                  {step1Completed ? "✓" : "1"}
                </div>
                <div className="min-w-0">
                  <b className="block leading-tight truncate">1. DC Level Scrutiny</b>
                  <span className="text-[10px] opacity-80 block truncate">
                    {step1Completed
                      ? "Documents & BG Verified"
                      : step1Active
                        ? "Scrutiny in progress"
                        : "Pending submission"}
                  </span>
                </div>
              </div>

              {/* Step 2: SCoT EV */}
              <div
                className={`flex items-center gap-2.5 rounded-lg p-2.5 border transition-colors ${
                  step2Completed
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                    : step2Active
                      ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200"
                      : "bg-muted/40 border-muted text-muted-foreground"
                }`}
              >
                <div
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    step2Completed
                      ? "bg-emerald-600 text-white"
                      : step2Active
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-muted-foreground border"
                  }`}
                >
                  {step2Completed ? "✓" : "2"}
                </div>
                <div className="min-w-0">
                  <b className="block leading-tight truncate">2. SCoT (EV) Approval</b>
                  <span className="text-[10px] opacity-80 block truncate">
                    {step2Completed
                      ? "Official Approval Granted"
                      : step2Active
                        ? "Awaiting Commissioner Sign-off"
                        : "Awaiting DC Scrutiny"}
                  </span>
                </div>
              </div>

              {/* Step 3: Result */}
              <div
                className={`flex items-center gap-2.5 rounded-lg p-2.5 border transition-colors ${
                  step3Completed
                    ? "bg-emerald-100/80 border-emerald-400 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-100"
                    : isAppellateFlow
                      ? "bg-purple-50/80 border-purple-300 text-purple-950 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-200"
                      : "bg-muted/40 border-muted text-muted-foreground"
                }`}
              >
                <div
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    step3Completed
                      ? "bg-emerald-700 text-white"
                      : isAppellateFlow
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-muted-foreground border"
                  }`}
                >
                  {step3Completed ? "★" : isAppellateFlow ? "⚖" : "3"}
                </div>
                <div className="min-w-0">
                  <b className="block leading-tight truncate">
                    {isAppellateFlow ? "Appellate Review" : "5-Year Licence"}
                  </b>
                  <span className="text-[10px] opacity-80 block truncate">
                    {step3Completed
                      ? "Official Licence Active"
                      : isAppellateFlow
                        ? "Appellate Hearing"
                        : "Official Licence Grant"}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Document Scrutiny Checklist */}
            {!isLicenseIssued && !application.status.includes("REJECTED") && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-primary" />
                    DC Scrutiny Progress: <b className="text-foreground">{verifiedDocsCount} of 4 Documents Verified</b>
                  </span>
                  {allDocumentsVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> DC Scrutiny Passed · Eligible for SCoT Sign-off
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-medium text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {4 - verifiedDocsCount} document(s) pending DC verification
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  {verificationMap.map((v) => (
                    <div
                      key={v.type}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                        v.isVerified
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                          : v.isRejected
                            ? "bg-rose-50/70 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                            : "bg-muted/40 border-muted text-muted-foreground"
                      }`}
                    >
                      {v.isVerified ? (
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : v.isRejected ? (
                        <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate font-medium">{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Application Info */}
          <div className="grid gap-2.5 rounded-lg border bg-muted/20 p-3 text-xs md:grid-cols-2">
            <p>
              <b>NCR office:</b> {application.branchOfficeAddress}
            </p>
            <p>
              <b>Compliance officer:</b> {application.complianceOfficerName} ·{" "}
              {application.complianceOfficerDesignation}
            </p>
            <p>
              <b>Contact:</b> {application.contactName} ({application.contactPhone} · {application.contactEmail})
            </p>
            <p>
              <b>Bank guarantee:</b> {application.bankGuaranteeNumber} · ₹
              {application.bankGuaranteeAmount?.toLocaleString()} ({application.bankGuaranteeBank} · valid until{" "}
              {application.bankGuaranteeValidUntil})
            </p>
          </div>

          {hasReplacements && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <b>Updated documents detected.</b> The current replacement is
                highlighted below; previous versions remain available only for
                audit history.
              </p>
            </div>
          )}

          {/* Documents Section */}
          <div>
            <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Submitted Documents
                </h3>
                {auth.role === "admin" && (
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    DC Scrutiny Tier • Read-only for SCoT (EV)
                  </span>
                )}
                {auth.role === "officer" && (
                  <span className="rounded bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    DC Officer Scrutiny Required
                  </span>
                )}
              </div>
              {docs.isLoading && (
                <span className="flex items-center text-xs text-muted-foreground">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Loading documents…
                </span>
              )}
            </div>

            <div className="grid gap-2.5 md:grid-cols-2">
              {documentPages.pageItems.map((doc) => {
                const canReviewDocument =
                  permissions.reviewDocuments &&
                  doc.currentVersion &&
                  doc.verificationStatus === "PENDING";
                const isUpdatedCurrent =
                  doc.currentVersion && doc.replacementUpload;
                return (
                  <div
                    key={doc.id}
                    className={`rounded-lg border p-3 ${
                      isUpdatedCurrent
                        ? "border-amber-300 bg-amber-50/70 ring-1 ring-amber-200 dark:border-amber-700 dark:bg-amber-950/30"
                        : doc.superseded
                          ? "bg-muted/30 opacity-75"
                          : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 text-xs">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <b>{doc.documentType.replaceAll("_", " ")}</b>
                          <DocumentStatusBadge status={doc.verificationStatus} />
                          {isUpdatedCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-900">
                              <RefreshCw className="h-3 w-3" />
                              UPDATED · CURRENT
                            </span>
                          )}
                          {doc.currentVersion && !doc.replacementUpload && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              CURRENT
                            </span>
                          )}
                          {doc.superseded && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <History className="h-3 w-3" />
                              PREVIOUS VERSION
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block break-all text-muted-foreground">
                          {doc.originalFilename} · version {doc.version}
                        </span>
                        <span className="mt-1 block text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                        </span>
                        {doc.verificationComment && (
                          <span className="mt-1 block text-muted-foreground">
                            Review note: {doc.verificationComment}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 gap-1">
                        <button
                          aria-label={`View ${doc.originalFilename}`}
                          onClick={() => setPreview(doc)}
                          className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs hover:bg-muted"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        <button
                          aria-label={`Download ${doc.originalFilename}`}
                          onClick={() =>
                            void downloadDocument(application.id, doc)
                          }
                          className="rounded border bg-background p-1.5 hover:bg-muted"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                    {canReviewDocument && (
                      <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                        <button
                          disabled={busy}
                          onClick={() =>
                            setScrutinyModalData({
                              documentId: doc.id,
                              documentType: doc.documentType,
                              documentLabel: doc.documentType.replaceAll("_", " "),
                              originalFilename: doc.originalFilename,
                              version: doc.version,
                              sizeBytes: doc.sizeBytes,
                              action: "verify",
                              companyName: application.companyName,
                              applicationNumber: application.applicationNumber,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          Verify
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            setScrutinyModalData({
                              documentId: doc.id,
                              documentType: doc.documentType,
                              documentLabel: doc.documentType.replaceAll("_", " "),
                              originalFilename: doc.originalFilename,
                              version: doc.version,
                              sizeBytes: doc.sizeBytes,
                              action: "reject",
                              companyName: application.companyName,
                              applicationNumber: application.applicationNumber,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3 text-rose-600" />
                          Revert
                        </button>
                      </div>
                    )}
                    {doc.superseded && (
                      <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
                        Audit copy only — review actions apply to the current
                        version.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <ListPagination
              page={documentPages.page}
              pageSize={documentPages.pageSize}
              totalItems={documentPages.totalItems}
              onPageChange={documentPages.setPage}
            />
          </div>

          {showReason && (
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                auth.role === "admin"
                  ? "Executive decision remarks (e.g. Approved under Scheme Clause 4 / Deficiency notes for DC & Applicant)"
                  : permissions.reviewDocuments
                    ? "Decision reason or document comment"
                    : "Decision reason or scrutiny remarks"
              }
              className="min-h-20 w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}

          {permissions.hasActions ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {permissions.startDcReview && (
                <button
                  disabled={busy}
                  onClick={() => action.mutate("start-dc")}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Start departmental review
                </button>
              )}
              {permissions.startAppellateReview && (
                <button
                  disabled={busy}
                  onClick={() => action.mutate("start-appellate")}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Start appellate review
                </button>
              )}
              {permissions.decideDcReview && application.status === "UNDER_REVIEW" && (
                <div className="flex flex-col gap-3 w-full">
                  {/* SCoT / Admin: Lock Callout when DC Scrutiny Incomplete */}
                  {auth.role === "admin" && !allDocumentsVerified && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 shadow-sm">
                      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                      <div className="space-y-1">
                        <b className="font-semibold text-sm block">
                          Step 1: DC Level Scrutiny In Progress ({verifiedDocsCount}/4 Documents Verified)
                        </b>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          This file is currently undergoing scrutiny by the Deputy Commissioner (DC Level).
                          As SCoT (EV) Licensing Authority, licence approval will unlock automatically once all 4 documents and Bank Guarantee details are marked <b>Verified</b> by the DC Officer.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SCoT / Admin: Callout when DC Scrutiny Verified */}
                  {auth.role === "admin" && allDocumentsVerified && (
                    <div className="flex items-start gap-3 rounded-xl border border-blue-300 bg-blue-50/90 p-3.5 text-xs text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200 shadow-sm">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <div className="space-y-1">
                        <b className="font-semibold text-sm block">
                          Step 1: DC Scrutiny Completed (4/4 Documents Verified)
                        </b>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          All 4 documents are verified. Awaiting DC Officer to formally submit the file recommendation to SCoT (EV).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DC Officer: Advisory when Scrutiny Incomplete */}
                  {auth.role === "officer" && !allDocumentsVerified && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Scrutinize and verify all 4 documents ({verifiedDocsCount}/4 verified) before recommending approval to SCoT (EV).
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <button
                      disabled={!reason.trim() || busy}
                      onClick={() => handleRequestAction("deficiency")}
                      className="rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors disabled:opacity-40"
                    >
                      Revert Application (Raise Deficiency)
                    </button>
                    <button
                      disabled={!reason.trim() || busy || !allDocumentsVerified}
                      onClick={() => handleRequestAction("dc-approve")}
                      className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
                    >
                      Complete DC Scrutiny & Recommend to SCoT (EV)
                    </button>
                    <button
                      disabled={!reason.trim() || busy}
                      onClick={() => handleRequestAction("dc-reject")}
                      className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors disabled:opacity-40"
                    >
                      Reject (Refer to Appellate Authority)
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: SCoT (EV) Executive Licence Approval */}
              {permissions.issueLicense && application.status === "DC_APPROVED" && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-sm">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="space-y-1">
                      <b className="font-semibold text-sm block">
                        ✓ Step 1 Passed: DC Level Scrutiny Completed & Recommended
                      </b>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        The Deputy Commissioner has scrutinized and verified all 4 documents and Bank Guarantee details.
                        As Special Commissioner of Transport (SCoT - EV) Licensing Authority, you may now grant licence approval.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <button
                      disabled={busy}
                      onClick={() => handleRequestAction("issue-license")}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-40"
                    >
                      Grant SCoT (EV) Approval & Issue 5-Year Licence
                    </button>
                    <button
                      disabled={!reason.trim() || busy}
                      onClick={() => handleRequestAction("deficiency")}
                      className="rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors disabled:opacity-40"
                    >
                      Revert Application (Raise Deficiency)
                    </button>
                    <button
                      disabled={!reason.trim() || busy}
                      onClick={() => handleRequestAction("dc-reject")}
                      className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors disabled:opacity-40"
                    >
                      Reject (Refer to Appellate Authority)
                    </button>
                  </div>
                </div>
              )}

              {/* Appellate Licence Issuance */}
              {permissions.issueLicense && application.status === "APPELLATE_APPROVED" && (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    disabled={busy}
                    onClick={() => handleRequestAction("issue-license")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    Issue 5-Year Licence (Appellate Approval)
                  </button>
                </div>
              )}
              {permissions.decideAppellateReview && (
                <>
                  <button
                    disabled={!reason.trim() || busy}
                    onClick={() => handleRequestAction("appellate-approve")}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  >
                    Allow and issue 5-year licence
                  </button>
                  <button
                    disabled={!reason.trim() || busy}
                    onClick={() => handleRequestAction("appellate-reject")}
                    className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40"
                  >
                    Confirm rejection
                  </button>
                </>
              )}
              {busy && (
                <span className="inline-flex items-center text-xs text-muted-foreground self-center ml-2">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Updating…
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <b className="text-xs">Read-only at this stage</b>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {authorityApplicationMessage(application.status)}
                </p>
              </div>
            </div>
          )}

          {application.status === "LICENSE_ISSUED" && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm shrink-0">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    5-Year Operating Licence Issued & Active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Approved by SCoT (EV) Licensing Authority
                    {application.licenseIssuedAt
                      ? ` on ${new Date(application.licenseIssuedAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-200/80 dark:bg-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-100">
                ACTIVE LICENCE
              </span>
            </div>
          )}
          {(application.status === "DEFICIENCY_RAISED" ||
            application.status === "APPELLATE_REVIEW_PENDING" ||
            application.status === "APPEAL_SUBMITTED") && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              This application remains visible for tracking.
            </p>
          )}
          {(action.isError || documentAction.isError || docs.isError) && (
            <p className="text-sm text-destructive">
              {getErrorMessage(
                action.error || documentAction.error || docs.error,
              )}
            </p>
          )}
        </div>
      )}

      {preview && (
        <DocumentPreview
          applicationId={application.id}
          document={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {/* Document Scrutiny Confirmation Modal (Verify & Revert) */}
      <DocumentScrutinyModal
        data={scrutinyModalData}
        isOpen={Boolean(scrutinyModalData)}
        isPending={documentAction.isPending}
        onConfirm={(comment) => {
          if (scrutinyModalData) {
            documentAction.mutate({
              id: scrutinyModalData.documentId,
              name: scrutinyModalData.action,
              comment,
            });
          }
        }}
        onClose={() => setScrutinyModalData(null)}
      />

      {/* Decision Action Confirmation Dialog */}
      <ApplicationActionConfirmDialog
        data={confirmData}
        isOpen={Boolean(confirmData)}
        isPending={action.isPending}
        onConfirm={() => {
          if (confirmData) {
            action.mutate(confirmData.action as AuthorityAction);
          }
        }}
        onClose={() => setConfirmData(null)}
      />
    </article>
  );
}

export default function AdminApplications() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const appellateOnly = auth.role === "appellate_officer";
  const query = useQuery({
    queryKey: ["authority-applications", auth.role],
    queryFn: appellateOnly
      ? listAppellateApplications
      : () => listApplicationsForReview(),
  });

  const [activeTab, setActiveTab] = useState<QueueTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const applications = useMemo(() => query.data ?? [], [query.data]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = (ids: string[]) => {
    setExpandedIds(new Set(ids));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Status breakdown counts
  const counts = useMemo(() => {
    let actionRequired = 0;
    let underReview = 0;
    let deficiency = 0;
    let completed = 0;
    let rejected = 0;

    for (const app of applications) {
      if (auth.role === "admin") {
        if (app.status === "DC_APPROVED" || app.status === "APPELLATE_APPROVED") {
          actionRequired++;
        } else if (
          app.status === "SUBMITTED" ||
          app.status === "UNDER_REVIEW" ||
          app.status === "APPEAL_SUBMITTED" ||
          app.status === "APPELLATE_REVIEW_PENDING" ||
          app.status === "UNDER_APPELLATE_REVIEW"
        ) {
          underReview++;
        } else if (app.status === "DEFICIENCY_RAISED") {
          deficiency++;
        } else if (app.status === "LICENSE_ISSUED") {
          completed++;
        } else if (
          app.status === "DC_REJECTED" ||
          app.status === "APPELLATE_REJECTED"
        ) {
          rejected++;
        }
      } else {
        if (
          app.status === "SUBMITTED" ||
          app.status === "APPEAL_SUBMITTED" ||
          app.status === "APPELLATE_REVIEW_PENDING"
        ) {
          actionRequired++;
        } else if (
          app.status === "UNDER_REVIEW" ||
          app.status === "DC_APPROVED" ||
          app.status === "UNDER_APPELLATE_REVIEW"
        ) {
          underReview++;
        } else if (app.status === "DEFICIENCY_RAISED") {
          deficiency++;
        } else if (
          app.status === "LICENSE_ISSUED" ||
          app.status === "APPELLATE_APPROVED"
        ) {
          completed++;
        } else if (
          app.status === "DC_REJECTED" ||
          app.status === "APPELLATE_REJECTED"
        ) {
          rejected++;
        }
      }
    }

    return {
      all: applications.length,
      "action-required": actionRequired,
      "under-review": underReview,
      deficiency,
      completed,
      rejected,
    };
  }, [applications, auth.role]);

  // Tab and Search filtering
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Tab filter
      if (activeTab === "action-required") {
        if (auth.role === "admin") {
          if (app.status !== "DC_APPROVED" && app.status !== "APPELLATE_APPROVED") return false;
        } else {
          const isAction =
            app.status === "SUBMITTED" ||
            app.status === "APPEAL_SUBMITTED" ||
            app.status === "APPELLATE_REVIEW_PENDING";
          if (!isAction) return false;
        }
      } else if (activeTab === "under-review") {
        if (auth.role === "admin") {
          const isReview =
            app.status === "SUBMITTED" ||
            app.status === "UNDER_REVIEW" ||
            app.status === "APPEAL_SUBMITTED" ||
            app.status === "APPELLATE_REVIEW_PENDING" ||
            app.status === "UNDER_APPELLATE_REVIEW";
          if (!isReview) return false;
        } else {
          const isReview =
            app.status === "UNDER_REVIEW" ||
            app.status === "DC_APPROVED" ||
            app.status === "UNDER_APPELLATE_REVIEW";
          if (!isReview) return false;
        }
      } else if (activeTab === "deficiency") {
        if (app.status !== "DEFICIENCY_RAISED") return false;
      } else if (activeTab === "completed") {
        if (auth.role === "admin") {
          if (app.status !== "LICENSE_ISSUED") return false;
        } else {
          const isCompleted =
            app.status === "LICENSE_ISSUED" ||
            app.status === "APPELLATE_APPROVED";
          if (!isCompleted) return false;
        }
      } else if (activeTab === "rejected") {
        const isRejected =
          app.status === "DC_REJECTED" ||
          app.status === "APPELLATE_REJECTED";
        if (!isRejected) return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.companyName?.toLowerCase().includes(q) ||
        app.applicationNumber?.toLowerCase().includes(q) ||
        app.organizationType?.toLowerCase().includes(q) ||
        app.contactEmail?.toLowerCase().includes(q) ||
        app.contactPhone?.toLowerCase().includes(q) ||
        app.complianceOfficerName?.toLowerCase().includes(q)
      );
    });
  }, [applications, activeTab, searchQuery]);

  const pages = useClientPagination(filteredApplications);

  const tabOptions: Array<{ id: QueueTab; label: string; count: number }> = [
    { id: "all", label: "All Applications", count: counts.all },
    {
      id: "action-required",
      label:
        auth.role === "admin"
          ? "Awaiting SCoT Sign-off"
          : auth.role === "officer"
            ? "Needs DC Scrutiny"
            : "Appeals Pending",
      count: counts["action-required"],
    },
    {
      id: "under-review",
      label:
        auth.role === "admin"
          ? "In Scrutiny / Review"
          : auth.role === "officer"
            ? "Under DC Review"
            : "Under Appellate Hearing",
      count: counts["under-review"],
    },
    { id: "deficiency", label: "Deficiency Raised", count: counts.deficiency },
    {
      id: "completed",
      label:
        auth.role === "admin"
          ? "Licences Granted"
          : "Approved / Issued",
      count: counts.completed,
    },
    { id: "rejected", label: "Rejected Files", count: counts.rejected },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {appellateOnly ? "Appellate applications" : "Licence applications"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {appellateOnly
              ? "Appellate Authority Desk: Hearing and adjudication of appeals filed against departmental rejections."
              : auth.role === "officer"
                ? "Step 1: DC Level Scrutiny Desk — Review Form 1 eligibility, verify 4 mandatory documents & Bank Guarantee, or raise deficiencies."
                : auth.role === "admin"
                  ? "Step 2: SCoT (EV) Licensing Desk — Executive review of DC-verified applications for final licence grant."
                  : "Review applications only when their status and assignment permit an authority action."}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 px-3.5 py-2 text-xs shadow-sm">
          <span className="text-muted-foreground">Active Desk: </span>
          <b className="font-bold text-foreground">
            {auth.role === "officer"
              ? "1. DC Level (Scrutiny Desk)"
              : auth.role === "admin"
                ? "2. SCoT (EV) (Licensing Authority)"
                : auth.role === "appellate_officer"
                  ? "Appellate Authority"
                  : auth.role?.toUpperCase()}
          </b>
        </div>
      </div>

      {query.isError && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(query.error)}
        </p>
      )}

      {/* Main Container */}
      <section className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Queue Status Tabs */}
        <div className="flex overflow-x-auto border-b bg-muted/20 p-2 gap-1.5">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === tab.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Bulk Action Toolbar */}
        <div className="flex flex-col gap-2.5 border-b p-3 sm:flex-row sm:items-center sm:justify-between bg-card">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by company, application no, contact…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pages.pageItems.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    expandAll(pages.pageItems.map((app) => app.id))
                  }
                  className="h-8 text-xs"
                >
                  Expand Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="h-8 text-xs"
                >
                  Collapse All
                </Button>
              </>
            )}
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Application List */}
        <div className="p-4 space-y-3 ">
          {query.isLoading ? (
            <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading applications queue…
            </div>
          ) : pages.pageItems.length > 0 ? (
            pages.pageItems.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                isExpanded={expandedIds.has(application.id)}
                onToggle={() => toggleExpanded(application.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">No applications found.</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || activeTab !== "all"
                  ? "Try clearing filters or changing the active status tab."
                  : "There are currently no applications in this queue."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className=" px-2 py-1">
          <ListPagination
            page={pages.page}
            pageSize={pages.pageSize}
            totalItems={pages.totalItems}
            onPageChange={pages.setPage}
          />
        </div>
      </section>
    </DashboardLayout>
  );
}
