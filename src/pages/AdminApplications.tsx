import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  History,
  Loader2,
  LockKeyhole,
  RefreshCw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ListPagination } from "@/components/ListPagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useAuth } from "@/contexts/AuthContext";
import {
  authorityApplicationMessage,
  getAuthorityApplicationActions,
} from "@/lib/applicationWorkflow";
import {
  decideApplication,
  decideAppellateApplication,
  downloadDocument,
  getDocumentContent,
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

type AuthorityAction =
  | "start-dc"
  | "start-appellate"
  | "deficiency"
  | "dc-approve"
  | "dc-reject"
  | "appellate-approve"
  | "appellate-reject";

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
            <p className="text-xs text-muted-foreground">
              {document.documentType.replaceAll("_", " ")} · version{" "}
              {document.version} · {document.verificationStatus}
            </p>
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
}: {
  application: RegistrationApplication;
}) {
  const { auth } = useAuth();
  const client = useQueryClient();
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<ApplicationDocument | null>(null);
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
  });
  const documentPages = useClientPagination(docs.data ?? []);
  const refresh = () => {
    setReason("");
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
    mutationFn: ({ id, name }: { id: string; name: "verify" | "reject" }) =>
      reviewDocument(
        application.id,
        id,
        name,
        reason ||
          `${name === "verify" ? "Verified" : "Rejected"} during review`,
      ),
    onSuccess: refresh,
  });
  const showReason =
    permissions.reviewDocuments ||
    permissions.decideDcReview ||
    permissions.decideAppellateReview;
  const busy = action.isPending || documentAction.isPending;
  const hasReplacements = docs.data?.some(
    (document) => document.replacementUpload && document.currentVersion,
  );

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="font-semibold">{application.companyName}</h2>
          <p className="text-sm text-muted-foreground">
            {application.applicationNumber} · {application.organizationType} ·
            fleet {application.declaredFleetSize}
          </p>
          {application.assignedAppellateUserId && (
            <p className="mt-1 text-xs text-muted-foreground">
              Assigned appellate authority #
              {application.assignedAppellateUserId}
            </p>
          )}
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          {application.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="mt-3 grid gap-2 rounded-lg border bg-muted/20 p-3 text-xs md:grid-cols-2">
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
          <b>Bank / validity:</b> {application.bankGuaranteeBank} ·{" "}
          {application.bankGuaranteeValidUntil}
        </p>
      </div>

      {hasReplacements && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <b>Updated documents detected.</b> The current replacement is
            highlighted below; previous versions remain available only for
            audit history.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-2 md:grid-cols-2">
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
                  ? "border-amber-300 bg-amber-50/70 ring-1 ring-amber-200"
                  : doc.superseded
                    ? "bg-muted/30 opacity-75"
                    : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 text-xs">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <b>{doc.documentType.replaceAll("_", " ")}</b>
                    {isUpdatedCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-900">
                        <RefreshCw className="h-3 w-3" />
                        UPDATED · CURRENT
                      </span>
                    )}
                    {doc.currentVersion && !doc.replacementUpload && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                        CURRENT
                      </span>
                    )}
                    {doc.superseded && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-600">
                        <History className="h-3 w-3" />
                        PREVIOUS VERSION
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block break-all text-muted-foreground">
                    {doc.originalFilename} · version {doc.version} ·{" "}
                    {doc.verificationStatus}
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
                    onClick={() => void downloadDocument(application.id, doc)}
                    className="rounded border bg-background p-1.5 hover:bg-muted"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                </span>
              </div>
              {canReviewDocument && (
                <div className="mt-3 flex justify-end gap-1 border-t pt-3">
                  <button
                    disabled={busy}
                    onClick={() =>
                      documentAction.mutate({ id: doc.id, name: "verify" })
                    }
                    className="rounded border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-emerald-50"
                  >
                    Verify current version
                  </button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      documentAction.mutate({ id: doc.id, name: "reject" })
                    }
                    className="rounded border bg-background px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                  >
                    Reject current version
                  </button>
                </div>
              )}
              {doc.superseded && (
                <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
                  Audit copy only — review actions apply to the current version.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <ListPagination page={documentPages.page} pageSize={documentPages.pageSize} totalItems={documentPages.totalItems} onPageChange={documentPages.setPage} />

      {showReason && (
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={
            permissions.reviewDocuments
              ? "Decision reason or document comment"
              : "Decision reason"
          }
          className="mt-4 min-h-20 w-full rounded-lg border bg-background p-3 text-sm"
        />
      )}

      {permissions.hasActions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {permissions.startDcReview && (
            <button
              disabled={busy}
              onClick={() => action.mutate("start-dc")}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Start departmental review
            </button>
          )}
          {permissions.startAppellateReview && (
            <button
              disabled={busy}
              onClick={() => action.mutate("start-appellate")}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Start appellate review
            </button>
          )}
          {permissions.decideDcReview && (
            <>
              <button
                disabled={!reason.trim() || busy}
                onClick={() => action.mutate("deficiency")}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Request correction
              </button>
              <button
                disabled={!reason.trim() || busy}
                onClick={() => action.mutate("dc-approve")}
                className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Approve and issue 5-year licence
              </button>
              <button
                disabled={!reason.trim() || busy}
                onClick={() => action.mutate("dc-reject")}
                className="rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground"
              >
                Reject and assign appellate authority
              </button>
            </>
          )}
          {permissions.decideAppellateReview && (
            <>
              <button
                disabled={!reason.trim() || busy}
                onClick={() => action.mutate("appellate-approve")}
                className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Allow and issue 5-year licence
              </button>
              <button
                disabled={!reason.trim() || busy}
                onClick={() => action.mutate("appellate-reject")}
                className="rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground"
              >
                Confirm rejection
              </button>
            </>
          )}
          {busy && (
            <span className="inline-flex items-center text-xs text-muted-foreground">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Updating…
            </span>
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <b className="text-xs">Read-only at this stage</b>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {authorityApplicationMessage(application.status)}
            </p>
          </div>
        </div>
      )}

      {application.status === "LICENSE_ISSUED" &&
        application.licenseIssuedAt && (
          <p className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Licence issued on{" "}
            {new Date(application.licenseIssuedAt).toLocaleString()}
          </p>
        )}
      {(application.status === "DEFICIENCY_RAISED" ||
        application.status === "APPELLATE_REVIEW_PENDING" ||
        application.status === "APPEAL_SUBMITTED") && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          This application remains visible for tracking.
        </p>
      )}
      {(action.isError || documentAction.isError || docs.isError) && (
        <p className="mt-3 text-sm text-destructive">
          {getErrorMessage(action.error || documentAction.error || docs.error)}
        </p>
      )}
      {preview && (
        <DocumentPreview
          applicationId={application.id}
          document={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </article>
  );
}

export default function AdminApplications() {
  const { auth } = useAuth();
  const appellateOnly = auth.role === "appellate_officer";
  const query = useQuery({
    queryKey: ["authority-applications", auth.role],
    queryFn: appellateOnly
      ? listAppellateApplications
      : () => listApplicationsForReview(),
  });
  const pages = useClientPagination(query.data ?? []);
  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold">
        {appellateOnly ? "Appellate applications" : "Licence applications"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {appellateOnly
          ? "Review applications currently assigned to the appellate workflow."
          : "Review applications only when their status and assignment permit an authority action."}
      </p>
      {query.isError && (
        <p className="mb-4 text-destructive">{getErrorMessage(query.error)}</p>
      )}
      <div className="space-y-4">
        {pages.pageItems.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
        {query.data?.length === 0 && (
          <p className="rounded-xl border p-8 text-center text-muted-foreground">
            No applications in this queue.
          </p>
        )}
      </div>
      <ListPagination page={pages.page} pageSize={pages.pageSize} totalItems={pages.totalItems} onPageChange={pages.setPage} />
    </DashboardLayout>
  );
}
