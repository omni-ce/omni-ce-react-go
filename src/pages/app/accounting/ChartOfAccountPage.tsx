import { useMemo, useRef, type ReactNode } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
  type PaginationHelpers,
} from "@/components/Pagination";
import type { ChartOfAccount } from "@/types/accounting";
import { Badge } from "@/components/ui/Badge";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ChartOfAccountPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language, rawLanguageToString } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "code",
        label: language({ id: "Kode", en: "Code" }),
        type: "text",
        required: true,
      },
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
        textMultiLanguage: true,
      },
      {
        key: "type",
        label: language({ id: "Tipe", en: "Type" }),
        type: "select",
        required: true,
        options: [
          {
            value: "asset",
            label: language({ id: "Aset", en: "Asset" }),
          },
          {
            value: "liability",
            label: language({ id: "Liabilitas", en: "Liability" }),
          },
          {
            value: "equity",
            label: language({ id: "Ekuitas", en: "Equity" }),
          },
          {
            value: "revenue",
            label: language({ id: "Pendapatan", en: "Revenue" }),
          },
          {
            value: "expenses",
            label: language({ id: "Beban", en: "Expenses" }),
          },
        ],
      },
      {
        key: "category",
        label: language({ id: "Kategori", en: "Category" }),
        type: "text",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ChartOfAccount>[]>(
    () => [
      {
        key: "code",
        header: language({ id: "Kode", en: "Code" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-mono">{item.code}</span>,
      },
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium">{rawLanguageToString(item.name)}</span>
        ),
      },
      {
        key: "type",
        header: language({ id: "Tipe", en: "Type" }),
        sort: true,
        search: true,
      },
      {
        key: "category",
        header: language({ id: "Kategori", en: "Category" }),
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
        id: "Bagan Akun",
        en: "Chart of Account",
      }}
      subtitle={{
        id: "Kelola semua bagan akun pada sistem",
        en: "Manage all chart of accounts in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Bagan Akun",
          en: "Chart of Account List",
        })}
        columns={columns}
        module="accounting/chart-of-account"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
