import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { ProductCategoryOption, ProductType } from "@/types/product";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { Badge } from "@/components/ui/Badge";
import { IconComponent } from "@/components/ui/IconSelector";

interface Props {
  ruleKey?: string;
}
export default function ProductTypePage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField<ProductCategoryOption>[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
        textMultiLanguage: true,
      },
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
            render: (
              <div className="flex items-center gap-2">
                <IconComponent iconName={item.meta?.icon} className="text-lg" />
                <span>{category}</span>
              </div>
            ),
          };
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductType>[]>(
    () => [
      {
        key: "category_name",
        header: language({ id: "Kategori", en: "Category" }),
        sort: true,
        search: true,
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
            {language({ id: "Tipe Produk", en: "Product Types" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua tipe produk pada sistem",
              en: "Manage all product types in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Tipe", en: "Types List" })}
        columns={columns}
        module="product/type"
        fields={fields as PaginationField[]}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
