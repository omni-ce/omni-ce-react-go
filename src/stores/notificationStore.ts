import { create } from "zustand";
import type { INotification } from "@/types/notification";

interface NotificationState {
  notifications: INotification[];
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notifications: INotification) => void;
  markAllRead: () => void;
  toggleRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [], // Start empty. Let the socket populate it.

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notifications) =>
    set((state) => ({
      notifications: [notifications, ...state.notifications],
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
      })),
    })),

  toggleRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: !n.is_read } : n,
      ),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
