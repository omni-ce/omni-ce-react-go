import type { INotification } from "@/types/notification";

export const notifications: INotification[] = [
  {
    id: "notif-1",
    type: "success",
    title: { id: "Login berhasil", en: "Login successful" },
    message: {
      id: "Anda telah masuk dari perangkat baru.",
      en: "You have logged in from a new device.",
    },
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
    isRead: false,
  },
  {
    id: "notif-2",
    type: "warning",
    title: { id: "Kapasitas hampir penuh", en: "Storage almost full" },
    message: {
      id: "Penyimpanan database telah mencapai 85%. Harap segera lakukan pembersihan.",
      en: "Database storage has reached 85%. Please clean up soon.",
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    isRead: false,
  },
  {
    id: "notif-3",
    type: "info",
    title: { id: "Pengguna baru terdaftar", en: "New user registered" },
    message: {
      id: "User 'john_doe' baru saja mendaftar ke sistem.",
      en: "User 'john_doe' has just registered to the system.",
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    isRead: false,
  },
  {
    id: "notif-4",
    type: "error",
    title: { id: "Antrian gagal diproses", en: "Queue processing failed" },
    message: {
      id: "Antrian 'email_sender' gagal diproses setelah 3 kali percobaan.",
      en: "Queue 'email_sender' failed after 3 retry attempts.",
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
  },
  {
    id: "notif-5",
    type: "system",
    title: { id: "Pembaruan sistem", en: "System update" },
    message: {
      id: "Sistem telah diperbarui ke versi terbaru v2.1.0.",
      en: "System has been updated to the latest version v2.1.0.",
    },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    isRead: true,
  },
  {
    id: "notif-6",
    type: "info",
    title: { id: "Backup selesai", en: "Backup completed" },
    message: {
      id: "Backup otomatis harian berhasil dilakukan.",
      en: "Daily automatic backup has been completed successfully.",
    },
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isRead: true,
  },
  {
    id: "notif-7",
    type: "success",
    title: { id: "Deploy berhasil", en: "Deployment successful" },
    message: {
      id: "Deployment ke server produksi berhasil tanpa error.",
      en: "Deployment to production server completed without errors.",
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
  },
  {
    id: "notif-8",
    type: "warning",
    title: { id: "SSL akan kedaluwarsa", en: "SSL expiring soon" },
    message: {
      id: "Sertifikat SSL akan kedaluwarsa dalam 7 hari. Harap segera perbarui.",
      en: "SSL certificate will expire in 7 days. Please renew soon.",
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
  },
];
