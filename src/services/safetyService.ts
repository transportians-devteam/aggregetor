import api from "./api";

export type SafetyEventType =
  | "PANIC_ALERT"
  | "GPS_DISCONNECTED"
  | "LOW_DRIVER_RATING"
  | "DOCUMENT_EXPIRY"
  | "RANDOM_SPOT_CHECK";

export interface SafetyEvent {
  id: string;
  ownerUserId: number;
  vehicleId: string | null;
  driverId: string | null;
  eventType: SafetyEventType;
  source: string;
  location: string | null;
  details: string;
  status: string;
  policeNotified: boolean;
  remedialTrainingRequired: boolean;
  evidenceReference: string | null;
  reviewReason: string | null;
  enforcementCaseId: string | null;
  eventAt: string;
}

export interface SafetyEventRequest {
  ownerUserId?: number;
  vehicleId?: string;
  driverId?: string;
  eventType: SafetyEventType;
  source: string;
  location?: string;
  details: string;
  eventAt?: string;
}

export const listSafetyEvents = async (): Promise<SafetyEvent[]> =>
  (await api.get("/safety/events")).data;
export const reportSafetyEvent = async (request: SafetyEventRequest, authority = false): Promise<SafetyEvent> =>
  (await api.post(authority ? "/admin/safety/events" : "/safety/events", request)).data;
export const reviewSafetyEvent = async (id: string, compliant: boolean, reason: string): Promise<SafetyEvent> =>
  (await api.post(`/admin/safety/events/${id}/review`, { compliant, reason })).data;
export const submitSafetyRemediation = async (id: string, evidenceReference: string): Promise<SafetyEvent> =>
  (await api.post(`/safety/events/${id}/remediation`, { evidenceReference })).data;
