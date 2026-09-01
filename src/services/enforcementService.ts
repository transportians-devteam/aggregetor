import api from "./api";

export interface EnforcementCase {
  id: string;
  caseNumber: string;
  ownerUserId: number;
  source: string;
  sourceReference: string | null;
  violationCode: string;
  description: string;
  status: string;
  createdAt: string;
  restorationReport: string | null;
  form4Undertaking: string | null;
  restorationSubmittedAt: string | null;
  penalty: null | {
    id: string;
    type: "MONETARY" | "NON_MONETARY";
    amount: number | null;
    instruction: string | null;
    dueDate: string;
    status: string;
    complianceResponse: string | null;
  };
  actions: Array<{
    id: string;
    type: string;
    status: string;
    reason: string;
    effectiveFrom: string;
    effectiveUntil: string | null;
  }>;
  appeal: null | {
    id: string;
    grounds: string;
    status: string;
    reviewerUserId: number | null;
    decisionReason: string | null;
    submittedAt: string;
    decidedAt: string | null;
  };
}

export const listEnforcementCases = async (): Promise<EnforcementCase[]> =>
  (await api.get("/enforcement/cases")).data;
export const openCase = async (request: {
  ownerUserId: number;
  source: string;
  sourceReference?: string;
  violationCode: string;
  description: string;
}): Promise<EnforcementCase> =>
  (await api.post("/admin/enforcement/cases", request)).data;
export const issuePenalty = async (
  caseId: string,
  request: {
    type: "MONETARY" | "NON_MONETARY";
    amount?: number;
    instruction?: string;
    dueDate: string;
  },
): Promise<EnforcementCase> =>
  (await api.post(`/admin/enforcement/cases/${caseId}/penalty`, request)).data;
export const issueShowCause = async (
  caseId: string,
  instruction: string,
): Promise<EnforcementCase> =>
  (
    await api.post(`/admin/enforcement/cases/${caseId}/show-cause`, {
      instruction,
    })
  ).data;
export const submitComplianceResponse = async (
  caseId: string,
  reason: string,
): Promise<EnforcementCase> =>
  (
    await api.post(`/enforcement/cases/${caseId}/compliance-response`, {
      reason,
    })
  ).data;
export const reviewComplianceResponse = async (
  caseId: string,
  satisfactory: boolean,
  reason: string,
  suspensionDays = 10,
): Promise<EnforcementCase> =>
  (
    await api.post(`/admin/enforcement/cases/${caseId}/compliance-review`, {
      satisfactory,
      reason,
      suspensionDays,
    })
  ).data;
export const submitRestorationReport = async (
  caseId: string,
  report: string,
  form4Undertaking: string,
): Promise<EnforcementCase> =>
  (
    await api.post(`/enforcement/cases/${caseId}/restoration-report`, {
      report,
      form4Undertaking,
    })
  ).data;
export const reviewRestorationReport = async (
  caseId: string,
  satisfactory: boolean,
  reason: string,
  extensionDays = 10,
): Promise<EnforcementCase> =>
  (
    await api.post(`/admin/enforcement/cases/${caseId}/restoration-review`, {
      satisfactory,
      reason,
      extensionDays,
    })
  ).data;
export const suspendLicense = async (
  caseId: string,
  days: number,
  reason: string,
): Promise<EnforcementCase> =>
  (
    await api.post(`/admin/enforcement/cases/${caseId}/suspension`, {
      days,
      reason,
    })
  ).data;
export const extendSuspension = async (
  caseId: string,
  days: number,
): Promise<EnforcementCase> =>
  (
    await api.post(`/admin/enforcement/cases/${caseId}/suspension-extension`, {
      days,
    })
  ).data;
export const cancelLicense = async (
  caseId: string,
  reason: string,
): Promise<EnforcementCase> =>
  (
    await api.post(`/admin/enforcement/cases/${caseId}/cancellation`, {
      reason,
    })
  ).data;
export const appealEnforcement = async (
  caseId: string,
  reason: string,
): Promise<EnforcementCase> =>
  (await api.post(`/enforcement/cases/${caseId}/appeal`, { reason })).data;
export const startEnforcementAppeal = async (
  caseId: string,
): Promise<EnforcementCase> =>
  (await api.post(`/appellate/enforcement/cases/${caseId}/start-review`)).data;
export const decideEnforcementAppeal = async (
  caseId: string,
  allowed: boolean,
  reason: string,
): Promise<EnforcementCase> =>
  (
    await api.post(`/appellate/enforcement/cases/${caseId}/decision`, {
      allowed,
      reason,
    })
  ).data;
