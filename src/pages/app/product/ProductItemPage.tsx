import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { type ProductItem } from "@/types/product";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { Badge } from "@/components/ui/Badge";

interface Props {
  ruleKey?: string;
}
export default function ProductItemPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "category_id",
        label: language({ id: "Kategori", en: "Category" }),
        type: "select",
        required: true,
        selectOptions: "product-categories",
      },
      {
        key: "type_id",
        label: language({ id: "Tipe", en: "Type" }),
        type: "select",
        required: true,
        ref: "category_id",
        selectOptions: "product-types/{category_id}",
      },
      {
        key: "brand_id",
        label: language({ id: "Merek", en: "Brand" }),
        type: "select",
        required: true,
        selectOptions: "product-brands",
      },
      {
        key: "varian_id",
        label: language({ id: "Varian", en: "Variant" }),
        type: "select",
        required: true,
        ref: "brand_id",
        selectOptions: "product-variants/{brand_id}",
      },
      {
        key: "memory_id",
        label: language({ id: "Memori (Opsional)", en: "Memory (Optional)" }),
        type: "select",
        selectOptions: "product-memories",
      },
      {
        key: "color_id",
        label: language({ id: "Warna", en: "Color" }),
        type: "select",
        required: true,
        selectOptions: "product-colors",
      },
      {
        label: language({ id: "SKU", en: "SKU" }),
        children: [
          {
            key: "sku",
            label: language({ id: "Produk", en: "Product" }),
            type: "text",
            debounce: "product-sku",
            required: true,
          },
          {
            key: "sku_imei",
            label: language({ id: "IMEI", en: "IMEI" }),
            type: "text",
            debounce: "product-imei",
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductItem>[]>(
    () => [
      {
        key: "sku",
        header: language({ id: "SKU", en: "SKU" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
              {item.sku}
            </span>
            {item.sku_imei && (
              <span className="font-mono text-[10px] uppercase">
                IMEI: {item.sku_imei}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "category_name",
        header: language({ id: "Kategori", en: "Category" }),
        options: "product-categories",
        render: (item) => {
          let name = item.category_name;
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
        key: "type_name",
        header: language({ id: "Tipe", en: "Type" }),
        ref: "category_id",
        selectOptions: "product-types/{category_id}",
        render: (item) => {
          let name = item.type_name;
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
        key: "brand_name",
        header: language({ id: "Merek Varian", en: "Brand Variant" }),
        search: true,
        render: (item) => (
          <span className="max-w-xs truncate block">{item.brand_name}</span>
        ),
      },
      {
        key: "varian_name",
        header: language({ id: "Merek Varian", en: "Brand Variant" }),
        search: true,
        render: (item) => (
          <span className="max-w-xs truncate block">{item.varian_name}</span>
        ),
      },
      {
        key: "memory_name",
        header: language({ id: "Memori", en: "Memory" }),
        render: (item) => (
          <span className="max-w-xs truncate block">
            {item.memory_name ?? "- "}
          </span>
        ),
      },
      {
        key: "color_name",
        header: language({ id: "Warna", en: "Color" }),
        render: (item) => (
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full border border-dark-600"
              style={{ backgroundColor: item.color_hex }}
            />
            <span className="text-dark-300 max-w-xs truncate block">
              {item.color_name}
            </span>
          </div>
        ),
      },
      {
        key: "qty",
        header: language({ id: "Stok", en: "Stock" }),
        render: (item) => <span className="max-w-xs truncate block">0</span>,
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
            {language({ id: "Item Produk", en: "Product Item" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua item produk pada sistem",
              en: "Manage all product items in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Item Produk", en: "Product Item List" })}
        columns={columns}
        module="product/item"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
        dataDeleteName={(item) => {
          let category_name = item.category_name;
          try {
            if (category_name.startsWith("{")) {
              const obj = JSON.parse(category_name);
              category_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return `${category_name} ${item.brand_name} ${item.varian_name} (${item.memory_name ?? "-"}) ${item.color_name}`;
        }}
      />
    </div>
  );
}
