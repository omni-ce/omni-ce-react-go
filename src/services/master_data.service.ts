import satellite from "@/lib/satellite";
import type { Response, WithPagination } from "@/types/response";

export interface MasterDataItem {
  id: number;
  category: string;
  key: string;
  value: string;
  created_at: string;
}

export interface Unit {
  id: number;
  name: string;
  short_name: string;
  is_active: boolean;
}

export const masterDataService = {
  getPaginate: async (params: {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
    search_fields?: string;
  }) => {
    const response = await satellite.get<
      Response<WithPagination<MasterDataItem>>
    >("/api/master-data/paginate", { params });
    return response.data.data;
  },
  create: async (data: { category: string; key: string; value: string }) => {
    const response = await satellite.post<Response<MasterDataItem>>(
      "/api/master-data/create",
      data,
    );
    return response.data;
  },
  update: async (
    id: number,
    data: { category: string; key: string; value: string },
  ) => {
    const response = await satellite.put<Response<MasterDataItem>>(
      `/api/master-data/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: number) => {
    const response = await satellite.delete<Response<null>>(
      `/api/master-data/${id}`,
    );
    return response.data;
  },
};
