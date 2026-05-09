import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";

export const settingService = {
  getAll: async () => {
    const response =
      await satellite.get<Response<Record<string, string>>>("/api/setting/all");
    return response.data.data;
  },

  changePassword: async (previous_password: string, password: string) => {
    const response = await satellite.post<Response<unknown>>(
      "/api/user/change-password",
      {
        previous_password,
        password,
      },
    );
    return response.data;
  },

  toggleMaintenance: async () => {
    const response = await satellite.post<
      Response<{ maintenance_mode: boolean }>
    >("/api/setting/toggle-maintenance");
    return response.data;
  },
  updateProfile: async (data: {
    name: string;
    username: string;
    avatar?: string;
    phone_number?: string;
    address?: string;
  }) => {
    const response = await satellite.put<Response<unknown>>(
      "/api/user/profile",
      data,
    );
    return response.data;
  },
};
