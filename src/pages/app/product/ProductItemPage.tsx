import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import {
  type ProductBrandOption,
  type ProductCategoryOption,
  type ProductItem,
} from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "@/pages/app/product/action";
import { IconComponent } from "@/components/ui/IconSelector";
import Image from "@/components/Image";
import { formatRupiah } from "@/utils/convert";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ProductItemPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo(
    () => [
      {
        key: "category_id",
        label: language({ id: "Kategori", en: "Category" }),
        type: "select",
        required: true,
        selectOptions: "product-categories",
        selectFormat: (item: ProductCategoryOption) => {
          const category_name = item.label;
          let category: string = "";
          try {
            if (category_name.startsWith("{")) {
              const obj = JSON.parse(category_name);
              category = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return {
            value: item.value,
            label: category || category_name,
            render: (
              <div className="flex items-center gap-2">
                <IconComponent iconName={item.meta?.icon} className="text-lg" />
                <span>{category}</span>
              </div>
            ),
          };
        },
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
        selectFormat: (item: ProductBrandOption) => ({
          value: item.value,
          render: (
            <div className="flex items-center gap-2">
              <Image src={item.meta?.logo} alt="logo" className="w-6 h-6" />
              <span>{item.label}</span>
            </div>
          ),
        }),
        col: 6,
      },
      {
        key: "variant_id",
        label: language({ id: "Varian", en: "Variant" }),
        type: "select",
        required: true,
        ref: ["type_id", "brand_id"],
        selectOptions: "product-variants/{type_id}/{brand_id}",
        col: 6,
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
        key: "condition_id",
        label: language({ id: "Kondisi", en: "Condition" }),
        type: "select",
        required: true,
        selectOptions: "product-conditions",
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
          </div>
        ),
      },
      {
        key: "category_name",
        header: language({ id: "Kategori", en: "Category" }),
        options: "product-categories",
        render: (item) => {
          let category_name = item.category_name;
          try {
            if (category_name.startsWith("{")) {
              const obj = JSON.parse(category_name);
              category_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return (
            <span className="font-medium flex items-center gap-2">
              <IconComponent
                iconName={item.category_icon}
                className="text-lg"
              />
              <span>{category_name}</span>
            </span>
          );
        },
      },
      {
        key: "type_name",
        header: language({ id: "Tipe", en: "Type" }),
        ref: "category_name",
        options: "product-types/{category_name}",
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
        header: language({ id: "Merek", en: "Brand" }),
        options: "product-brands",
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-dark-600 bg-dark-800/50 p-1.5 flex items-center justify-center group-hover:border-accent-500/30 transition-colors">
              <Image
                src={item.brand_logo}
                alt={item.brand_name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-dark-100">
                {item.brand_name}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "variant_name",
        header: language({ id: "Varian", en: "Variant" }),
        ref: "brand_name",
        options: "product-variants/{brand_name}",
        render: (item) => (
          <span className="max-w-xs truncate block">{item.variant_name}</span>
        ),
      },
      {
        key: "memory_name",
        header: language({ id: "Memori", en: "Memory" }),
        search: true,
        sort: true,
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
            <span className="text-dark-400 max-w-xs truncate block">
              {item.color_name}
            </span>
          </div>
        ),
      },
      {
        key: "condition_name",
        header: language({ id: "Kondisi", en: "Condition" }),
        render: (item) => {
          let condition_name = item.condition_name;
          try {
            if (condition_name.startsWith("{")) {
              const obj = JSON.parse(condition_name);
              condition_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return (
            <span className="font-medium flex items-center gap-2">
              <span>{condition_name}</span>
            </span>
          );
        },
      },
      {
        key: "qty",
        header: language({ id: "Stok", en: "Stock" }),
        render: (item) => (
          <span className="max-w-xs truncate block">{item.qty}</span>
        ),
      },
      {
        key: "price",
        header: language({ id: "Harga Beli", en: "Buy Price" }),
        render: (item) => (
          <span className="max-w-xs truncate block">
            {formatRupiah(item.buy_price)}
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

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Item Produk",
        en: "Product Item",
      }}
      subtitle={{
        id: "Kelola semua item produk pada sistem",
        en: "Manage all product items in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Item Produk",
          en: "Product Item List",
        })}
        columns={columns}
        module="product/item"
        fields={fields as PaginationField[]}
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
          return `${category_name} ${item.brand_name} ${item.variant_name} (${item.memory_name ?? "-"}) ${item.color_name}`;
        }}
        extraActions={[
          {
            icon: "Io/IoIosImages",
            label: {
              id: "Foto",
              en: "Photo",
            },
            width: "90%",
            height: "90%",
            component: (row, onClose) => (
              <ProductImage row={row} onClose={onClose} />
            ),
          },
        ]}
      />
    </GuardLayout>
  );
}
