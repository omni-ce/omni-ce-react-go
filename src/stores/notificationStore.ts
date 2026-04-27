import { create } from "zustand";
import type { INotification } from "@/types/notification";
import { notificationService } from "@/services/notification.service";

interface NotificationState {
  notifications: INotification[];
  hasMore: boolean;
  isLoadingMore: boolean;
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  markAllRead: () => Promise<void>;
  toggleRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [], // Start empty. Let the socket populate it.
  hasMore: true,
  isLoadingMore: false,

  // init awal dari socket
  setNotifications: (notifications) =>
    set({
      notifications,
      // If we received less than 10, there are no more
      hasMore: notifications.length >= 10,
    }),

  // tambah notifikasi dari socket
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markAllRead: async () => {
    const { notifications } = get();
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await notificationService.markRead(unreadIds);
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
      }));
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  },

  toggleRead: async (id) => {
    try {
      const resp = await notificationService.toggleRead(id);
      const { is_read } = resp.data.data;
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read } : n,
        ),
      }));
    } catch (error) {
      console.error("Failed to toggle read:", error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.delete(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  clearAll: async () => {
    try {
      await notificationService.clearAll();
      set({ notifications: [], hasMore: false });
    } catch (error) {
      console.error("Failed to clear all:", error);
    }
  },

  loadMore: async () => {
    const { notifications, hasMore, isLoadingMore } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const lastId =
        notifications.length > 0
          ? notifications[notifications.length - 1].id
          : 0;
      const resp = await notificationService.nextData(lastId);
      const newNotifs = resp.data.data || [];
      set((state) => ({
        notifications: [...state.notifications, ...newNotifs],
        hasMore: newNotifs.length >= 10,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error("Failed to load more:", error);
      set({ isLoadingMore: false });
    }
  },
}));
