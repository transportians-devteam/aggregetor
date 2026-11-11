import api from "./api";

export type VehicleCategory = "2W" | "3W" | "4W";

export interface FleetVehicle {
  id: string;
  registrationNumber: string;
  category: VehicleCategory;
  status: string;
  registrationValidUntil: string | null;
  vahanRegistrationDate: string | null;
  pucValidUntil: string | null;
  insuranceValidUntil: string | null;
	fitnessValidUntil: string | null;
	taxValidUntil: string | null;
	permitValidUntil: string | null;
  challanClear: boolean | null;
  electric: boolean | null;
  outstandingChallanAmount: number | null;
  challanIntimatedOn: string | null;
  vahanRegistrationStatus: string | null;
	vahanStateCode: string | null;
  vahanVehicleClass: string | null;
  vahanFuelType: string | null;
  vahanSource: "VAHAN" | "LEGACY" | string | null;
  vahanCheckedAt: string | null;
  lastComplianceCheckedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  declarationPeriodStart: string;
  declarationPeriodEnd: string;
}

export interface FleetDeclarationWindow {
  periodStart: string;
  periodEnd: string;
  totalVehicles: number;
  activeVehicles: number;
  awaitingFunding: number;
  offboardedVehicles: number;
  declaredFleetSize: number;
  onboardedAgainstDeclaration: number;
  paidAndOnboardedVehicles: number;
  awaitingPaymentAgainstDeclaration: number;
  remainingDeclarationCapacity: number;
  evPercentage: number;
  requiredEvPercentage: number;
  evTargetMet: boolean;
  status: string;
}

export interface VahanIntegrationStatus {
  source: string;
  live: boolean;
  configured: boolean;
}

export interface VehicleImportJob {
  id: string;
  sourceFilename: string;
  status: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  processedRows: number;
  rowsPerSecond: number;
  estimatedSecondsRemaining: number | null;
  elapsedSeconds?: number;
  duration?: string;
  rows?: Array<{
    rowNumber: number;
    registrationNumber: string;
    category: string;
    status: string;
    vehicleId: string | null;
    message: string;
  }>;
}

export const onboardVehicle = async (
  registrationNumber: string,
  category: VehicleCategory,
): Promise<FleetVehicle> =>
  (await api.post("/fleet/vehicles", { registrationNumber, category })).data;

export const getMyVehicles = async (): Promise<FleetVehicle[]> =>
  (await api.get("/fleet/vehicles")).data;
export const recheckVehicleVahan = async (
  vehicleId: string,
): Promise<FleetVehicle> =>
  (await api.post(`/fleet/vehicles/${vehicleId}/recheck-vahan`)).data;
export const getCurrentFleetDeclaration =
  async (): Promise<FleetDeclarationWindow> =>
    (await api.get("/fleet/vehicles/declaration-window")).data;
export const getVahanIntegrationStatus =
  async (): Promise<VahanIntegrationStatus> =>
    (await api.get("/fleet/vehicles/vahan-status")).data;

export const importVehicles = async (file: File): Promise<VehicleImportJob> => {
  const body = new FormData();
  body.append("file", file);
  return (await api.post("/fleet/vehicle-imports", body)).data;
};

export const getVehicleImport = async (id: string): Promise<VehicleImportJob> =>
  (await api.get(`/fleet/vehicle-imports/${id}`)).data;
