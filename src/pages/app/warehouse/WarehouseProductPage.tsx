import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import type { ProductCategory } from "@/types/product";
import { Badge } from "@/components/ui/Badge";

interface Props {
  ruleKey?: string;
}
export default function WarehouseProductPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "warehouse_location_id",
        label: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        type: "select",
        required: true,
        selectOptions: "warehouse/location",
      },
      {
        key: "product_id",
        label: language({ id: "Produk", en: "Product" }),
        type: "select",
        required: true,
        selectOptions: "product-items",
        selectFormat: (row) => {
          let prefix = "";
          try {
            const category = JSON.parse(row.category_name);
            const type = JSON.parse(row.type_name);
            prefix = `[${language(category)} ${language(type)}]`;
          } catch (error) {
            //
          }
          return {
            value: row.value,
            label: prefix ? `${prefix} ${row.label}` : row.label,
          };
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductCategory>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => {
          let name = item.name;
          try {
            if (name.startsWith("{")) {
              const obj = JSON.parse(name);
              name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return <span className="font-medium">{name}</span>;
        },
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

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Produk Gudang", en: "Warehouse Product" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua produk yang ada di gudang",
              en: "Manage all product in warehouse",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Produk Gudang",
          en: "Warehouse Product List",
        })}
        columns={columns}
        module="warehouse/product"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
