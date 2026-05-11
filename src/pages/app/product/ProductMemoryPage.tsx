import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { ProductMemory } from "@/types/product";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ProductMemoryPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "ram",
        label: language({ id: "RAM", en: "RAM" }),
        type: "number",
        col: 6,
        required: true,
        numberSuffix: "GB",
      },
      {
        key: "internal_storage",
        label: language({ id: "Penyimpanan Internal", en: "Internal Storage" }),
        type: "number",
        col: 6,
        required: true,
        numberSuffix: "GB",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductMemory>[]>(
    () => [
      {
        key: "ram",
        header: language({ id: "RAM", en: "RAM" }),
        sort: true,
        render: (item) => <span className="font-medium">{item.ram} GB</span>,
      },
      {
        key: "internal_storage",
        header: language({
          id: "Penyimpanan Internal",
          en: "Internal Storage",
        }),
        sort: true,
        render: (item) => (
          <span className="font-medium">{item.internal_storage} GB</span>
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
        id: "Memori Produk",
        en: "Product Memories",
      }}
      subtitle={{
        id: "Kelola semua memori produk pada sistem",
        en: "Manage all product memories in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Memori Produk",
          en: "Product Memory List",
        })}
        columns={columns}
        module="product/memory"
        fields={fields}
        ruleKey={ruleKey}
      />
    </GuardLayout>
  );
}
