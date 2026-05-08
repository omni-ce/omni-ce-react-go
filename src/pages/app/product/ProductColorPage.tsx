import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import type { ProductColor } from "@/services/product.service";
import { Badge } from "@/components/ui/Badge";

interface Props {
  ruleKey?: string;
}
export default function ProductColorPage({ ruleKey }: Props) {
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
        key: "hex_code",
        label: language({ id: "Hex Code", en: "Hex Code" }),
        type: "color",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductColor>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: "hex_code",
        header: language({ id: "Hex Code", en: "Hex Code" }),
        render: (item) => (
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full border border-dark-600"
              style={{ backgroundColor: item.hex_code }}
            />
            <span className="text-dark-300 max-w-xs truncate block">
              {item.hex_code}
            </span>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Kategori Produk", en: "Product Categories" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua kategori produk pada sistem",
              en: "Manage all product categories in the system",
            })}
          </p>
        </div>
      </div>

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
        useIsActive
      />
    </div>
  );
}
