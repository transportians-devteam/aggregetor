import api from "./api";

export type OrganizationType = "AGGREGATOR" | "DSP" | "E_COMMERCE";
export type DocumentType =
  | "COMPANY_REGISTRATION"
  | "GST_CERTIFICATE"
  | "PAN_CERTIFICATE"
  | "BANK_GUARANTEE";
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DEFICIENCY_RAISED"
  | "DC_APPROVED"
  | "APPELLATE_REVIEW_PENDING"
  | "DC_REJECTED"
  | "APPEAL_SUBMITTED"
  | "UNDER_APPELLATE_REVIEW"
  | "APPELLATE_APPROVED"
  | "APPELLATE_REJECTED"
  | "LICENSE_ISSUED";

export interface RegistrationApplicationRequest {
  organizationType: OrganizationType;
  companyName: string;
  registrationNumber: string;
  registeredAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  declaredFleetSize: number;
  categories: string[];
  officeInNcr: boolean;
  branchOfficeAddress: string;
  complianceOfficerName: string;
  complianceOfficerDesignation: string;
  complianceOfficerPhone: string;
  complianceOfficerEmail: string;
  bankGuaranteeNumber: string;
  bankGuaranteeBank: string;
  bankGuaranteeAmount: number;
  bankGuaranteeValidUntil: string;
  bankGuaranteeBeneficiary: string;
}

export interface RegistrationApplication extends RegistrationApplicationRequest {
  id: string;
  applicationNumber: string;
  applicantUserId: number;
  status: ApplicationStatus;
  reviewComment: string | null;
  decisionReason: string | null;
  assignedOfficerUserId: number | null;
  appealReason: string | null;
  appealSubmittedAt: string | null;
  assignedAppellateUserId: number | null;
  appellateDecisionReason: string | null;
  appellateDecidedAt: string | null;
  licenseIssuedAt: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export interface ApplicationDocument {
  id: string;
  documentType: DocumentType;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  verificationStatus: string;
  verificationComment: string | null;
  version: number;
  uploadedAt: string;
  verifiedAt: string | null;
  currentVersion: boolean;
  replacementUpload: boolean;
  superseded: boolean;
}

export interface RegistrationLicense {
  id: string;
  applicationId: string;
  aggregatorId: number;
  licenseNumber: string;
  issuedOn: string;
  validFrom: string;
  validUntil: string;
  status: string;
  createdAt: string;
}

export const createApplication = async (
  request: RegistrationApplicationRequest,
): Promise<RegistrationApplication> =>
  (await api.post("/registration/applications", request)).data;
export const listMyApplications = async (): Promise<
  RegistrationApplication[]
> => (await api.get("/registration/applications")).data;
export const getApplication = async (
  id: string,
): Promise<RegistrationApplication> =>
  (await api.get(`/registration/applications/${id}`)).data;
export const updateApplication = async (
  id: string,
  request: RegistrationApplicationRequest,
): Promise<RegistrationApplication> =>
  (await api.put(`/registration/applications/${id}`, request)).data;
export const submitApplication = async (
  id: string,
): Promise<RegistrationApplication> =>
  (await api.post(`/registration/applications/${id}/submit`)).data;
export const appealApplication = async (
  id: string,
  reason: string,
): Promise<RegistrationApplication> =>
  (await api.post(`/registration/applications/${id}/appeal`, { reason })).data;
export const uploadDocument = async (
  id: string,
  type: DocumentType,
  file: File,
): Promise<ApplicationDocument> => {
  const body = new FormData();
  body.append("file", file);
  return (
    await api.post(`/registration/applications/${id}/documents`, body, {
      params: { documentType: type },
    })
  ).data;
};
export const listDocuments = async (
  id: string,
): Promise<ApplicationDocument[]> =>
  (await api.get(`/registration/applications/${id}/documents`)).data;
export const downloadDocument = async (
  applicationId: string,
  document: ApplicationDocument,
): Promise<void> => {
  const response = await api.get(
    `/registration/applications/${applicationId}/documents/${document.id}/content`,
    { responseType: "blob" },
  );
  const url = URL.createObjectURL(response.data);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = document.originalFilename;
  link.click();
  URL.revokeObjectURL(url);
};
export const getDocumentContent = async (
  applicationId: string,
  documentId: string,
): Promise<Blob> =>
  (
    await api.get(
      `/registration/applications/${applicationId}/documents/${documentId}/content`,
      { responseType: "blob" },
    )
  ).data;

export const listApplicationsForReview = async (
  status?: string,
): Promise<RegistrationApplication[]> =>
  (
    await api.get("/admin/registration-applications", {
      params: status ? { status } : undefined,
    })
  ).data;
export const startReview = async (
  id: string,
): Promise<RegistrationApplication> =>
  (await api.post(`/admin/registration-applications/${id}/start-review`)).data;
export const decideApplication = async (
  id: string,
  action: "approve" | "reject" | "deficiency",
  reason: string,
): Promise<RegistrationApplication> =>
  (
    await api.post(`/admin/registration-applications/${id}/${action}`, {
      reason,
    })
  ).data;
export const reviewDocument = async (
  applicationId: string,
  documentId: string,
  action: "verify" | "reject",
  comment: string,
): Promise<ApplicationDocument> =>
  (
    await api.post(
      `/admin/registration-applications/${applicationId}/documents/${documentId}/${action}`,
      { comment },
    )
  ).data;

export const listAppellateApplications = async (): Promise<
  RegistrationApplication[]
> => (await api.get("/appellate/registration-applications")).data;
export const startAppellateReview = async (
  id: string,
): Promise<RegistrationApplication> =>
  (await api.post(`/appellate/registration-applications/${id}/start-review`))
    .data;
export const decideAppellateApplication = async (
  id: string,
  action: "approve" | "reject",
  reason: string,
): Promise<RegistrationApplication> =>
  (
    await api.post(`/appellate/registration-applications/${id}/${action}`, {
      reason,
    })
  ).data;
export const issueLicense = async (id: string) =>
  (await api.post(`/admin/registration-applications/${id}/license`)).data;
export const listLicenses = async (): Promise<RegistrationLicense[]> =>
  (await api.get("/licenses")).data;
