import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  ["COMPANY_REGISTRATION", "Company registration"],
  ["GST_CERTIFICATE", "GST certificate"],
  ["PAN_CERTIFICATE", "PAN certificate"],
  ["BANK_GUARANTEE", "Bank guarantee"],
];

function ApplicationCard({
  application,
}: {
  application: RegistrationApplication;
}) {
  const client = useQueryClient();
  const [appealReason, setAppealReason] = useState("");
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
  const editable =
    application.status === "DRAFT" ||
    application.status === "DEFICIENCY_RAISED";

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {application.applicationNumber}
          </p>
          <h2 className="font-heading text-lg font-bold">
            {application.companyName}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
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
      {(application.reviewComment ||
        application.decisionReason ||
        application.appellateDecisionReason) && (
        <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
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
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {documentTypes.map(([type, label]) => {
          const latest = documents.data?.find(
            (item) => item.documentType === type,
          );
          return (
            <div key={type} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <b className="text-xs">{label}</b>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {latest?.originalFilename ?? "Not uploaded"}{" "}
                    {latest ? `· v${latest.version}` : ""}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    {latest?.verificationStatus ?? "MISSING"}
                  </p>
                </div>
                {latest && (
                  <button
                    aria-label={`Download ${label}`}
                    onClick={() =>
                      void downloadDocument(application.id, latest)
                    }
                    className="rounded p-1 text-primary hover:bg-primary/10"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
              {editable && (
                <label className="mt-2 block cursor-pointer text-xs font-medium text-primary">
                  <RefreshCw className="mr-1 inline h-3 w-3" />
                  Upload replacement
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
              )}
            </div>
          );
        })}
      </div>
      {editable && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || upload.isPending}
          >
            {submit.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit for review
          </Button>
        </div>
      )}
      {application.status === "DC_REJECTED" && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
        {applications.data?.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
        {applications.data?.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8" />
            No applications found.
          </div>
        )}
      </div>
      {licenses.data && licenses.data.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-bold">
            Issued licences
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {licenses.data.map((license) => (
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
        </section>
      )}
    </DashboardLayout>
  );
}
