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
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import GuardLayout from "@/components/GuardLayout";
import Image from "@/components/Image";
import { dummyProductHistory } from "@/dummy";

interface ProductHistory {
  id: number;
  type: string;
  qty: number;
  date: string;
  reference: string;
  notes: string;
  user: string;
  status: string;
}

interface Props {
  ruleKey: string;
}

export default function WarehouseProductPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const [dataSelected, setDataSelected] = useState<WarehouseProduct | null>(
    null,
  );

  const dummyWarehouseProductHistory = useMemo(() => dummyProductHistory, []);

  const inHistory = useMemo(
    () => dummyWarehouseProductHistory.filter((h) => h.type === "IN"),
    [dummyWarehouseProductHistory],
  );
  const outHistory = useMemo(
    () => dummyWarehouseProductHistory.filter((h) => h.type === "OUT"),
    [dummyWarehouseProductHistory],
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
            <CardTitle>
              {language({
                id: "Detail & Riwayat Produk",
                en: "Product Detail & History",
              })}
            </CardTitle>
            <p className="text-xs text-dark-400 mt-1">
              {language({
                id: "Informasi lengkap dan histori pergerakan barang di gudang",
                en: "Complete information and movement history of items in the warehouse",
              })}
            </p>
          </CardHeader>
          <CardContent>
            {/* Header info */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-dark-800 rounded-3xl border border-dark-600/40 gap-4 shadow-sm">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center text-accent-500 shrink-0 shadow-lg shadow-accent-500/5">
                    <IconComponent iconName="Hi/HiOutlineCube" size={32} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-lg font-bold text-foreground truncate">
                      {dataSelected.product_name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-dark-400 font-medium bg-dark-700/50 px-2 py-0.5 rounded-lg border border-dark-600/30">
                        {dataSelected.product_sku}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-dark-600" />
                      <span className="text-xs text-dark-400 font-medium">
                        {dataSelected.warehouse_location_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-dark-600/20 pt-5 sm:pt-0">
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block mb-1">
                      {language({ id: "Stok Saat Ini", en: "Current Stock" })}
                    </span>
                    <div className="flex items-baseline gap-1.5 justify-center sm:justify-end">
                      <span className="text-3xl font-black text-accent-500 tabular-nums">
                        120
                      </span>
                      <span className="text-xs font-bold text-dark-400">
                        Unit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions buttons */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-1">
                  <Button className="flex-1 sm:flex-none h-12 px-8 rounded-2xl bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border-none shadow-none font-bold gap-3 group transition-all">
                    <div className="w-7 h-7 rounded-xl bg-neon-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent iconName="Hi/HiOutlinePlus" size={18} />
                    </div>
                    {language({ id: "Barang Masuk", en: "Item In" })}
                  </Button>
                  <Button className="flex-1 sm:flex-none h-12 px-8 rounded-2xl bg-neon-red/10 hover:bg-neon-red/20 text-neon-red border-none shadow-none font-bold gap-3 group transition-all">
                    <div className="w-7 h-7 rounded-xl bg-neon-red/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent iconName="Hi/HiOutlineMinus" size={18} />
                    </div>
                    {language({ id: "Barang Keluar", en: "Item Out" })}
                  </Button>
                </div>

                <div className="flex flex-col gap-6 pt-4 border-t border-dark-600/20">
                  <h4 className="text-xs font-bold text-dark-300 uppercase tracking-[0.2em] px-1">
                    {language({
                      id: "Riwayat Pergerakan Barang",
                      en: "Product Movement History",
                    })}
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* IN Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2 py-1 bg-dark-800/30 rounded-xl">
                        <span className="text-[11px] font-black text-neon-green uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,202,114,0.5)]" />
                          {language({ id: "Masuk", en: "IN" })}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 border-dark-700 bg-dark-900 text-dark-500 font-bold"
                        >
                          {inHistory.length}{" "}
                          {language({ id: "Data", en: "Records" })}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                        {inHistory.length === 0 ? (
                          <div className="py-10 text-center border-2 border-dashed border-dark-600/20 rounded-3xl">
                            <span className="text-xs text-dark-500 font-medium">
                              {language({
                                id: "Belum ada data masuk",
                                en: "No incoming data yet",
                              })}
                            </span>
                          </div>
                        ) : (
                          inHistory.map((h) => (
                            <HistoryCard
                              key={h.id}
                              history={h}
                              language={language}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    {/* OUT Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2 py-1 bg-dark-800/30 rounded-xl">
                        <span className="text-[11px] font-black text-neon-red uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-neon-red shadow-[0_0_8px_rgba(228,66,88,0.5)]" />
                          {language({ id: "Keluar", en: "OUT" })}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 border-dark-700 bg-dark-900 text-dark-500 font-bold"
                        >
                          {outHistory.length}{" "}
                          {language({ id: "Data", en: "Records" })}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                        {outHistory.length === 0 ? (
                          <div className="py-10 text-center border-2 border-dashed border-dark-600/20 rounded-3xl">
                            <span className="text-xs text-dark-500 font-medium">
                              {language({
                                id: "Belum ada data keluar",
                                en: "No outgoing data yet",
                              })}
                            </span>
                          </div>
                        ) : (
                          outHistory.map((h) => (
                            <HistoryCard
                              key={h.id}
                              history={h}
                              language={language}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </GuardLayout>
  );
}

function HistoryCard({
  history: h,
  language,
}: {
  history: ProductHistory;
  language: (key: { id: string; en: string }) => string;
}) {
  return (
    <div className="p-4 bg-dark-800/40 rounded-2xl border border-dark-600/30 hover:border-accent-500/30 hover:bg-dark-800/60 transition-all group relative overflow-hidden">
      <div
        className={cn(
          "absolute top-0 left-0 w-1 h-full",
          h.type === "IN" ? "bg-neon-green" : "bg-neon-red",
        )}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0",
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
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-black text-foreground tracking-tight truncate">
              {h.reference}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <IconComponent
                iconName="Hi/HiOutlineCalendar"
                size={12}
                className="text-dark-500"
              />
              <span className="text-[10px] text-dark-400 font-bold tabular-nums">
                {h.date}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className={cn(
              "text-lg font-black tracking-tighter leading-none",
              h.type === "IN" ? "text-neon-green" : "text-neon-red",
            )}
          >
            {h.type === "IN" ? "+" : "-"}
            {h.qty}
          </div>
          <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest mt-1 block">
            Unit
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-dark-600/10">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] text-dark-300 leading-relaxed italic line-clamp-1 opacity-80">
            "{h.notes}"
          </p>
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-dark-700 flex items-center justify-center text-[9px] text-accent-500 font-black border border-dark-600/30">
              {h.user[0]}
            </div>
            <span className="text-[10px] text-dark-400 font-bold">
              {h.user}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-dark-900/50 px-2 py-0.5 rounded-lg border border-dark-600/20">
            <div
              className={cn(
                "w-1 h-1 rounded-full",
                h.type === "IN" ? "bg-neon-green" : "bg-neon-red",
              )}
            />
            <span className="text-[9px] font-black text-dark-400 uppercase tracking-tighter">
              {h.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
