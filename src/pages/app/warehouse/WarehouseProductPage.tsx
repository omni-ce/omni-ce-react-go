import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { Badge } from "@/components/ui/Badge";
import type {
  WarehouseLocationOption,
  WarehouseProduct,
} from "@/types/warehouse";
import type { ProductItemOption } from "@/types/product";
import Image from "@/components/Image";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}

export default function WarehouseProductPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo(
    () => [
      {
        key: "warehouse_location_id",
        label: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        type: "select",
        required: true,
        selectOptions: "warehouse-locations",
        selectFormat: (item: WarehouseLocationOption) => ({
          value: item.value,
          render: (
            <div className="flex items-center gap-2">
              <Image
                src={item.meta?.entity_logo}
                alt="logo"
                className="w-6 h-6 rounded-full"
              />
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
              const obj = JSON.parse(category_name);
              category_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          let type_name = item.meta.type;
          try {
            if (type_name.startsWith("{")) {
              const obj = JSON.parse(type_name);
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

  const columns = useMemo<PaginationColumn<WarehouseProduct>[]>(
    () => [
      {
        key: "warehouse_location_name",
        header: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium flex flex-col">
            <div className="flex items-center gap-2">
              <Image
                src={item.entity_logo}
                alt="logo"
                className="w-6 h-6 rounded-full"
              />
              <span>{item.entity_name}</span>
            </div>
            {item.warehouse_location_name}: {` `}
            <Badge variant="secondary">{item.division_name}</Badge>
            <span className="font-medium">{item.role_name}</span>
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
            <div className="flex items-center gap-3 py-1">
              <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-600/40 p-1.5 flex items-center justify-center shrink-0">
                <Image
                  src={item.product_brand_logo}
                  alt={item.product_name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm truncate">
                    {item.product_name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300 shrink-0"
                  >
                    {item.product_sku}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-dark-400 mt-0.5">
                  <span className="bg-dark-700 px-1.5 rounded border border-dark-600">
                    {categoryName}
                  </span>
                  <span>•</span>
                  <span>{typeName}</span>
                </div>
              </div>
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

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{ id: "Produk Gudang", en: "Warehouse Product" }}
      subtitle={{
        id: "Kelola semua produk yang ada di gudang",
        en: "Manage all product in warehouse",
      }}
    >
      <Pagination
        ruleKey={ruleKey}
        ref={paginationRef}
        title={language({
          id: "Daftar Produk Gudang",
          en: "Warehouse Product List",
        })}
        columns={columns}
        module="warehouse/product"
        fields={fields as PaginationField[]}
        popupWidth="80%"
        extraActions={[
          {
            icon: "Ai/AiOutlineProduct",
            label: language({ id: "Produk", en: "Product" }),
            button: (row) => {
              alert(JSON.stringify(row));
            },
          },
        ]}
        useIsActive
      />
    </GuardLayout>
  );
}
