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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { IconComponent } from "@/components/ui/IconSelector";
import { cn } from "@/lib/utils";
import GuardLayout from "@/components/GuardLayout";
import Image from "@/components/Image";

interface Props {
  ruleKey: string;
}

export default function WarehouseProductPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const [dataSelected, setDataSelected] = useState<WarehouseProduct | null>(
    null,
  );

  const dummyHistory = useMemo(
    () => [
      {
        id: 1,
        type: "IN",
        qty: 50,
        date: "2024-05-10 10:00",
        reference: "PO-2024-001",
        notes: "Barang datang dari Supplier A",
        user: "Admin",
        status: "Completed",
      },
      {
        id: 2,
        type: "OUT",
        qty: 10,
        date: "2024-05-11 14:30",
        reference: "SO-2024-012",
        notes: "Penjualan ke Pelanggan X",
        user: "Staff",
        status: "Completed",
      },
      {
        id: 3,
        type: "IN",
        qty: 20,
        date: "2024-05-12 09:15",
        reference: "RET-2024-005",
        notes: "Retur barang rusak",
        user: "Admin",
        status: "Completed",
      },
      {
        id: 4,
        type: "OUT",
        qty: 5,
        date: "2024-05-13 11:45",
        reference: "ADJ-2024-002",
        notes: "Penyesuaian stok opname",
        user: "Manager",
        status: "Completed",
      },
    ],
    [],
  );

  const fields = useMemo(
    () => [
      {
        key: "warehouse_location_id",
        label: language({ id: "Lokasi Gudang", en: "Warehouse Location" }),
        type: "select",
        required: true,
        selectOptions: "warehouse-locations",
        selectFormat: (item: WarehouseLocationOption) => ({
          value: item.value,
          render: (
            <div className="flex items-center gap-2">
              <Image
                src={item.meta?.entity_logo}
                alt="logo"
                className="w-6 h-6 rounded-full"
              />
              <span>{item.label}</span>
            </div>
          ),
        }),
      },
      {
        key: "product_id",
        label: language({ id: "Produk", en: "Product" }),
        type: "select",
        required: true,
        selectOptions: "product-items",
        selectFormat: (item: ProductItemOption) => {
          let category_name = item.meta.category;
          try {
            if (category_name.startsWith("{")) {
              const obj = JSON.parse(category_name);
              category_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          let type_name = item.meta.type;
          try {
            if (type_name.startsWith("{")) {
              const obj = JSON.parse(type_name);
              type_name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return {
            value: String(item.value),
            render: (
              <div className="flex flex-col gap-1 w-full py-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-foreground text-sm truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-dark-400">
                  <span className="bg-dark-700 px-1.5 rounded border border-dark-600">
                    {category_name}
                  </span>
                  <span>•</span>
                  <span>{item.meta.brand}</span>
                  <span>•</span>
                  <span>{type_name}</span>
                  {item.meta.color && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-white/10"
                          style={{ backgroundColor: item.meta.color_hex }}
                        />
                        <span>{item.meta.color}</span>
                      </div>
                    </>
                  )}
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300 shrink-0"
                  >
                    {item.meta.sku}
                  </Badge>
                </div>
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
        render: (item) => {
          let categoryName = item.product_category_name;
          let typeName = item.product_type_name;
          try {
            if (categoryName.startsWith("{")) {
              const obj = JSON.parse(categoryName);
              categoryName = language(obj);
            }
            if (typeName.startsWith("{")) {
              const obj = JSON.parse(typeName);
              typeName = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return (
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
                    {categoryName}
                  </span>
                  <span>•</span>
                  <span>{typeName}</span>
                </div>
              </div>
            </div>
          );
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
            label: language({ id: "Produk", en: "Product" }),
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

      {dataSelected && (
        <Card className="mt-4 animate-fade-in">
          <CardHeader>
            <CardTitle>Detail & Riwayat Produk</CardTitle>
            <p className="text-xs text-dark-400 mt-1">
              Informasi lengkap dan histori pergerakan barang di gudang
            </p>
          </CardHeader>
          <CardContent>
            {/* Header info */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-dark-800 rounded-2xl border border-dark-600/40 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center text-accent-500 shrink-0 shadow-lg shadow-accent-500/10">
                    <IconComponent iconName="Hi/HiOutlineCube" size={28} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-foreground truncate">
                      {dataSelected.product_name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-dark-400 font-medium">
                        SKU: {dataSelected.product_sku}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-dark-600" />
                      <span className="text-xs text-dark-400 font-medium">
                        {dataSelected.warehouse_location_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-dark-600/20 pt-4 sm:pt-0">
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider block mb-0.5">
                      Stok Saat Ini
                    </span>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-end">
                      <span className="text-2xl font-black text-accent-500">
                        120
                      </span>
                      <span className="text-xs font-bold text-dark-400">
                        Unit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-dark-300 uppercase tracking-widest">
                    Riwayat Pergerakan Barang
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 border-dark-600 text-dark-400"
                  >
                    4 Transaksi Terakhir
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dummyHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 bg-dark-800/40 rounded-2xl border border-dark-600/30 hover:border-accent-500/30 hover:bg-dark-800/60 transition-all group relative overflow-hidden"
                    >
                      <div
                        className={cn(
                          "absolute top-0 left-0 w-1 h-full",
                          h.type === "IN" ? "bg-neon-green" : "bg-neon-red",
                        )}
                      />

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                              h.type === "IN"
                                ? "bg-neon-green/10 text-neon-green"
                                : "bg-neon-red/10 text-neon-red",
                            )}
                          >
                            <IconComponent
                              iconName={
                                h.type === "IN"
                                  ? "Hi/HiOutlineArrowDownLeft"
                                  : "Hi/HiOutlineArrowUpRight"
                              }
                              size={20}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">
                              {h.type === "IN"
                                ? "Barang Masuk"
                                : "Barang Keluar"}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <IconComponent
                                iconName="Hi/HiOutlineCalendar"
                                size={12}
                                className="text-dark-500"
                              />
                              <span className="text-[10px] text-dark-400 font-medium">
                                {h.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-lg font-black tracking-tighter",
                              h.type === "IN"
                                ? "text-neon-green"
                                : "text-neon-red",
                            )}
                          >
                            {h.type === "IN" ? "+" : "-"}
                            {h.qty}
                          </span>
                          <span className="text-[10px] font-bold text-dark-500 block">
                            Unit
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4 pt-4 border-t border-dark-600/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <IconComponent
                              iconName="Hi/HiOutlineDocumentText"
                              size={12}
                              className="text-dark-500"
                            />
                            <span className="text-[11px] text-dark-400">
                              No. Referensi:
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-foreground bg-dark-700 px-2 py-0.5 rounded-md border border-dark-600/50">
                            {h.reference}
                          </span>
                        </div>

                        <div className="p-2.5 bg-dark-900/50 rounded-lg border border-dark-600/10">
                          <p className="text-[11px] text-dark-300 leading-relaxed italic">
                            "{h.notes}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-dark-700 flex items-center justify-center text-[10px] text-accent-500 font-black shadow-sm">
                              {h.user[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-dark-300 font-bold leading-none">
                                {h.user}
                              </span>
                              <span className="text-[8px] text-dark-500 uppercase tracking-tighter">
                                Operator
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 bg-neon-green/5 px-2 py-0.5 rounded-full border border-neon-green/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                            <span className="text-[9px] font-bold text-neon-green uppercase tracking-wider">
                              {h.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </GuardLayout>
  );
}
