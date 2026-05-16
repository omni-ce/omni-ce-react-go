import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { GeneralLedger } from "@/types/accounting";
import GuardLayout from "@/components/GuardLayout";
import { formatRupiah } from "@/utils/convert";

interface Props {
  ruleKey: string;
}
export default function GeneralLedgerPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "account_code",
        label: language({ id: "Kode Akun", en: "Account Code" }),
        type: "text",
        required: true,
      },
      {
        key: "date",
        label: language({ id: "Tanggal", en: "Date" }),
        type: "date",
        required: true,
      },
      {
        key: "description",
        label: language({ id: "Deskripsi", en: "Description" }),
        type: "textarea",
        required: true,
      },
      {
        key: "debit",
        label: language({ id: "Debit", en: "Debit" }),
        type: "number",
      },
      {
        key: "credit",
        label: language({ id: "Kredit", en: "Credit" }),
        type: "number",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<GeneralLedger>[]>(
    () => [
      {
        key: "account_code",
        header: language({ id: "Akun", en: "Account" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs">{item.account_code}</span>
            <span className="font-medium">{item.account_name}</span>
          </div>
        ),
      },
      {
        key: "date",
        header: language({ id: "Tanggal", en: "Date" }),
        sort: true,
      },
      {
        key: "description",
        header: language({ id: "Deskripsi", en: "Description" }),
        search: true,
      },
      {
        key: "debit",
        header: language({ id: "Debit", en: "Debit" }),
        render: (item) => formatRupiah(item.debit),
      },
      {
        key: "credit",
        header: language({ id: "Kredit", en: "Credit" }),
        render: (item) => formatRupiah(item.credit),
      },
      {
        key: "balance",
        header: language({ id: "Saldo", en: "Balance" }),
        render: (item) => formatRupiah(item.balance),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Buku Besar",
        en: "General Ledger",
      }}
      subtitle={{
        id: "Kelola semua buku besar pada sistem",
        en: "Manage all general ledgers in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Buku Besar",
          en: "General Ledger List",
        })}
        columns={columns}
        module="accounting/general-ledger"
        fields={fields}
        ruleKey={ruleKey}
      />
    </GuardLayout>
  );
}
