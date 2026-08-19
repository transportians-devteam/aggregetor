import api from "./api";

export interface FleetDriver {
  id: string;
  licenseNumber: string;
  driverName: string | null;
  licenseValidUntil: string | null;
  psvBadgeNumber: string | null;
  psvBadgeValidUntil: string | null;
  status: string;
  rejectionReason: string | null;
}

export interface DriverImportJob {
  id: string;
  fileName: string;
  status: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
}

export const onboardDriver = async (
  licenseNumber: string,
): Promise<FleetDriver> =>
  (await api.post("/fleet/drivers", { licenseNumber })).data;

export const getMyDrivers = async (): Promise<FleetDriver[]> =>
  (await api.get("/fleet/drivers")).data;

export const importDrivers = async (file: File): Promise<DriverImportJob> => {
  const body = new FormData();
  body.append("file", file);
  return (await api.post("/fleet/driver-imports", body)).data;
};

export const getDriverImport = async (id: string): Promise<DriverImportJob> =>
  (await api.get(`/fleet/driver-imports/${id}`)).data;
