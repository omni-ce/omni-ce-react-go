import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { type ProductBrand } from "@/types/product";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { Badge } from "@/components/ui/Badge";

interface Props {
  ruleKey?: string;
}
export default function ProductBrandPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "logo",
        label: language({ id: "Logo", en: "Logo" }),
        type: "file",
        fileTemplate: "profile",
        required: true,
      },
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

  const columns = useMemo<PaginationColumn<ProductBrand>[]>(
    () => [
      {
        key: "logo",
        header: language({ id: "Logo", en: "Logo" }),
        render: (item) => (
          <span className="font-medium text-accent-400">
            <img src={item.logo} alt={item.name} className="h-6 w-6" />
          </span>
        ),
      },
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-mono text-sm">{item.name}</span>
        ),
      },
      {
        key: "description",
        header: language({ id: "Deskripsi", en: "Description" }),
        search: true,
        render: (item) => (
          <span className="text-dark-300 max-w-xs truncate block">
            {item.description}
          </span>
        ),
      },
      {
        key: "is_active",
        header: language({ id: "Status", en: "Status" }),
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

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Merek Produk", en: "Product Brands" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua merek produk pada sistem",
              en: "Manage all product brands in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Merek", en: "Brand List" })}
        columns={columns}
        module="product/brand"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
