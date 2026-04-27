export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "system";

export interface INotification {
  id: number;
  type: NotificationType;
  title: { id: string; en: string };
  message: { id: string; en: string };
  created_at: string; // ISO 8601
  is_read: boolean;
  link?: string;
  navigate?: string;
}
