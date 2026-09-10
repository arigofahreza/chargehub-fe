import { NotificationTemplate } from "../types";
import { api } from "../api-client";
import { getToken } from "../auth";

export interface NotificationLog {
  id: string;
  toPhone: string;
  message: string;
  templateId: string | null;
  templateName: string | null;
  status: "sent" | "failed";
  sentAt: string;
  sentById: string | null;
  note: string | null;
}

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

export async function getLogs(): Promise<NotificationLog[]> {
  return api.get<NotificationLog[]>("/api/v1/notifications/logs");
}

export async function createLog(data: Omit<NotificationLog, "id" | "sentAt" | "sentById">): Promise<NotificationLog> {
  return api.post<NotificationLog>("/api/v1/notifications/logs", data);
}

export async function downloadLogs(): Promise<void> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/notifications/logs/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 429) throw new Error("Terlalu sering download. Tunggu 30 detik sebelum coba lagi.");
  if (!res.ok) throw new Error("Download gagal");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notification_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
