import api from "./api";

export interface ComplianceFinding {
  id: string;
  subjectType: string;
  subjectId: string;
	subjectLabel: string;
	operatorName: string;
	code: string;
  severity: string;
	message: string;
	action: string;
  detectedAt: string;
}

export interface ComplianceRun {
  id: string;
  triggerType: string;
  status: string;
  subjectsChecked: number;
  findingsCreated: number;
  subjectsOffboarded: number;
  startedAt: string;
  completedAt: string;
}

export const getComplianceFindings = async (): Promise<ComplianceFinding[]> =>
  (await api.get("/compliance/findings")).data;
export const runCompliance = async (): Promise<ComplianceRun> =>
  (await api.post("/compliance/runs")).data;
