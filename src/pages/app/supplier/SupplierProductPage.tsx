import { useMemo, useRef, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { Badge } from "@/components/ui/Badge";
import type { ProductItemOption } from "@/types/product";
import GuardLayout from "@/components/GuardLayout";
import type { LanguageKey } from "@/types/world";
import type { SupplierProduct, SupplierProductOption } from "@/types/supplier";

interface Props {
  ruleKey: string;
}

export default function SupplierProductPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField<ProductItemOption>[]>(
    () => [
      {
        key: "supplier_id",
        label: language({ id: "Supplier", en: "Supplier" }),
        type: "select",
        required: true,
        selectOptions: "supplier-entities",
        selectFormat: (item: SupplierProductOption) => ({
          value: item.value,
          render: (
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
            </div>
          ),
        }),
      },
      {
        key: "product_id",
        label: language({ id: "Produk", en: "Product" }),
        type: "select",
        required: true,
        selectOptions: "product-items",
        selectFormat: (item: ProductItemOption) => {
          let category_name = item.meta.category;
          try {
            if (category_name.startsWith("{")) {
              const obj = JSON.parse(category_name) as Record<
                LanguageKey,
                string
              >;
              category_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          let type_name = item.meta.type;
          try {
            if (type_name.startsWith("{")) {
              const obj = JSON.parse(type_name) as Record<LanguageKey, string>;
              type_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return {
            value: String(item.value),
            render: (
              <div className="flex flex-col gap-1 w-full py-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-foreground text-sm truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-dark-400">
                  <span className="bg-dark-700 px-1.5 rounded border border-dark-600">
                    {category_name}
                  </span>
                  <span>•</span>
                  <span>{item.meta.brand}</span>
                  <span>•</span>
                  <span>{type_name}</span>
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
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300 shrink-0"
                  >
                    {item.meta.sku}
                  </Badge>
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

  const columns = useMemo<PaginationColumn<SupplierProduct>[]>(
    () => [
      {
        key: "supplier_name",
        header: language({ id: "Supplier", en: "Supplier" }),
        sort: true,
        search: true,
        onlySuperAdmin: true,
        render: (item) => (
          <div className="flex flex-col gap-1.5 py-1">
            <span className="text-xs text-dark-100 font-semibold truncate">
              {item.supplier_name}
            </span>
          </div>
        ),
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
      title={{ id: "Produk Supplier", en: "Supplier Product" }}
      subtitle={{
        id: "Kelola semua produk yang ada di Supplier",
        en: "Manage all product in Supplier",
      }}
    >
      <Pagination
        ruleKey={ruleKey}
        ref={paginationRef}
        title={language({
          id: "Daftar Produk Supplier",
          en: "Supplier Product List",
        })}
        columns={columns}
        module="supplier/product"
        fields={fields as PaginationField[]}
        useIsActive
      />
    </GuardLayout>
  );
}
