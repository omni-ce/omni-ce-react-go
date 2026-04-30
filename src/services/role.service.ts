import satellite from "@/lib/satellite";
import type { Response, WithPagination } from "@/types/response";

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export const roleService = {
  getAll: async () => {
    const response =
      await satellite.get<Response<{ roles: Role[] }>>("/api/role/all");
    return response.data.data.roles;
  },
  getPaginate: async (params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
    search_fields?: string;
  }) => {
    const response = await satellite.get<Response<WithPagination<Role>>>(
      "/api/role/paginate",
      { params },
    );
    return response.data.data;
  },
  create: async (data: { name: string; description: string }) => {
    const response = await satellite.post<Response<Role>>(
      "/api/role/create",
      data,
    );
    return response.data;
  },
  update: async (id: number, data: { name: string; description: string }) => {
    const response = await satellite.put<Response<Role>>(
      `/api/role/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: number) => {
    const response = await satellite.delete<Response<null>>(`/api/role/${id}`);
    return response.data;
  },
};
