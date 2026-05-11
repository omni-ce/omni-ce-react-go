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
  type ProductVarian,
} from "@/types/product";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { Badge } from "@/components/ui/Badge";
import Image from "@/components/Image";
import { IconComponent } from "@/components/ui/IconSelector";

interface Props {
  ruleKey?: string;
}
export default function ProductVarianPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

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
              <Image src={item.meta.logo} alt="logo" className="w-6 h-6" />
              <span>{item.label}</span>
            </div>
          ),
        }),
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
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductVarian>[]>(
    () => [
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
        key: "brand_id",
        header: language({ id: "Merek", en: "Brand" }),
        options: "product-brands",
        render: (item) => (
          <span className="font-mono text-sm flex items-center gap-2">
            <Image src={item.brand_logo} alt="logo" className="w-6 h-6" />
            <span>{item.brand_name}</span>
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
          <span className="text-dark-400 max-w-xs truncate block">
            {item.description}
          </span>
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

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Varian Produk", en: "Product Variants" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua varian produk pada sistem",
              en: "Manage all product variants in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Varian", en: "Variants List" })}
        columns={columns}
        module="product/variant"
        fields={fields as PaginationField[]}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
