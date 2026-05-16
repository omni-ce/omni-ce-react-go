import { useMemo, useRef } from "react";
import { useLanguageStore, type LanguageCode } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { ProductCategory } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { IconComponent } from "@/components/ui/IconSelector";
import GuardLayout from "@/components/GuardLayout";
import { rawLanguageToObject } from "@/utils/convert";

interface Props {
  ruleKey: string;
}
export default function ProductCategoryPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
        textMultiLanguage: true,
      },
      {
        key: "icon",
        label: language({ id: "Ikon", en: "Icon" }),
        type: "icon",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductCategory>[]>(
    () => [
      {
        key: "icon",
        header: language({ id: "Ikon", en: "Icon" }),
        render: (item) => {
          return <IconComponent iconName={item.icon} className="w-5 h-5" />;
        },
      },
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium">
            {rawLanguageToObject(language, item.name)}
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

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Kategori Produk",
        en: "Product Categories",
      }}
      subtitle={{
        id: "Kelola semua kategori produk pada sistem",
        en: "Manage all product categories in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Kategori Produk",
          en: "Product Category List",
        })}
        columns={columns}
        module="product/category"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
