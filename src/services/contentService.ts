import api from "./api";

export type ContentSection =
  | "METRIC"
  | "SERVICE"
  | "NOTICE"
  | "MILESTONE"
  | "BENEFIT"
  | "FAQ"
  | "CONTACT";

export interface PortalContentItem {
  id: string;
  section: ContentSection;
  title: string;
  body: string | null;
  label: string | null;
  value: string | null;
  icon: string | null;
  sortOrder: number;
  active: boolean;
  updatedAt: string;
}

export interface EvAdoption {
  eligibleVehicles: number;
  electricVehicles: number;
  adoptionPercentage: number;
  calculatedAt: string;
}

export type PortalContentRequest = Omit<PortalContentItem, "id" | "updatedAt">;

export const listPublicContent = async (): Promise<PortalContentItem[]> =>
  (await api.get("/public/content")).data;
export const getPublicEvAdoption = async (): Promise<EvAdoption> =>
  (await api.get("/public/ev-adoption")).data;
export const listAllContent = async (): Promise<PortalContentItem[]> =>
  (await api.get("/admin/content")).data;
export const createContent = async (
  request: PortalContentRequest,
): Promise<PortalContentItem> =>
  (await api.post("/admin/content", request)).data;
export const updateContent = async (
  id: string,
  request: PortalContentRequest,
): Promise<PortalContentItem> =>
  (await api.put(`/admin/content/${id}`, request)).data;
export const deleteContent = async (id: string): Promise<void> => {
  await api.delete(`/admin/content/${id}`);
};
