import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileText,
  History,
  IndianRupee,
  Landmark,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Receipt,
  RefreshCw,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  authorityApplicationMessage,
  getAuthorityApplicationActions,
} from "@/lib/applicationWorkflow";
import {
  decideApplication,
  decideAppellateApplication,
  downloadDocument,
  getAdminApplication,
  getDocumentContent,
  issueLicense,
  listDocuments,
  reviewDocument,
  startAppellateReview,
  startReview,
  type ApplicationDocument,
} from "@/services/registrationService";
import { getErrorMessage } from "@/services/api";
import {
  ApplicationActionConfirmDialog,
  type ConfirmActionData,
} from "@/components/ApplicationActionConfirmDialog";
import {
  DocumentScrutinyModal,
  type DocumentScrutinyData,
} from "@/components/DocumentScrutinyModal";


const docTypeMeta: Record<
  string,
  { label: string; icon: any; bg: string; text: string; border: string }
> = {
  COMPANY_REGISTRATION: {
    label: "Company Registration",
    icon: Building2,
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300",
  },
  GST_CERTIFICATE: {
    label: "GST Certificate",
    icon: IndianRupee,
      bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300",
  },
  PAN_CERTIFICATE: {
    label: "PAN Certificate",
    icon: CreditCard,
      bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300",
  },
  BANK_GUARANTEE: {
    label: "Bank Guarantee",
    icon: Landmark,
       bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300",
  },
};

function DocumentPreviewModal({
  applicationId,
  document,
  canReview,
  onReview,
  onClose,
}: {
  applicationId: string;
  document: ApplicationDocument;
  canReview?: boolean;
  onReview?: (doc: ApplicationDocument, action: "verify" | "reject") => void;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isImage = document.contentType.startsWith("image/");
  const meta = docTypeMeta[document.documentType];
  const Icon = meta?.icon || FileText;

  const handleDownload = async () => {
    try {
      await downloadDocument(applicationId, document);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to download document."));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${document.originalFilename}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
    >
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-background shadow-2xl overflow-hidden border">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/40">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-8 w-8 place-items-center rounded-lg border ${
                meta?.bg || "bg-muted text-foreground border-border"
              } shrink-0 shadow-2xs`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground">
                {meta?.label || document.documentType.replaceAll("_", " ")}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {document.originalFilename} • version {document.version} (
                {(document.sizeBytes / 1024).toFixed(0)} KB)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canReview && onReview && (
              <>
                <Button
                  size="sm"
                  onClick={() => onReview(document, "verify")}
                  className="h-8 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Verify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReview(document, "reject")}
                  className="h-8 gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 border-border hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/40 shadow-2xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Revert
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleDownload()}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto bg-muted/10 p-6 flex items-center justify-center">
          {content.isLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              Loading document preview…
            </div>
          )}

          {content.isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center max-w-md">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
              <p className="font-semibold text-sm text-destructive">
                Unable to load document preview
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getErrorMessage(
                  content.error,
                  "The file content could not be loaded from secure storage. You can still try downloading the file directly.",
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleDownload()}
                className="mt-4 gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Try Download
              </Button>
            </div>
          )}

          {url &&
            (isImage ? (
              <img
                src={url}
                alt={document.originalFilename}
                className="max-h-full max-w-full rounded-xl object-contain shadow-md border bg-white"
              />
            ) : (
              <iframe
                title={document.originalFilename}
                src={url}
                className="h-full w-full rounded-xl border bg-white shadow-sm"
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "LICENSE_ISSUED":
    case "DC_APPROVED":
    case "APPELLATE_APPROVED":
      return "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
    case "SUBMITTED":
    case "APPEAL_SUBMITTED":
      return "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
    case "UNDER_REVIEW":
    case "UNDER_APPELLATE_REVIEW":
      return "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800";
    case "DEFICIENCY_RAISED":
      return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
    case "DC_REJECTED":
    case "APPELLATE_REJECTED":
      return "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const client = useQueryClient();
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<ApplicationDocument | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmActionData | null>(null);
  const [scrutinyModalData, setScrutinyModalData] = useState<DocumentScrutinyData | null>(null);

  const appQuery = useQuery({
    queryKey: ["admin-application", id],
    queryFn: () => getAdminApplication(id!),
    enabled: Boolean(id),
  });

  const docsQuery = useQuery({
    queryKey: ["application-documents", id],
    queryFn: () => listDocuments(id!),
    enabled: Boolean(id),
  });

  const application = appQuery.data;

  const permissions = application
    ? getAuthorityApplicationActions(
        application.status,
        auth.role,
        auth.user?.id,
        application.assignedOfficerUserId,
        application.assignedAppellateUserId,
      )
    : null;

  const refresh = () => {
    setReason("");
    setConfirmData(null);
    setScrutinyModalData(null);
    void client.invalidateQueries({ queryKey: ["admin-application", id] });
    void client.invalidateQueries({ queryKey: ["application-documents", id] });
    void client.invalidateQueries({ queryKey: ["authority-applications"] });
  };

  const handleRequestAction = (actionName: string) => {
    if (!application) return;
    setConfirmData({
      action: actionName,
      applicationNumber: application.applicationNumber,
      companyName: application.companyName,
      reason: reason.trim(),
    });
  };

  const action = useMutation({
    mutationFn: async (name: string) => {
      if (!id) return;
      if (name === "start-dc") return startReview(id);
      if (name === "start-appellate") return startAppellateReview(id);
      if (name === "issue-license") return issueLicense(id);
      if (name === "appellate-approve" || name === "appellate-reject") {
        return decideAppellateApplication(
          id,
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
      return decideApplication(id, dcAction, reason);
    },
    onSuccess: refresh,
  });

  const handleStartDcScrutiny = () => {
    action.mutate("start-dc", {
      onSuccess: () => {
        document.getElementById("documents-desk")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
    });
    document.getElementById("documents-desk")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const documentAction = useMutation({
    mutationFn: ({
      docId,
      name,
      comment,
    }: {
      docId: string;
      name: "verify" | "reject";
      comment?: string;
    }) =>
      reviewDocument(
        id!,
        docId,
        name,
        comment || (name === "verify" ? "Verified during scrutiny" : "Reverted with objection during scrutiny"),
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

  const handleOpenDocModal = (
    doc: ApplicationDocument,
    actionName: "verify" | "reject",
    docLabel: string,
  ) => {
    if (!application) return;
    setScrutinyModalData({
      documentId: doc.id,
      documentType: doc.documentType,
      documentLabel: docLabel,
      originalFilename: doc.originalFilename,
      version: doc.version,
      sizeBytes: doc.sizeBytes,
      action: actionName,
      companyName: application.companyName,
      applicationNumber: application.applicationNumber,
    });
  };

  const handleDownload = async (doc: ApplicationDocument) => {
    try {
      await downloadDocument(id!, doc);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to download document."));
    }
  };

  const allDocs = docsQuery.data ?? [];
  const requiredDocTypes = [
    { type: "COMPANY_REGISTRATION", label: "Company Registration" },
    { type: "GST_CERTIFICATE", label: "GST Certificate" },
    { type: "PAN_CERTIFICATE", label: "PAN Certificate" },
    { type: "BANK_GUARANTEE", label: "Bank Guarantee" },
  ];

  const verificationMap = requiredDocTypes.map(({ type, label }) => {
    const doc = allDocs.find((d) => d.documentType === type && d.currentVersion);
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
  const hasRevertedDocs = verificationMap.some((v) => v.isRejected);

  const isLicenseIssued = application?.status === "LICENSE_ISSUED";
  const isAppellateApproved = application?.status === "APPELLATE_APPROVED";
  const isDcApproved = application?.status === "DC_APPROVED";
  const isDeficiency = application?.status === "DEFICIENCY_RAISED";
  const isAppellateFlow =
    application?.status === "DC_REJECTED" ||
    application?.status === "APPELLATE_REVIEW_PENDING" ||
    application?.status === "APPEAL_SUBMITTED" ||
    application?.status === "UNDER_APPELLATE_REVIEW" ||
    application?.status === "APPELLATE_APPROVED" ||
    application?.status === "APPELLATE_REJECTED";

  const step1Completed = isDcApproved || isLicenseIssued || isAppellateApproved;
  const step1Active =
    application?.status === "SUBMITTED" ||
    application?.status === "UNDER_REVIEW" ||
    isDeficiency;
  const step2Completed = isLicenseIssued || isAppellateApproved;
  const step2Active = isDcApproved;
  const step3Completed = isLicenseIssued;

  const busy = action.isPending || documentAction.isPending;

  if (appQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading application details…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold">Application Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested registration application does not exist or you do not have permission to review it.
          </p>
          <Button className="mt-6" onClick={() => navigate("/admin/applications")}>
            Back to Applications
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications Queue
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Application ID: <code className="font-mono">{application.id.slice(0, 8)}</code>
            </span>
          </div>
        </div>

        {/* Application Header Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {application.companyName}
                </h1>
                <span className="font-mono text-sm font-semibold rounded-lg bg-muted px-2.5 py-1 text-muted-foreground border">
                  {application.applicationNumber}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(
                    application.status,
                  )}`}
                >
                  {application.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                <span className="font-semibold text-foreground">
                  {application.organizationType}
                </span>
                <span>•</span>
                <span>Declared Fleet: <b>{application.declaredFleetSize?.toLocaleString()}</b> vehicles</span>
                <span>•</span>
                <span>
                  Submitted:{" "}
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleDateString()
                    : new Date(application.createdAt).toLocaleDateString()}
                </span>
                {/* <span>•</span> */}
                {/* <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {application.status === "UNDER_REVIEW"
                    ? "DC Scrutiny Desk"
                    : application.status === "DC_APPROVED"
                      ? "DC Scrutiny Verified"
                      : application.status === "LICENSE_ISSUED"
                        ? "Licence Active"
                        : "Departmental Scrutiny"}
                </span> */}
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3">
              {permissions?.startDcReview && (
                <Button
                  onClick={handleStartDcScrutiny}
                  disabled={busy}
                  className="gap-2 font-semibold shadow-sm"
                >
                  <FileCheck2 className="h-4 w-4" /> Start DC Scrutiny
                </Button>
              )}
              {isLicenseIssued && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-right dark:border-emerald-800 dark:bg-emerald-950/40">
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {application.status === "UNDER_REVIEW"
                    ? "DC Scrutiny Desk"
                    : application.status === "DC_APPROVED"
                      ? "DC Scrutiny Verified"
                      : application.status === "LICENSE_ISSUED"
                        ? "Licence Active"
                        : "Departmental Scrutiny"}
                </span>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Banner: Delhi Govt Scrutiny Lifecycle (1 ────── 2 ────── 3) */}
      <div className="mt-6 rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Delhi Govt Scrutiny Lifecycle
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                · Clause 4 Scrutiny & 5-Year Operating Licence
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border shadow-2xs ${
              step3Completed
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : step2Active
                  ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                  : isDeficiency
                    ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
            }`}>
            {step3Completed ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                5-Year Operating Licence Active
              </>
            ) : step2Active ? (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                Step 2 of 2: SCoT (EV) Sign-off
              </>
            ) : isDeficiency ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-700" />
                Deficiency: Applicant Re-upload Pending
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                Step 1 of 2: DC Scrutiny Desk
              </>
            )}
          </span>
        </div>

        {/* Full-Width Distributed Stepper: 1 ────── 2 ────── 3 */}
        <div className="relative px-1 sm:px-2">
          <div className="relative flex items-start justify-between w-full">
            {/* Background connecting track line: runs from Circle 1 center (20px) to Circle 3 center (20px from right) */}
            <div className="absolute top-5 left-5 right-5 h-1 -translate-y-1/2 z-0">
              <div className="relative h-full w-full bg-muted-foreground/20 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    step3Completed
                      ? "w-full bg-emerald-500 shadow-xs"
                      : step2Completed || step2Active
                        ? "w-1/2 bg-emerald-500 shadow-xs"
                        : "w-0"
                  }`}
                />
              </div>
            </div>

            {/* Step 1 Node (Left-aligned: Zero extra left padding) */}
            <div className="relative z-10 flex flex-col items-start text-left max-w-[210px]">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold transition-all shadow-sm ring-4 ring-card ${
                  step1Completed
                    ? "bg-emerald-600 text-white border-2 border-emerald-500 shadow-emerald-500/20"
                    : step1Active
                      ? isDeficiency
                        ? "bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-950/60 animate-pulse border-2 border-amber-500"
                        : "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60 border-2 border-blue-500"
                      : "bg-muted text-muted-foreground border-2 border-border"
                }`}
              >
                {step1Completed ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : isDeficiency ? (
                  "!"
                ) : (
                  "1"
                )}
              </div>
              <div className="mt-2.5 flex flex-col items-start gap-1">
                <b className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  1. DC Level Scrutiny
                </b>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    step1Completed
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                      : isDeficiency
                        ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                        : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                  }`}
                >
                  {step1Completed ? (
                    <>
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Certificates & BG Verified
                    </>
                  ) : isDeficiency ? (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Objections Raised
                    </>
                  ) : (
                    "Verification In Progress"
                  )}
                </span>
              </div>
            </div>

            {/* Step 2 Node (Centered in middle) */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-[210px]">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold transition-all shadow-sm ring-4 ring-card ${
                  step2Completed
                    ? "bg-emerald-600 text-white border-2 border-emerald-500 shadow-emerald-500/20"
                    : step2Active
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60 border-2 border-blue-500 shadow-md"
                      : "bg-muted text-muted-foreground border-2 border-border"
                }`}
              >
                {step2Completed ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  "2"
                )}
              </div>
              <div className="mt-2.5 flex flex-col items-center gap-1">
                <b className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  2. SCoT (EV) Approval
                </b>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    step2Completed
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                      : step2Active
                        ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                        : "bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  {step2Completed ? (
                    <>
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Sign-off Granted
                    </>
                  ) : step2Active ? (
                    <>
                      <Clock className="h-3 w-3" />
                      Commissioner Sign-off
                    </>
                  ) : (
                    "Awaiting DC Scrutiny"
                  )}
                </span>
              </div>
            </div>

            {/* Step 3 Node (Right-aligned: Zero extra right padding) */}
            <div className="relative z-10 flex flex-col items-end text-right max-w-[210px]">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold transition-all shadow-sm ring-4 ring-card ${
                  step3Completed
                    ? "bg-emerald-700 text-white ring-4 ring-emerald-200 dark:ring-emerald-900/60 border-2 border-emerald-600"
                    : isAppellateFlow
                      ? "bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-950/60 border-2 border-purple-500"
                      : "bg-muted text-muted-foreground border-2 border-border"
                }`}
              >
                {step3Completed ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : isAppellateFlow ? (
                  "⚖"
                ) : (
                  "3"
                )}
              </div>
              <div className="mt-2.5 flex flex-col items-end gap-1">
                <b className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  {isAppellateFlow ? "3. Appellate Authority" : "3. 5-Year Licence"}
                </b>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    step3Completed
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                      : isAppellateFlow
                        ? "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                        : "bg-muted/50 text-muted-foreground border-border"
                  }`}
                >
                  {step3Completed ? (
                    <>
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Official Licence Active
                    </>
                  ) : isAppellateFlow ? (
                    "Under Appeal"
                  ) : (
                    "Final Operating Grant"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Main Content: Spacious Two Columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column (5 Cols): Organisation & Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Organisation Profile Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base">Organisation Profile</h3>
                  <p className="text-xs text-muted-foreground">Registered company & legal entity details</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Company Legal Name</span>
                  <p className="font-semibold text-foreground text-base mt-0.5">{application.companyName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Entity Type</span>
                    <p className="font-medium text-foreground mt-0.5">{application.organizationType}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">CIN / Registration No</span>
                    <p className="font-mono font-semibold text-foreground mt-0.5">{application.registrationNumber}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Registered Office Address</span>
                  <p className="text-foreground mt-0.5 leading-relaxed">{application.registeredAddress}</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>NCR Branch Office</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {application.branchOfficeAddress}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Vehicle Categories</span>
                    <div className="flex gap-1.5 mt-1">
                      {application.categories?.map((cat) => (
                        <span key={cat} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Declared Fleet</span>
                    <p className="font-bold text-foreground mt-0.5">
                      {application.declaredFleetSize?.toLocaleString()} vehicles
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorised Contact & Compliance Officer Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base">Key Contacts</h3>
                  <p className="text-xs text-muted-foreground">Primary applicant & mandatory compliance officer</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-xl border p-3.5 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Authorised Primary Contact
                  </span>
                  <p className="font-semibold text-foreground">{application.contactName}</p>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {application.contactPhone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {application.contactEmail}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Mandatory Compliance Officer
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      Designated
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {application.complianceOfficerName} · <span className="font-normal text-muted-foreground">{application.complianceOfficerDesignation}</span>
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {application.complianceOfficerPhone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {application.complianceOfficerEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Guarantee Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base">Bank Guarantee Security</h3>
                  <p className="text-xs text-muted-foreground">Prescribed security deposit under Clause 4</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Deposit Amount</span>
                  <span className="font-heading text-lg font-bold text-foreground">
                    ₹{application.bankGuaranteeAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">BG Reference</span>
                    <p className="font-mono font-bold text-foreground mt-0.5">{application.bankGuaranteeNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Issuing Bank</span>
                    <p className="font-semibold text-foreground mt-0.5">{application.bankGuaranteeBank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Valid Until</span>
                    <p className="font-semibold text-foreground mt-0.5">{application.bankGuaranteeValidUntil}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Beneficiary</span>
                    <p className="font-semibold text-foreground mt-0.5 truncate" title={application.bankGuaranteeBeneficiary}>
                      Transport Commissioner
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Document Verification Desk & Decisions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Document Scrutiny Desk Card */}
            <div id="documents-desk" className="rounded-2xl border bg-card p-6 shadow-sm space-y-5 scroll-mt-6">
              <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-heading font-bold text-lg">Submitted Documents Desk</h3>
                  <p className="text-xs text-muted-foreground">
                    Scrutinize and verify all 4 required certificates
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      allDocumentsVerified
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {verifiedDocsCount} of 4 Verified
                  </span>
                </div>
              </div>

              {/* Quick Action Banner when in SUBMITTED status */}
              {permissions?.startDcReview && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>
                      Application is in <b>SUBMITTED</b> status. Start DC Scrutiny to unlock certificate verification.
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleStartDcScrutiny}
                    disabled={busy}
                    className="h-8 gap-1.5 text-xs font-semibold shrink-0 shadow-xs"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" /> Start DC Scrutiny
                  </Button>
                </div>
              )}

              {/* Document Cards: Simple One-by-One Row Wise with Refined Padding & Typography */}
              <div className="space-y-3.5">
                {verificationMap.map(({ type, label, doc, isVerified, isRejected, isPending }) => {
                  const canReviewDocument =
                    permissions?.reviewDocuments &&
                    doc &&
                    doc.currentVersion &&
                    doc.verificationStatus === "PENDING";
                  const meta = docTypeMeta[type];
                  const Icon = meta?.icon || FileText;

                  return (
                    <div
                      key={type}
                      className={`rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                        isRejected
                          ? "border-amber-300/80 bg-amber-50/20 dark:border-amber-800 dark:bg-amber-950/20"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      {/* Top Line: Title on left, Status Badge beside View/Download on right */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`grid h-8 w-8 place-items-center rounded-lg border ${
                              meta?.bg || "bg-muted text-foreground border-border"
                            } shrink-0 shadow-2xs`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-foreground tracking-tight truncate">
                            {label}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 text-xs font-medium rounded-lg border-border hover:bg-muted"
                              onClick={() => setPreview(doc)}
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          )}

                          {isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> VERIFIED
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">
                              <RefreshCw className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" /> REVERTED
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> PENDING REVIEW
                            </span>
                          )}
                          {!doc && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border">
                              NOT UPLOADED
                            </span>
                          )}

                          {doc && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg border-border hover:bg-muted"
                              onClick={() => void handleDownload(doc)}
                              title="Download document file"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* File Details: Immediately below header */}
                      {doc ? (
                        <div className="mt-2.5 flex items-center gap-2 text-xs">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="font text-xs sm:text-[13px] font-medium text-foreground/90 truncate">
                            {doc.originalFilename}{" "}
                            <span className="font-normal text-muted-foreground">
                              • version {doc.version} ({(doc.sizeBytes / 1024).toFixed(0)} KB)
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-destructive font-medium flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" /> Mandatory document missing.
                        </div>
                      )}

                      {/* Bottom Line: Action Buttons or Status Summary with Clear Spacing & Divider */}
                      {canReviewDocument ? (
                        <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            Scrutiny required for this version
                          </span>
                          <div className="flex items-center gap-2 ml-auto">
                            <Button
                              size="sm"
                              className="h-8 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 gap-1.5 shadow-xs transition-colors"
                              disabled={busy}
                              onClick={() => handleOpenDocModal(doc, "verify", label)}
                              title="Verify document as compliant"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-md border-border/80 dark:border-border text-rose-700 dark:text-rose-400 bg-background hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/40 font-semibold text-xs px-3.5 gap-1.5 shadow-2xs transition-colors"
                              disabled={busy}
                              onClick={() => handleOpenDocModal(doc, "reject", label)}
                              title="Revert document with objection"
                            >
                              <RefreshCw className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                              Revert
                            </Button>
                          </div>
                        </div>
                      ) : isVerified ? (
                        <div className="mt-3.5 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-xs">
                              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                Certificate scrutinized and verified compliant
                              </p>
                              {doc.verificationComment && (
                                <p className="text-muted-foreground font-normal">
                                  — "{doc.verificationComment}"
                                </p>
                              )}
                            </div>
                          </div>
                          {permissions?.reviewDocuments && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 px-2.5 font-medium shrink-0 gap-1.5"
                              onClick={() => handleOpenDocModal(doc, "reject", label)}
                              title="Change scrutiny status to Revert"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                              Change to Revert
                            </Button>
                          )}
                        </div>
                      ) : isRejected ? (
                        <div className="mt-3.5 pt-3 border-t border-amber-200/80 dark:border-amber-800/60 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-xs">
                              <p className="font-semibold text-amber-900 dark:text-amber-300">
                                Certificate reverted with deficiency objection
                              </p>
                              {doc.verificationComment && (
                                <p className="text-amber-800/90 dark:text-amber-200/90 font-medium">
                                  Deficiency: "{doc.verificationComment}"
                                </p>
                              )}
                            </div>
                          </div>
                          {permissions?.reviewDocuments && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 px-2.5 font-medium shrink-0 gap-1.5"
                              onClick={() => handleOpenDocModal(doc, "verify", label)}
                              title="Change scrutiny status to Verify"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Change to Verify
                            </Button>
                          )}
                        </div>
                      ) : permissions?.startDcReview ? (
                        <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-between gap-3 flex-wrap text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            Awaiting DC Scrutiny
                          </span>
                          <button
                            type="button"
                            onClick={handleStartDcScrutiny}
                            disabled={busy}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Click to start scrutiny & verify
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-between w-full text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            Awaiting DC Scrutiny review
                          </span>
                          <span className="text-[11px] text-muted-foreground">Pending</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision & Action Workspace Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-heading font-bold text-lg">Departmental Scrutiny & Decision</h3>
                <p className="text-xs text-muted-foreground">
                  Record official review remarks and advance application through the two-step workflow
                </p>
              </div>

              {/* Decision Remarks Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Official Decision Remarks / Scrutiny Notes
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    auth.role === "admin"
                      ? "Executive approval or deficiency remarks (e.g. Official approval granted under Scheme Clause 4 / Deficiency notes)..."
                      : "Enter DC scrutiny notes, verified document checklist remarks, or grounds for deficiency / rejection..."
                  }
                  className="min-h-24 w-full rounded-xl border bg-background p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Status Advisory Messages & Action Buttons */}
              <div className="pt-2 space-y-4">
                {/* Under DC Review State */}
                {application.status === "UNDER_REVIEW" && (
                  <div className="space-y-3">
                    {hasRevertedDocs && (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 shadow-xs">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm">Document(s) Reverted with Objections — Approval Blocked</p>
                          <p className="mt-1 leading-relaxed text-muted-foreground">
                            One or more certificates have been reverted for correction. This application <b>cannot proceed to SCoT (EV) approval</b> until rectified. Please click <b>Revert Application (Raise Deficiency)</b> to return the file to the operator for document re-upload, or <b>Reject Application</b> if fundamentally ineligible.
                          </p>
                        </div>
                      </div>
                    )}

                    {!allDocumentsVerified && !hasRevertedDocs && (
                      <div className="flex items-start gap-3 rounded-xl border border-blue-300 bg-blue-50 p-4 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                        <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm">DC Scrutiny In Progress ({verifiedDocsCount} of 4 Documents Verified)</p>
                          <p className="mt-0.5 leading-relaxed text-muted-foreground">
                            Please scrutinize and click <b>Verify current version</b> on all 4 submitted certificates above before recommending this application for SCoT (EV) operating licence approval.
                          </p>
                        </div>
                      </div>
                    )}

                    {allDocumentsVerified && (
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm">All 4 Documents Successfully Verified!</p>
                          <p className="mt-0.5 leading-relaxed text-muted-foreground">
                            DC scrutiny requirements are complete. Enter your scrutiny remarks above and click <b>Complete DC Scrutiny & Recommend to SCoT (EV)</b>.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        variant="default"
                        size="lg"
                        disabled={!allDocumentsVerified || !reason.trim() || busy}
                        onClick={() => handleRequestAction("dc-approve")}
                        className="font-semibold shadow-sm gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete DC Scrutiny & Recommend to SCoT (EV)
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        disabled={!reason.trim() || busy}
                        onClick={() => handleRequestAction("deficiency")}
                        className="border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Revert Application (Raise Deficiency)
                      </Button>

                      <Button
                        variant="destructive"
                        size="lg"
                        disabled={!reason.trim() || busy}
                        onClick={() => handleRequestAction("dc-reject")}
                        className="font-semibold gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject (Refer to Appellate)
                      </Button>
                    </div>
                  </div>
                )}

                {/* DC Approved -> Awaiting SCoT EV Sign-off */}
                {application.status === "DC_APPROVED" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        Step 1 DC Scrutiny Complete • Ready for SCoT (EV) Approval
                      </div>
                      <p className="mt-1 leading-relaxed text-muted-foreground">
                        The Deputy Commissioner has scrutinized and verified all 4 mandatory documents and bank guarantee. The file is awaiting SCoT (EV) operating licence approval.
                      </p>
                    </div>

                    {auth.role === "admin" && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="default"
                          size="lg"
                          disabled={busy}
                          onClick={() => handleRequestAction("issue-license")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-2"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Grant SCoT (EV) Approval & Issue 5-Year Licence
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          disabled={!reason.trim() || busy}
                          onClick={() => handleRequestAction("deficiency")}
                          className="border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold"
                        >
                          Revert for Deficiency
                        </Button>

                        <Button
                          variant="destructive"
                          size="lg"
                          disabled={!reason.trim() || busy}
                          onClick={() => handleRequestAction("dc-reject")}
                          className="font-semibold"
                        >
                          Reject Application
                        </Button>
                      </div>
                    )}

                    {auth.role !== "admin" && (
                      <p className="text-xs text-muted-foreground">
                        Logged in as DC Officer. This file has been forwarded to SCoT (EV) for licence grant.
                      </p>
                    )}
                  </div>
                )}

                {/* 5-Year Licence Issued */}
                {isLicenseIssued && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white">
                        <BadgeCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">5-Year Operating Licence Issued & Active</h4>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Application scrutiny is complete. This file is preserved as an official record.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Full View Modal Dialog */}
      {preview && (
        <DocumentPreviewModal
          applicationId={application.id}
          document={preview}
          canReview={
            permissions?.reviewDocuments &&
            preview.currentVersion &&
            preview.verificationStatus === "PENDING"
          }
          onReview={(doc, actionName) => {
            const meta = docTypeMeta[doc.documentType];
            handleOpenDocModal(doc, actionName, meta?.label || doc.documentType);
          }}
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
              docId: scrutinyModalData.documentId,
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
            action.mutate(confirmData.action);
          }
        }}
        onClose={() => setConfirmData(null)}
      />
    </DashboardLayout>
  );
}

