import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import type { Option } from "@/types/option";

export interface DashboardStats {
  queue?: Record<string, number>;
}

export interface DashboardWidgetCol {
  mobile: number;
  tablet: number;
  laptop: number;
  desktop: number;
}

export interface DashboardWidget {
  id: string;
  role_id: number;
  function_key: string;
  key: string;
  type: string;
  col: DashboardWidgetCol;
  label: string;
  description: string;
}

export const dashboardService = {
  getFunctions: async () => {
    const response = await satellite.get<
      Response<Record<string, { label: string; key: string }[]>>
    >("/api/dashboard/functions");
    return response.data;
  },

  getRoles: async () => {
    const response =
      await satellite.get<Response<Option[]>>("/api/option/roles");
    return response.data;
  },
  getWidgets: async (roleId: string) => {
    const response = await satellite.get<Response<DashboardWidget[]>>(
      `/api/dashboard/widget/list?role_id=${roleId}`,
    );
    return response.data;
  },
  createWidget: async (data: unknown) => {
    const response = await satellite.post<Response<DashboardWidget>>(
      "/api/dashboard/widget/create",
      data,
    );
    return response.data;
  },
  editWidget: async (id: string, data: unknown) => {
    const response = await satellite.put<Response<DashboardWidget>>(
      `/api/dashboard/widget/edit/${id}`,
      data,
    );
    return response.data;
  },
  deleteWidget: async (id: string) => {
    const response = await satellite.delete<Response<unknown>>(
      `/api/dashboard/widget/remove/${id}`,
    );
    return response.data;
  },
};
