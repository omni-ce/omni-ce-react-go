import type { LanguageCode } from "@/stores/languageStore";

export interface Response<T> {
  status: number;
  message: Record<LanguageCode, string>;
  data: T;
}

export interface WithPagination<T> {
  rows: T[];
  pagination: PaginationMeta;
}
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
