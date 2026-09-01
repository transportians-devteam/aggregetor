import api from "./api";

export interface OperatorDashboard {
  applicationStatus: string | null;
  licenseNumber: string | null;
  licenseStatus: string | null;
  licenseValidUntil: string | null;
  vehicles: Record<string, number>;
  drivers: Record<string, number>;
  electricVehicles: number;
  criticalComplianceAlerts: number;
  openEnforcementCases: number;
  unreadNotifications: number;
  declaredFleetSize: number;
  fleetCapacityUsed: number;
  paymentPendingVehicles: number;
  paidAndOnboardedVehicles: number;
  remainingFleetCapacity: number;
  bankGuaranteeAmount: number;
  bankGuaranteeValidUntil: string | null;
  walletAvailableBalance: number;
  walletHeldBalance: number;
}

export const getDashboard = async (): Promise<OperatorDashboard> =>
  (await api.get("/dashboard")).data;
