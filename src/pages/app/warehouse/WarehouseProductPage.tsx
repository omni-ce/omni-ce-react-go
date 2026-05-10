import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { Badge } from "@/components/ui/Badge";
import type { WarehouseProduct } from "@/types/warehouse";
import type { ProductItemOption } from "@/types/product";

interface Props {
  ruleKey?: string;
}

export default function WarehouseProductPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField<ProductItemOption>[]>(
    () => [
      {
        key: "warehouse_location_id",
        label: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        type: "select",
        required: true,
        selectOptions: "warehouse-locations",
      },
      {
        key: "product_id",
        label: language({ id: "Produk", en: "Product" }),
        type: "select",
        required: true,
        selectOptions: "product-items",
        selectFormat: (item: ProductItemOption) => {
          return {
            value: String(item.value),
            render: (
              <div className="flex flex-col gap-1 w-full py-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-foreground text-sm truncate">
                    {item.label}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300 shrink-0"
                  >
                    {item.meta.sku}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-dark-400">
                  <span className="bg-dark-700 px-1.5 rounded border border-dark-600">
                    {item.meta.category}
                  </span>
                  <span>•</span>
                  <span>{item.meta.brand}</span>
                  <span>•</span>
                  <span>{item.meta.type}</span>
                  {item.meta.color && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-white/10"
                          style={{ backgroundColor: item.meta.color_hex }}
                        />
                        <span>{item.meta.color}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ),
          };
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<WarehouseProduct>[]>(
    () => [
      {
        key: "warehouse_location_name",
        header: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium">
            {item.entity_name} - {item.branch_name}: {` `}
            {item.warehouse_location_name}
          </span>
        ),
      },
      {
        key: "product_name",
        header: language({ id: "Nama Produk", en: "Product Name" }),
        sort: true,
        search: true,
        render: (item) => {
          let categoryName = item.product_category_name;
          let typeName = item.product_type_name;
          try {
            if (categoryName.startsWith("{")) {
              const obj = JSON.parse(categoryName);
              categoryName = language(obj);
            }
            if (typeName.startsWith("{")) {
              const obj = JSON.parse(typeName);
              typeName = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium">{item.product_name}</span>
              <span className="text-xs text-muted-foreground">
                {categoryName} {typeName}
              </span>
            </div>
          );
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
        fields={fields as PaginationField[]}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
