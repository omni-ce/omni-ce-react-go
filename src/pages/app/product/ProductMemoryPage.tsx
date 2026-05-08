import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import type { ProductMemory } from "@/types/product";
import { FileTypeGroup } from "@/components/DynamicForm";

interface Props {
  ruleKey?: string;
}
export default function ProductMemoryPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "RAM", en: "RAM" }),
        type: "number",
        col: 6,
        required: true,
        numberSuffix: "GB",
      },
      {
        key: "internal_storage",
        label: language({ id: "Penyimpanan Internal", en: "Internal Storage" }),
        type: "number",
        col: 6,
        required: true,
        numberSuffix: "GB",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductMemory>[]>(
    () => [
      {
        key: "ram",
        header: language({ id: "RAM", en: "RAM" }),
        sort: true,
        render: (item) => <span className="font-medium">{item.ram}</span>,
      },
      {
        key: "internal_storage",
        header: language({
          id: "Penyimpanan Internal",
          en: "Internal Storage",
        }),
        sort: true,
        render: (item) => (
          <span className="font-medium">{item.internal_storage}</span>
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
            {language({ id: "Memori Produk", en: "Product Memories" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua memori produk pada sistem",
              en: "Manage all product memories in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Memori Produk",
          en: "Product Memory List",
        })}
        columns={columns}
        module="product/memory"
        fields={fields}
        ruleKey={ruleKey}
      />
    </div>
  );
}
