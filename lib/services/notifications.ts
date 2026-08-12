import { NotificationTemplate } from "../types";
import { api } from "../api-client";

export async function getTemplates(): Promise<NotificationTemplate[]> {
  return api.get<NotificationTemplate[]>("/api/v1/notifications");
}

export async function createTemplate(
  data: Omit<NotificationTemplate, "id">
): Promise<NotificationTemplate> {
  return api.post<NotificationTemplate>("/api/v1/notifications", data);
}

export async function updateTemplate(
  id: string,
  data: Partial<NotificationTemplate>
): Promise<NotificationTemplate | null> {
  try {
    return await api.patch<NotificationTemplate>(`/api/v1/notifications/${id}`, data);
  } catch {
    return null;
  }
}
