import { apiClient } from "@/lib/api-client";
import { DashboardStats, RecentActivity } from "@/types";

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>("/api/dashboard/stats");
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    return apiClient.get<RecentActivity[]>("/api/dashboard/recent-activity");
  },
};

