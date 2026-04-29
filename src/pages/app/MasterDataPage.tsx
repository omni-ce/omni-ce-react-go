import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { MasterDataItem } from "@/services/master_data.service";

interface MasterDataPageProps {}
export default function MasterDataPage({}: MasterDataPageProps) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "category",
        label: language({ id: "Kategori", en: "Category" }),
        type: "text",
        required: true,
      },
      {
        key: "key",
        label: language({ id: "Kunci", en: "Key" }),
        type: "text",
        required: true,
      },
      {
        key: "value",
        label: language({ id: "Nilai", en: "Value" }),
        type: "text",
      },
    ],
    [language],
  );

  const columns = useMemo<PaginationColumn<MasterDataItem>[]>(
    () => [
      {
        header: language({ id: "Kategori", en: "Category" }),
        sort: true,
        search: "category",
        render: (item) => (
          <span className="font-medium text-accent-400">{item.category}</span>
        ),
      },
      {
        header: language({ id: "Kunci", en: "Key" }),
        sort: true,
        search: "key",
        render: (item) => <span className="font-mono text-sm">{item.key}</span>,
      },
      {
        header: language({ id: "Nilai", en: "Value" }),
        search: "value",
        render: (item) => (
          <span className="text-dark-300 max-w-xs truncate block">
            {item.value || "-"}
          </span>
        ),
      },
      {
        header: language({ id: "Dibuat Pada", en: "Created At" }),
        sort: true,
        search: "created_at",
        render: (item) => formatDateTime(item.created_at),
      },
    ],
    [language],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Data Master", en: "Master Data" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola data master pada sistem",
              en: "Manage master data in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Data Master", en: "Master Data List" })}
        columns={columns}
        module="master-data"
        fields={fields}
      />
    </div>
  );
}
