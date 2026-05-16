import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import GuardLayout from "@/components/GuardLayout";
import { formatRupiah } from "@/utils/convert";

interface ReportItem {
  id: number;
  name: string;
  amount: number;
  type: "income" | "expense" | "asset" | "liability" | "equity";
}

interface Props {
  ruleKey: string;
}
export default function BalanceSheetPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
      },
      {
        key: "amount",
        label: language({ id: "Jumlah", en: "Amount" }),
        type: "number",
        required: true,
      },
      {
        key: "type",
        label: language({ id: "Tipe", en: "Type" }),
        type: "select",
        required: true,
        selectOptions: [
          { value: "asset", label: "Asset" },
          { value: "liability", label: "Liability" },
          { value: "equity", label: "Equity" },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ReportItem>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
      },
      {
        key: "type",
        header: language({ id: "Tipe", en: "Type" }),
        sort: true,
      },
      {
        key: "amount",
        header: language({ id: "Jumlah", en: "Amount" }),
        sort: true,
        render: (item) => formatRupiah(item.amount),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Neraca",
        en: "Balance Sheet",
      }}
      subtitle={{
        id: "Laporan neraca keuangan pada sistem",
        en: "Balance sheet financial report in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Laporan Neraca",
          en: "Balance Sheet Report",
        })}
        columns={columns}
        module="accounting/balance-sheet"
        fields={fields}
        ruleKey={ruleKey}
      />
    </GuardLayout>
  );
}
