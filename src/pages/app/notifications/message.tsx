import type { INotification } from "@/types/notification";

export type FilterType = "all" | INotification["type"];

export const filters: { key: FilterType; label: { id: string; en: string } }[] =
  [
    { key: "all", label: { id: "Semua", en: "All" } },
    { key: "info", label: { id: "Info", en: "Info" } },
    { key: "success", label: { id: "Berhasil", en: "Success" } },
    { key: "warning", label: { id: "Peringatan", en: "Warning" } },
    { key: "error", label: { id: "Error", en: "Error" } },
    { key: "system", label: { id: "Sistem", en: "System" } },
  ];
