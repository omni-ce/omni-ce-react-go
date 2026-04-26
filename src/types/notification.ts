export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "system";

export interface INotification {
  id: string;
  type: NotificationType;
  title: { id: string; en: string };
  message: { id: string; en: string };
  timestamp: string; // ISO 8601
  isRead: boolean;
  link?: string;
}
