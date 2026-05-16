import { useMemo, useRef } from "react";
import { useLanguageStore, type LanguageCode } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { ProductCondition } from "@/types/product";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ProductConditionPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language, rawLanguageToString } = useLanguageStore();

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
        key: "description",
        label: language({ id: "Deskripsi", en: "Description" }),
        type: "textarea",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductCondition>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium">{rawLanguageToString(item.name)}</span>
        ),
      },
      {
        key: "description",
        header: language({ id: "Deskripsi", en: "Description" }),
        render: (item) => (
          <span className="font-medium">{item.description}</span>
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
        id: "Kondisi Produk",
        en: "Product Conditions",
      }}
      subtitle={{
        id: "Kelola semua kondisi produk pada sistem",
        en: "Manage all product conditions in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Kondisi Produk",
          en: "Product Condition List",
        })}
        columns={columns}
        module="product/condition"
        fields={fields}
        ruleKey={ruleKey}
      />
    </GuardLayout>
  );
}
