import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { ProductColor } from "@/types/product";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ProductColorPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
      },
      {
        key: "hex_code",
        label: language({ id: "Hex Code", en: "Hex Code" }),
        type: "color",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<ProductColor>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: "hex_code",
        header: language({ id: "Hex Code", en: "Hex Code" }),
        render: (item) => (
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full border border-dark-600"
              style={{ backgroundColor: item.hex_code }}
            />
            <span className="text-dark-400 max-w-xs truncate block">
              {item.hex_code}
            </span>
          </div>
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
        id: "Warna Produk",
        en: "Product Colors",
      }}
      subtitle={{
        id: "Kelola semua warna produk pada sistem",
        en: "Manage all product colors in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Warna Produk",
          en: "Product Color List",
        })}
        columns={columns}
        module="product/color"
        fields={fields}
        ruleKey={ruleKey}
      />
    </GuardLayout>
  );
}
