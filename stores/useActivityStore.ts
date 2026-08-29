"use client";
import { create } from "zustand";
import { ActivityLog } from "@/lib/types";
import { getActivityLogs, createActivityLog, updateActivityLog } from "@/lib/services/activity";

interface ActivityStore {
  logs: ActivityLog[];
  fetching: boolean;
  fetchLogs: () => Promise<void>;
  addLog: (data: Omit<ActivityLog, "id">) => Promise<ActivityLog>;
  updateLog: (id: string, data: Partial<ActivityLog>) => Promise<ActivityLog | null>;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  logs: [],
  fetching: false,

  fetchLogs: async () => {
    set({ fetching: true });
    try {
      const logs = await getActivityLogs();
      set({ logs });
    } finally {
      set({ fetching: false });
    }
  },

  addLog: async (data) => {
    const created = await createActivityLog(data);
    set((s) => ({ logs: [created, ...s.logs] }));
    return created;
  },

  updateLog: async (id, data) => {
    const updated = await updateActivityLog(id, data);
    if (updated) {
      set((s) => ({ logs: s.logs.map((l) => (l.id === id ? updated : l)) }));
    }
    return updated;
  },
}));
