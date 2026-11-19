import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BadgeCheck, Building2, Check, Clock, CreditCard, Download, FileCheck2, FileText, IndianRupee, Landmark, Loader2, Receipt, RefreshCw, Send, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/services/api";
import {
  appealApplication,
  downloadDocument,
  listDocuments,
  listLicenses,
  listMyApplications,
  submitApplication,
  updateApplication,
  uploadDocument,
  type DocumentType,
  type RegistrationApplication,
} from "@/services/registrationService";

const documentTypes: Array<[DocumentType, string]> = [
  ["COMPANY_REGISTRATION", "Company Registration"],
  ["GST_CERTIFICATE", "GST Certificate"],
  ["PAN_CERTIFICATE", "PAN Certificate"],
  ["BANK_GUARANTEE", "Bank Guarantee"],
];

const applicantDocMeta: Record<
  DocumentType,
  { label: string; icon: any; bg: string }
> = {
  COMPANY_REGISTRATION: {
    label: "Company Registration",
    icon: Building2,
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  GST_CERTIFICATE: {
    label: "GST Certificate",
    icon: IndianRupee,
  bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  PAN_CERTIFICATE: {
    label: "PAN Certificate",
    icon: CreditCard,
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  BANK_GUARANTEE: {
    label: "Bank Guarantee",
    icon: Landmark,
     bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
};

// const applicantDocMeta: Record<
//   DocumentType,
//   { label: string; icon: any; bg: string }
// > = {
//   COMPANY_REGISTRATION: {
//     label: "Company Registration",
//     icon: Building2,
//     bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
//   },
//   GST_CERTIFICATE: {
//     label: "GST Certificate",
//     icon: Receipt,
//     bg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
//   },
//   PAN_CERTIFICATE: {
//     label: "PAN Certificate",
//     icon: CreditCard,
//     bg: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
//   },
//   BANK_GUARANTEE: {
//     label: "Bank Guarantee",
//     icon: ShieldCheck,
//     bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
//   },
// };

function ApplicationCard({
  application,
}: {
  application: RegistrationApplication;
}) {
  const client = useQueryClient();
  const [appealReason, setAppealReason] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [details, setDetails] = useState({
    companyName: application.companyName,
    registrationNumber: application.registrationNumber,
    registeredAddress: application.registeredAddress,
    contactName: application.contactName,
    contactPhone: application.contactPhone,
    contactEmail: application.contactEmail,
    declaredFleetSize: application.declaredFleetSize,
    officeInNcr: application.officeInNcr,
    branchOfficeAddress: application.branchOfficeAddress,
    complianceOfficerName: application.complianceOfficerName,
    complianceOfficerDesignation: application.complianceOfficerDesignation,
    complianceOfficerPhone: application.complianceOfficerPhone,
    complianceOfficerEmail: application.complianceOfficerEmail,
    bankGuaranteeNumber: application.bankGuaranteeNumber,
    bankGuaranteeBank: application.bankGuaranteeBank,
    bankGuaranteeAmount: application.bankGuaranteeAmount,
    bankGuaranteeValidUntil: application.bankGuaranteeValidUntil,
    bankGuaranteeBeneficiary: application.bankGuaranteeBeneficiary,
  });
  const documents = useQuery({
    queryKey: ["application-documents", application.id],
    queryFn: () => listDocuments(application.id),
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["my-applications"] });
    void client.invalidateQueries({
      queryKey: ["application-documents", application.id],
    });
  };
  const upload = useMutation({
    mutationFn: ({ type, file }: { type: DocumentType; file: File }) =>
      uploadDocument(application.id, type, file),
    onSuccess: () => {
      toast.success("Replacement document uploaded");
      refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const submit = useMutation({
    mutationFn: () => submitApplication(application.id),
    onSuccess: () => {
      toast.success("Application submitted for review");
      refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const save = useMutation({
    mutationFn: () =>
      updateApplication(application.id, {
        ...details,
        organizationType: application.organizationType,
        categories: application.categories,
      }),
    onSuccess: () => {
      toast.success("Application details saved");
      refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const appeal = useMutation({
    mutationFn: () => appealApplication(application.id, appealReason),
    onSuccess: () => {
      toast.success("Appeal submitted");
      setAppealReason("");
      refresh();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const handleDownload = async (doc: ApplicationDocument) => {
    try {
      await downloadDocument(application.id, doc);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to download document."));
    }
  };
  const editable =
    application.status === "DRAFT" ||
    application.status === "DEFICIENCY_RAISED";

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

  const revertedDocs = (documents.data ?? []).filter(
    (d) => d.verificationStatus === "REJECTED" && d.currentVersion
  );
  const hasRevertedDocs = revertedDocs.length > 0;

  const missingDocuments = documentTypes.filter(
    ([type]) => !documents.data?.some((d) => d.documentType === type && d.currentVersion)
  );

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono text-muted-foreground">
            {application.applicationNumber}
          </p>
          <h2 className="font-heading text-lg font-bold">
            {application.companyName}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Submitted{" "}
            {application.submittedAt
              ? new Date(application.submittedAt).toLocaleString()
              : "not yet"}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {application.status.replaceAll("_", " ")}
        </span>
      </div>

      {/* Delhi Government Two-Step Approval Flow: 1 ────── 2 ────── 3 */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Delhi Govt Scrutiny Lifecycle
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border shadow-2xs ${
              step3Completed
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : step2Active
                  ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                  : isDeficiency || hasRevertedDocs
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
            ) : isDeficiency || hasRevertedDocs ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-700" />
                Action Required: Re-upload Reverted Document(s)
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
                      ? (isDeficiency || hasRevertedDocs)
                        ? "bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-950/60 animate-pulse border-2 border-amber-500"
                        : "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60 border-2 border-blue-500"
                      : "bg-muted text-muted-foreground border-2 border-border"
                }`}
              >
                {step1Completed ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (isDeficiency || hasRevertedDocs) ? (
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
                      : (isDeficiency || hasRevertedDocs)
                        ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                        : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                  }`}
                >
                  {step1Completed ? (
                    <>
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Certificates & BG Verified
                    </>
                  ) : (isDeficiency || hasRevertedDocs) ? (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      Re-upload Required
                    </>
                  ) : (
                    "In Scrutiny"
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
                  {isAppellateFlow ? "3. Appellate Order" : "3. 5-Year Licence"}
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

      {/* Deficiency / Revert Alert Banner */}
      {(hasRevertedDocs || isDeficiency) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Action Required: Document(s) Reverted with Deficiency Objections</p>
            <p className="leading-relaxed text-muted-foreground">
              The Scrutiny Officer has raised objections on your application submission. Please review the specific notes on the reverted certificates below, upload corrected replacement certificates, and click <b>Submit Corrected File for DC Re-scrutiny</b>.
            </p>
            {(application.reviewComment || application.decisionReason) && (
              <p className="mt-1.5 rounded-lg bg-amber-100/70 p-2 font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                <b>Officer's Scrutiny Remark:</b> "{application.reviewComment || application.decisionReason}"
              </p>
            )}
          </div>
        </div>
      )}

      {(application.reviewComment ||
        application.decisionReason ||
        application.appellateDecisionReason) && !hasRevertedDocs && !isDeficiency && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <b>Latest authority note</b>
          <p className="mt-1 text-muted-foreground">
            {application.appellateDecisionReason ??
              application.reviewComment ??
              application.decisionReason}
          </p>
        </div>
      )}
      {editable && (
        <details className="mt-4 rounded-lg border">
          <summary className="cursor-pointer p-3 text-sm font-semibold">
            Edit organisation, compliance and guarantee details
          </summary>
          <div className="grid gap-3 border-t p-3 sm:grid-cols-2">
            <Input
              value={details.companyName}
              onChange={(event) =>
                setDetails({ ...details, companyName: event.target.value })
              }
              placeholder="Company name"
            />
            <Input
              value={details.registrationNumber}
              onChange={(event) =>
                setDetails({
                  ...details,
                  registrationNumber: event.target.value,
                })
              }
              placeholder="Registration number"
            />
            <Input
              className="sm:col-span-2"
              value={details.registeredAddress}
              onChange={(event) =>
                setDetails({
                  ...details,
                  registeredAddress: event.target.value,
                })
              }
              placeholder="Registered address"
            />
            <Input
              value={details.contactName}
              onChange={(event) =>
                setDetails({ ...details, contactName: event.target.value })
              }
              placeholder="Contact name"
            />
            <Input
              value={details.contactPhone}
              onChange={(event) =>
                setDetails({
                  ...details,
                  contactPhone: event.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="Contact phone"
            />
            <Input
              type="email"
              value={details.contactEmail}
              onChange={(event) =>
                setDetails({ ...details, contactEmail: event.target.value })
              }
              placeholder="Contact email"
            />
            <Input
              type="number"
              min={26}
              value={details.declaredFleetSize}
              onChange={(event) =>
                setDetails({
                  ...details,
                  declaredFleetSize: Number(event.target.value),
                })
              }
            />
            <Input
              value={details.branchOfficeAddress}
              onChange={(event) =>
                setDetails({
                  ...details,
                  branchOfficeAddress: event.target.value,
                })
              }
              placeholder="NCR branch office address"
            />
            <Input
              value={details.complianceOfficerName}
              onChange={(event) =>
                setDetails({
                  ...details,
                  complianceOfficerName: event.target.value,
                })
              }
              placeholder="Compliance officer"
            />
            <Input
              value={details.complianceOfficerDesignation}
              onChange={(event) =>
                setDetails({
                  ...details,
                  complianceOfficerDesignation: event.target.value,
                })
              }
              placeholder="Officer designation"
            />
            <Input
              value={details.complianceOfficerPhone}
              onChange={(event) =>
                setDetails({
                  ...details,
                  complianceOfficerPhone: event.target.value.replace(/\D/g, ""),
                })
              }
              placeholder="Officer phone"
            />
            <Input
              type="email"
              value={details.complianceOfficerEmail}
              onChange={(event) =>
                setDetails({
                  ...details,
                  complianceOfficerEmail: event.target.value,
                })
              }
              placeholder="Officer email"
            />
            <Input
              value={details.bankGuaranteeNumber}
              onChange={(event) =>
                setDetails({
                  ...details,
                  bankGuaranteeNumber: event.target.value,
                })
              }
              placeholder="Guarantee number"
            />
            <Input
              value={details.bankGuaranteeBank}
              onChange={(event) =>
                setDetails({
                  ...details,
                  bankGuaranteeBank: event.target.value,
                })
              }
              placeholder="Issuing bank"
            />
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={details.bankGuaranteeAmount}
              onChange={(event) =>
                setDetails({
                  ...details,
                  bankGuaranteeAmount: Number(event.target.value),
                })
              }
            />
            <Input
              type="date"
              value={details.bankGuaranteeValidUntil}
              onChange={(event) =>
                setDetails({
                  ...details,
                  bankGuaranteeValidUntil: event.target.value,
                })
              }
            />
            <label className="sm:col-span-2 flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={details.officeInNcr}
                onChange={(event) =>
                  setDetails({ ...details, officeInNcr: event.target.checked })
                }
              />
              Office is within NCR
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <Button
                variant="outline"
                onClick={() => save.mutate()}
                disabled={save.isPending}
              >
                <SaveIcon />
                Save details
              </Button>
            </div>
          </div>
        </details>
      )}
      <div className="mt-4 grid gap-3 rounded-lg border bg-muted/20 p-3 text-xs sm:grid-cols-2">
        <p>
          <b>NCR office:</b> {application.branchOfficeAddress}
        </p>
        <p>
          <b>Compliance officer:</b> {application.complianceOfficerName} ·{" "}
          {application.complianceOfficerDesignation}
        </p>
        <p>
          <b>Bank guarantee:</b> {application.bankGuaranteeNumber} · ₹
          {application.bankGuaranteeAmount}
        </p>
        <p>
          <b>Valid until:</b> {application.bankGuaranteeValidUntil}
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {documentTypes.map(([type, label]) => {
          const latest = documents.data?.find(
            (item) => item.documentType === type,
          );
          const isVerified = latest?.verificationStatus === "VERIFIED";
          const isReverted = latest?.verificationStatus === "REJECTED";
          const isPending = latest?.verificationStatus === "PENDING";
          const isMissing = !latest;
          const showMissingError = submitAttempted && isMissing;
          const canUpload = editable || isReverted;
          const docMeta = applicantDocMeta[type];
          const DocIcon = docMeta?.icon || FileText;

          return (
            <div
              key={type}
              className={`rounded-xl border p-3.5 transition-all ${
                isReverted
                  ? "border-amber-300 bg-amber-50/40 ring-1 ring-amber-300/50 dark:border-amber-800 dark:bg-amber-950/20"
                  : showMissingError
                    ? "border-destructive bg-destructive/5 ring-1 ring-destructive/40"
                    : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {/* Header row: Left has Icon + Label; Right has the Status Badge beside the Download button */}
              <div className="flex items-center justify-between gap-2 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`grid h-6 w-6 place-items-center rounded-md border ${
                      docMeta?.bg || "bg-muted text-muted-foreground border-border"
                    } shrink-0 shadow-2xs`}
                  >
                    <DocIcon className="h-3.5 w-3.5" />
                  </div>
                  <b className="text-xs font-semibold block truncate text-foreground">{label}</b>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                      <BadgeCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      VERIFIED
                    </span>
                  ) : isReverted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">
                      <RefreshCw className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                      REVERTED
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                      <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      PENDING REVIEW
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                      MISSING
                    </span>
                  )}

                  {latest && (
                    <button
                      aria-label={`Download ${label}`}
                      onClick={() =>
                        void handleDownload(latest)
                      }
                      className="rounded-lg border p-1 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 transition-colors"
                      title="Download document file"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Body: file details + scrutiny note */}
              <div className="pt-2">
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground font-mono">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {latest?.originalFilename ?? "Not uploaded"}{" "}
                    {latest ? `· v${latest.version}` : ""}
                  </span>
                </p>

                {latest?.verificationComment && (
                  <p className="mt-1.5 rounded-md bg-white-100/60 dark:bg-amber-900/30 p-1.5 text-[11px] text-amber-900 dark:text-amber-200">
                    <b>Scrutiny Note:</b> "{latest.verificationComment}"
                  </p>
                )}
              </div>

              {canUpload && (
                <div className="mt-3 border-t pt-2.5">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-amber-300/80 bg-amber-50 hover:bg-amber-100/80 dark:border-amber-800 dark:bg-amber-950/50 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 transition-colors shadow-2xs">
                    <RefreshCw className="h-3 w-3" />
                    {isReverted ? "Re-upload corrected certificate" : "Upload replacement"}
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) upload.mutate({ type, file });
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(editable || hasRevertedDocs) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          {submitAttempted && missingDocuments.length > 0 ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Please upload the {missingDocuments.length} missing document(s) highlighted above.
            </p>
          ) : <div />}
          <Button
            onClick={() => {
              setSubmitAttempted(true);
              if (missingDocuments.length > 0) {
                toast.error(
                  `Upload all 4 documents before submitting. Missing: ${missingDocuments.map(([_, l]) => l).join(", ")}`,
                );
                return;
              }
              submit.mutate();
            }}
            disabled={submit.isPending || upload.isPending}
            className="gap-2"
          >
            {submit.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {application.status === "DEFICIENCY_RAISED" || hasRevertedDocs
              ? "Submit Corrected File for DC Re-scrutiny"
              : "Submit for review"}
          </Button>
        </div>
      )}
      {application.status === "DC_REJECTED" && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-amber-700">
            Appeal must be filed by {new Date(new Date(application.updatedAt).getTime() + 30 * 86400000).toLocaleDateString()}.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={appealReason}
            onChange={(event) => setAppealReason(event.target.value)}
            placeholder="Grounds for appeal"
          />
          <Button
            onClick={() => appeal.mutate()}
            disabled={!appealReason.trim() || appeal.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            Appeal
          </Button>
          </div>
        </div>
      )}
    </article>
  );
}

function SaveIcon() {
  return <RefreshCw className="mr-2 h-4 w-4" />;
}

export default function Applications() {
  const applications = useQuery({
    queryKey: ["my-applications"],
    queryFn: listMyApplications,
  });
  const licenses = useQuery({
    queryKey: ["my-licenses"],
    queryFn: listLicenses,
  });
  const applicationPages = useClientPagination(applications.data ?? []);
  const licensePages = useClientPagination(licenses.data ?? []);
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">
          Licence applications
        </h1>
        <p className="text-sm text-muted-foreground">
          Track departmental review, correct deficiencies, replace documents and
          submit appeals.
        </p>
      </div>
      {applications.isError && (
        <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(applications.error)}
        </p>
      )}
      <div className="space-y-4">
        {applicationPages.pageItems.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
        {applications.data?.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8" />
            No applications found.
          </div>
        )}
      </div>
      <ListPagination page={applicationPages.page} pageSize={applicationPages.pageSize} totalItems={applicationPages.totalItems} onPageChange={applicationPages.setPage} />
      {licenses.data && licenses.data.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-bold">
            Issued licences
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {licensePages.pageItems.map((license) => (
              <div key={license.id} className="rounded-xl border bg-card p-4">
                <b>{license.licenseNumber}</b>
                <p className="mt-1 text-sm text-muted-foreground">
                  Valid {license.validFrom} to {license.validUntil}
                </p>
                <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                  {license.status}
                </span>
              </div>
            ))}
          </div>
          <ListPagination page={licensePages.page} pageSize={licensePages.pageSize} totalItems={licensePages.totalItems} onPageChange={licensePages.setPage} />
        </section>
      )}
    </DashboardLayout>
  );
}
