import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import type { INotification } from "@/types/notification";

export const notificationService = {
  nextData: (lastId: number) =>
    satellite.get<Response<INotification[]>>(
      `/api/notification/next/${lastId}`,
    ),
  markRead: (ids: number[]) =>
    satellite.post<Response<null>>("/api/notification/mark-read", { ids }),
  toggleRead: (id: number) =>
    satellite.post<Response<{ id: number; is_read: boolean }>>(
      "/api/notification/toggle-read",
      { id },
    ),
  delete: (id: number) =>
    satellite.delete<Response<null>>(`/api/notification/delete/${id}`),
  clearAll: () =>
    satellite.delete<Response<null>>("/api/notification/clear-all"),
};
