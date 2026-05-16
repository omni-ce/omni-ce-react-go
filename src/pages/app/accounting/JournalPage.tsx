import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { Journal } from "@/types/accounting";
import { Badge } from "@/components/ui/Badge";
import GuardLayout from "@/components/GuardLayout";
import { formatRupiah } from "@/utils/convert";

interface Props {
  ruleKey: string;
}
export default function JournalPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "date",
        label: language({ id: "Tanggal", en: "Date" }),
        type: "date",
        required: true,
      },
      {
        key: "reference",
        label: language({ id: "Referensi", en: "Reference" }),
        type: "text",
        required: true,
      },
      {
        key: "description",
        label: language({ id: "Deskripsi", en: "Description" }),
        type: "textarea",
        required: true,
      },
      {
        key: "amount",
        label: language({ id: "Jumlah", en: "Amount" }),
        type: "number",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<Journal>[]>(
    () => [
      {
        key: "date",
        header: language({ id: "Tanggal", en: "Date" }),
        sort: true,
      },
      {
        key: "reference",
        header: language({ id: "Referensi", en: "Reference" }),
        sort: true,
        search: true,
      },
      {
        key: "description",
        header: language({ id: "Deskripsi", en: "Description" }),
        search: true,
      },
      {
        key: "amount",
        header: language({ id: "Jumlah", en: "Amount" }),
        sort: true,
        render: (item) => formatRupiah(item.amount),
      },
      {
        key: "is_active",
        header: language({ id: "Status", en: "Status" }),
        rule: "set",
        render: (item) => (
          <Badge variant={item.is_active ? "default" : "destructive"}>
            {item.is_active
              ? language({ id: "Aktif", en: "Active" })
              : language({ id: "Nonaktif", en: "Inactive" })}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Jurnal Umum",
        en: "General Journal",
      }}
      subtitle={{
        id: "Kelola semua jurnal umum pada sistem",
        en: "Manage all general journals in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Jurnal Umum",
          en: "General Journal List",
        })}
        columns={columns}
        module="accounting/journal"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
