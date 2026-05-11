import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { type ProductBrand } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { FileType } from "@/components/DynamicForm";
import Image from "@/components/Image";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ProductBrandPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "logo",
        label: language({ id: "Logo", en: "Logo" }),
        type: "file",
        fileTarget: "logo-brand",
        fileTemplate: "profile",
        fileMaxSize: 1024 * 1024 * 1, // 1MB
        fileType: [FileType.Jpeg, FileType.Png],
        required: true,
      },
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductBrand>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-dark-600 bg-dark-800/50 p-1.5 flex items-center justify-center group-hover:border-accent-500/30 transition-colors">
              <Image
                src={item.logo}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-dark-100">{item.name}</span>
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
      title={{
        id: "Merek Produk",
        en: "Product Brands",
      }}
      subtitle={{
        id: "Kelola semua merek produk pada sistem",
        en: "Manage all product brands in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Merek", en: "Brand List" })}
        columns={columns}
        module="product/brand"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
