import { NotificationTemplate } from "../types";
import { mockTemplates } from "../mock-data/notifications";

export async function getTemplates(): Promise<NotificationTemplate[]> {
  return [...mockTemplates];
}

export async function createTemplate(
  data: Omit<NotificationTemplate, "id">
): Promise<NotificationTemplate> {
  const t: NotificationTemplate = { ...data, id: String(Date.now()) };
  mockTemplates.push(t);
  return t;
}

export async function updateTemplate(
  id: string,
  data: Partial<NotificationTemplate>
): Promise<NotificationTemplate | null> {
  const idx = mockTemplates.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  mockTemplates[idx] = { ...mockTemplates[idx], ...data };
  return mockTemplates[idx];
}
