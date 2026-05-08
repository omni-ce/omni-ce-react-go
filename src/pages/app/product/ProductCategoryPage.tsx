import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { MasterDataItem } from "@/services/master_data.service";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";

interface Props {
  ruleKey?: string;
}
export default function ProductCategoryPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

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
        key: "description",
        label: language({ id: "Deskripsi", en: "Description" }),
        type: "text",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<MasterDataItem>[]>(
    () => [
      {
        key: "category",
        header: language({ id: "Kategori", en: "Category" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium text-accent-400">{item.category}</span>
        ),
      },
      {
        key: "key",
        header: language({ id: "Kunci", en: "Key" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-mono text-sm">{item.key}</span>,
      },
      {
        key: "value",
        header: language({ id: "Nilai", en: "Value" }),
        search: true,
        render: (item) => (
          <span className="text-dark-300 max-w-xs truncate block">
            {item.value || "-"}
          </span>
        ),
      },
      {
        key: "created_at",
        header: language({ id: "Dibuat Pada", en: "Created At" }),
        sort: true,
        render: (item) => formatDateTime(item.created_at),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Kategori Produk",
          en: "Product Category List",
        })}
        columns={columns}
        module="master-data"
        fields={fields}
        ruleKey={ruleKey}
      />
    </div>
  );
}
