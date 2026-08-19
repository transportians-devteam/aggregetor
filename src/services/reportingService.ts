import api from "./api";

export interface GovernmentMis {
  activeLicenses: number;
  activeVehicles: number;
  offboardedVehicles: number;
  activeDrivers: number;
  offboardedDrivers: number;
  trips: number;
}

export interface MisPage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface MisVehicle {
  id: string;
  ownerUserId: number;
  operatorName: string;
  registrationNumber: string;
	stateCode: string | null;
  category: string;
  status: string;
  electric: boolean | null;
  registrationValidUntil: string | null;
  pucValidUntil: string | null;
  insuranceValidUntil: string | null;
	fitnessValidUntil: string | null;
	taxValidUntil: string | null;
	permitValidUntil: string | null;
  challanClear: boolean | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface MisDriver {
  id: string;
  ownerUserId: number;
  operatorName: string;
  licenseNumber: string;
  driverName: string | null;
  licenseValidUntil: string | null;
  psvBadgeNumber: string | null;
  psvBadgeValidUntil: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface MisTrip {
  id: string;
  ownerUserId: number;
  operatorName: string;
  tripId: string;
  vehicleRegistration: string;
  driverLicense: string;
  driverName: string | null;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  distanceKm: number;
  fareAmount: number;
  driverRating: number | null;
}
export interface MisLicense {
  id: string;
  applicationId: string;
  holderUserId: number;
  operatorName: string;
  licenseNumber: string;
  issuedOn: string;
  validFrom: string;
  validUntil: string;
  status: string;
  createdAt: string;
}

export interface Utilization {
  subjectId: string;
  subjectLabel: string;
  tripCount: number;
  distanceKm: number;
  revenue: number;
  averageRating: number | null;
}

export interface TripImport {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  createdAt: string;
  completedAt: string | null;
  rows: Array<{
    rowNumber: number;
    tripId: string;
    status: string;
    recordId: string | null;
    message: string | null;
  }>;
}

export const getGovernmentMis = async (
  from: string,
  to: string,
): Promise<GovernmentMis> =>
  (await api.get("/reports/mis", { params: { from, to } })).data;
const misParams = (from: string, to: string, page: number, size: number) => ({
  from,
  to,
  page,
  size,
});
export const getGovernmentMisVehicles = async (
  from: string,
  to: string,
  page = 0,
  size = 20,
): Promise<MisPage<MisVehicle>> =>
  (
    await api.get("/reports/mis/vehicles", {
      params: misParams(from, to, page, size),
    })
  ).data;
export const getGovernmentMisDrivers = async (
  from: string,
  to: string,
  page = 0,
  size = 20,
): Promise<MisPage<MisDriver>> =>
  (
    await api.get("/reports/mis/drivers", {
      params: misParams(from, to, page, size),
    })
  ).data;
export const getGovernmentMisTrips = async (
  from: string,
  to: string,
  page = 0,
  size = 20,
): Promise<MisPage<MisTrip>> =>
  (
    await api.get("/reports/mis/trips", {
      params: misParams(from, to, page, size),
    })
  ).data;
export const getGovernmentMisLicenses = async (
  from: string,
  to: string,
  page = 0,
  size = 20,
): Promise<MisPage<MisLicense>> =>
  (
    await api.get("/reports/mis/licenses", {
      params: misParams(from, to, page, size),
    })
  ).data;
export const getVehicleUtilization = async (
  from: string,
  to: string,
): Promise<Utilization[]> =>
  (await api.get("/reports/vehicle-utilization", { params: { from, to } }))
    .data;
export const getDriverPerformance = async (
  from: string,
  to: string,
): Promise<Utilization[]> =>
  (await api.get("/reports/driver-performance", { params: { from, to } })).data;
export const importTrips = async (file: File): Promise<TripImport> => {
  const body = new FormData();
  body.append("file", file);
  return (await api.post("/reports/trip-imports", body)).data;
};
export const getTripImport = async (id: string): Promise<TripImport> =>
  (await api.get(`/reports/trip-imports/${id}`)).data;
