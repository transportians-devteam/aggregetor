import api from "./api";

export interface Notification {
  id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  readAt: string | null;
}

export const listNotifications = async (): Promise<Notification[]> =>
  (await api.get("/notifications")).data;
export const markNotificationRead = async (id: string): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};
