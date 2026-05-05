import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import type { Rule } from "@/types/rule";

export interface RoleItem {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface DivisionGroup {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  roles: RoleItem[];
}

export const roleService = {
  // ─── Division ───────────────────────────────────────────────
  getAll: async () => {
    const response =
      await satellite.get<Response<{ divisions: DivisionGroup[] }>>(
        "/api/role/all",
      );
    return response.data;
  },
  divisionCreate: async (data: { name: string; description: string }) => {
    const response = await satellite.post<Response<DivisionGroup>>(
      "/api/role/division/create",
      data,
    );
    return response.data;
  },
  divisionUpdate: async (
    id: number,
    data: { name: string; description: string },
  ) => {
    const response = await satellite.put<Response<DivisionGroup>>(
      `/api/role/division/edit/${id}`,
      data,
    );
    return response.data;
  },
  divisionDelete: async (id: number) => {
    const response = await satellite.delete<Response<null>>(
      `/api/role/division/remove/${id}`,
    );
    return response.data;
  },
  divisionSetActive: async (id: number) => {
    const response = await satellite.patch<Response<{ is_active: boolean }>>(
      `/api/role/division/set-active/${id}`,
    );
    return response.data;
  },

  // ─── Role ───────────────────────────────────────────────────
  create: async (data: {
    role_division_id: number;
    name: string;
    description: string;
  }) => {
    const response = await satellite.post<Response<RoleItem>>(
      "/api/role/create",
      data,
    );
    return response.data;
  },
  update: async (id: number, data: { name: string; description: string }) => {
    const response = await satellite.put<Response<RoleItem>>(
      `/api/role/edit/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: number) => {
    const response = await satellite.delete<Response<null>>(
      `/api/role/remove/${id}`,
    );
    return response.data;
  },
  setActive: async (id: number) => {
    const response = await satellite.patch<Response<{ is_active: boolean }>>(
      `/api/role/set-active/${id}`,
    );
    return response.data;
  },

  // ─── Rule ───────────────────────────────────────────────────
  getRules: async () => {
    const response =
      await satellite.get<Response<{ rows: Rule[] }>>("/api/rule/list");
    return response.data;
  },
  setRules: async (
    data: {
      role_id: number;
      key: string;
      action: string;
      state: boolean;
    }[],
  ) => {
    const response = await satellite.post<Response<null>>("/api/rule/set", {
      data,
    });
    return response.data;
  },
};
