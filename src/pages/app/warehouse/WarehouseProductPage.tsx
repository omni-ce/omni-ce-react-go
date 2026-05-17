import { useMemo, useRef, useState } from "react";
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
import GuardLayout from "@/components/GuardLayout";
import Image from "@/components/Image";
import HistoryPage from "@/pages/app/warehouse/history";
import type { LanguageKey } from "@/types/world";
import type { Unit } from "@/services/master_data.service";
import type { Option } from "@/types/option";
import type { UnitOption } from "@/types/master_data";

interface Props {
  ruleKey: string;
}

export default function WarehouseProductPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language, rawLanguageToString } = useLanguageStore();

  const [dataSelected, setDataSelected] = useState<WarehouseProduct | null>(
    null,
  );

  const fields = useMemo<
    PaginationField<WarehouseLocationOption | ProductItemOption | UnitOption>[]
  >(
    () => [
      {
        key: "warehouse_location_id",
        label: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        type: "select",
        required: true,
        selectOptions: "warehouse-locations",
        selectFormat: (item: unknown) => {
          const warehouseLocation = item as WarehouseLocationOption;
          return {
            value: warehouseLocation.value,
            render: (
              <div className="flex items-center gap-2">
                <Image
                  src={warehouseLocation.meta.entity_logo}
                  alt="logo"
                  className="w-6 h-6 rounded-full"
                />
                <span>{warehouseLocation.label}</span>
              </div>
            ),
          };
        },
      },
      {
        key: "product_id",
        label: language({ id: "Produk", en: "Product" }),
        type: "select",
        required: true,
        selectOptions: "product-items",
        selectFormat: (item: unknown) => {
          const productItem = item as ProductItemOption;
          return {
            value: String(productItem.value),
            render: (
              <div className="flex flex-col gap-1 w-full py-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-foreground text-sm truncate">
                    {productItem.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-dark-400">
                  <span className="bg-dark-700 px-1.5 rounded border border-dark-600">
                    {rawLanguageToString(productItem.meta.category)}
                  </span>
                  <span>•</span>
                  <span>{productItem.meta.brand}</span>
                  <span>•</span>
                  <span>{rawLanguageToString(productItem.meta.type)}</span>
                  {productItem.meta.color && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-white/10"
                          style={{
                            backgroundColor: productItem.meta.color_hex,
                          }}
                        />
                        <span>{productItem.meta.color}</span>
                      </div>
                    </>
                  )}
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300 shrink-0"
                  >
                    {productItem.meta.sku}
                  </Badge>
                </div>
              </div>
            ),
          };
        },
      },
      {
        key: "is_converted",
        label: language({ id: "Konversi Unit", en: "Unit Conversion" }),
        type: "switch",
        booleanDefault: false,
      },
      {
        key: "unit_in",
        label: language({ id: "Unit Masuk", en: "Unit In" }),
        type: "select",
        required: true,
        selectOptions: "units",
        show_on_true: "is_converted",
        selectFormat: (item: unknown) => {
          const unit = item as UnitOption;
          return {
            value: unit.value,
            render: (
              <div className="flex items-center gap-2">
                <span>{unit.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({unit.meta?.short_name})
                </span>
              </div>
            ),
          };
        },
      },
      {
        key: "unit_out",
        label: language({ id: "Unit Keluar", en: "Unit Out" }),
        type: "select",
        required: true,
        selectOptions: "units",
        show_on_true: "is_converted",
        selectFormat: (item: unknown) => {
          const unit = item as UnitOption;
          return {
            value: unit.value,
            render: (
              <div className="flex items-center gap-2">
                <span>{unit.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({unit.meta?.short_name})
                </span>
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
        onlySuperAdmin: true,
        render: (item) => (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center gap-2">
              <Image
                src={item.entity_logo}
                alt="logo"
                className="w-6 h-6 rounded-full shrink-0 border border-dark-600/40"
              />
              <span className="font-bold text-foreground text-sm truncate">
                {item.entity_name}
              </span>
            </div>
            <div className="flex flex-col gap-1 ml-8">
              <span className="text-xs text-dark-100 font-semibold truncate">
                {item.warehouse_location_name}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300"
                >
                  {item.division_name}
                </Badge>
                <span className="text-[11px] text-dark-400">
                  {item.role_name}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "product_name",
        header: language({ id: "Nama Produk", en: "Product Name" }),
        sort: true,
        search: true,
        render: (item) => (
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
                  {rawLanguageToString(item.product_category_name)}
                </span>
                <span>•</span>
                <span>{rawLanguageToString(item.product_type_name)}</span>
              </div>
            </div>
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
        dataSelected={dataSelected?.id}
        extraActions={[
          {
            icon: "Ai/AiOutlineProduct",
            label: { id: "Produk", en: "Product" },
            button: (row) => {
              setDataSelected((state) => {
                if (row.id === state?.id) return null;
                return row;
              });
            },
          },
        ]}
        useIsActive
      />

      {dataSelected && <HistoryPage dataSelected={dataSelected} />}
    </GuardLayout>
  );
}
