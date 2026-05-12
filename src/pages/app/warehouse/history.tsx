import { useMemo, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { Badge } from "@/components/ui/Badge";
import type { WarehouseProduct, WarehouseHistory } from "@/types/warehouse";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { IconComponent } from "@/components/ui/IconSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { dummyProductHistory } from "@/dummy";
import { formatDateTime } from "@/utils/datetime";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface Props {
  dataSelected: WarehouseProduct;
}
export default function HistoryPage({ dataSelected }: Props) {
  const { language } = useLanguageStore();

  const [historyFilter, setHistoryFilter] = useState<"IN" | "OUT">("IN");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [showInModal, setShowInModal] = useState(false);
  const [inForm, setInForm] = useState({
    fromSupplier: false,
    supplierId: "",
    reference: "",
    qty: "",
    note: "",
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<WarehouseHistory | null>(null);
  const dummyHistory = useMemo(() => dummyProductHistory, []);

  const mockSuppliers = [
    { value: "1", label: "Supplier A" },
    { value: "2", label: "Supplier B" },
    { value: "3", label: "Supplier C" },
  ];

  return (
    <Card className="mt-4 animate-fade-in">
      <CardHeader>
        <CardTitle>
          {language({
            id: "Detail & Riwayat Produk",
            en: "Product Details & History",
          })}
        </CardTitle>
        <p className="text-xs text-dark-400 mt-1">
          {language({
            id: "Informasi lengkap dan histori pergerakan barang di gudang",
            en: "Complete information and history of item movements in the warehouse",
          })}
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
                  {language({ id: "Stok Saat Ini", en: "Current Stock" })}
                </span>
                <div className="flex items-baseline gap-1 justify-center sm:justify-end">
                  <span className="text-2xl font-black text-accent-500">
                    120
                  </span>
                  <span className="text-xs font-bold text-dark-400">Unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-dark-800/30 p-3 rounded-2xl border border-dark-600/30 gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-dark-900 rounded-lg p-1 border border-dark-600/50 w-full sm:w-auto">
                <Input
                  type="date"
                  value={startDate}
                  max={endDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-xs text-dark-200 outline-none h-8 w-full sm:w-32.5 px-2 py-0 focus:ring-0"
                />
                <span className="text-dark-500 text-xs px-1">
                  {language({ id: "ke", en: "to" })}
                </span>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-xs text-dark-200 outline-none h-8 w-full sm:w-32.5 px-2 py-0 focus:ring-0"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-dark-400 hover:text-accent-500 hover:bg-accent-500/10 shrink-0"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                title={language({ id: "Atur Ulang", en: "Reset" })}
              >
                <IconComponent iconName="Hi/HiOutlineRefresh" size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="h-9 text-xs border-neon-green/30 text-neon-green hover:bg-neon-green/10 hover:border-neon-green/50 flex-1 sm:flex-none"
                onClick={() => setShowInModal(true)}
              >
                <IconComponent
                  iconName="Hi/HiOutlinePlus"
                  size={14}
                  className="mr-1.5"
                />
                {language({ id: "Barang Masuk", en: "Item In" })}
              </Button>
              <Button
                variant="outline"
                className="h-9 text-xs border-neon-red/30 text-neon-red hover:bg-neon-red/10 hover:border-neon-red/50 flex-1 sm:flex-none"
              >
                <IconComponent
                  iconName="Hi/HiOutlineMinus"
                  size={14}
                  className="mr-1.5"
                />
                {language({ id: "Barang Keluar", en: "Item Out" })}
              </Button>
            </div>
          </div>

          {/* History List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-dark-300 uppercase tracking-widest">
                {language({
                  id: "Riwayat Pergerakan Barang",
                  en: "Item Movement History",
                })}
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={historyFilter === "IN" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => setHistoryFilter("IN")}
                >
                  {language({ id: "Barang Masuk", en: "Incoming Items" })}
                </Button>
                <Button
                  variant={historyFilter === "OUT" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => setHistoryFilter("OUT")}
                >
                  {language({ id: "Barang Keluar", en: "Outgoing Items" })}
                </Button>
              </div>
            </div>

            <div className="max-h-200 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dummyHistory
                .filter((h) => h.type === historyFilter)
                .map((h) => (
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
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {h.type === "IN"
                              ? language({
                                  id: "Barang Masuk",
                                  en: "Item In",
                                })
                              : language({
                                  id: "Barang Keluar",
                                  en: "Item Out",
                                })}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <div className="flex items-center gap-1">
                              <IconComponent
                                iconName="Hi/HiOutlineCalendar"
                                size={12}
                                className="text-dark-500"
                              />
                              <span className="text-[10px] text-dark-400 font-medium">
                                {formatDateTime(h.date).split(", ")[0]}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IconComponent
                                iconName="Hi/HiOutlineClock"
                                size={12}
                                className="text-dark-500"
                              />
                              <span className="text-[10px] text-dark-400 font-bold">
                                {formatDateTime(h.date).split(", ")[1]}
                              </span>
                            </div>
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
                          {language({ id: "Unit", en: "Unit" })}
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
                            {language({
                              id: "No. Referensi:",
                              en: "Reference No:",
                            })}
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
                          <div className="flex flex-col">
                            <span className="text-[10px] text-dark-300 font-bold leading-none">
                              {h.user}
                            </span>
                            <span className="text-[8px] text-dark-500 uppercase tracking-tighter">
                              {language({ id: "Operator", en: "Operator" })}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHistory(h);
                            setShowDetailModal(true);
                          }}
                          className="text-[10px] font-bold text-accent-500 hover:text-accent-400 underline transition-colors"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal Barang Masuk */}
      <Dialog open={showInModal} onClose={() => setShowInModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Tambah Barang Masuk", en: "Add Item In" })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fromSupplier"
                checked={inForm.fromSupplier}
                onChange={(e) =>
                  setInForm({ ...inForm, fromSupplier: e.target.checked })
                }
                className="w-4 h-4 rounded border-dark-600 bg-dark-900 text-accent-500 focus:ring-accent-500/30"
              />
              <Label htmlFor="fromSupplier" className="mb-0 cursor-pointer">
                {language({ id: "Dari Supplier", en: "From Supplier" })}
              </Label>
            </div>

            {inForm.fromSupplier && (
              <div className="animate-fade-in">
                <Label required>
                  {language({ id: "Pilih Supplier", en: "Select Supplier" })}
                </Label>
                <SearchableSelect
                  value={inForm.supplierId}
                  onChange={(val) => setInForm({ ...inForm, supplierId: val })}
                  options={mockSuppliers}
                  placeholder={language({
                    id: "Cari supplier...",
                    en: "Search supplier...",
                  })}
                />
              </div>
            )}

            <div>
              <Label required>
                {language({ id: "No. Referensi", en: "Reference No" })}
              </Label>
              <Input
                value={inForm.reference}
                onChange={(e) =>
                  setInForm({ ...inForm, reference: e.target.value })
                }
                placeholder="PO-2024-XXXX"
              />
            </div>

            <div>
              <Label required>
                {language({ id: "Jumlah", en: "Quantity" })}
              </Label>
              <Input
                type="number"
                value={inForm.qty}
                onChange={(e) => setInForm({ ...inForm, qty: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>{language({ id: "Catatan", en: "Notes" })}</Label>
              <textarea
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm min-h-25"
                value={inForm.note}
                onChange={(e) => setInForm({ ...inForm, note: e.target.value })}
                placeholder={language({
                  id: "Tambah catatan...",
                  en: "Add notes...",
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowInModal(false)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button
              className="bg-neon-green text-dark-950 hover:bg-neon-green/90"
              onClick={() => {
                // Handle submit logic
                setShowInModal(false);
              }}
            >
              {language({ id: "Simpan", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detail History */}
      <Dialog
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        width="400px"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Detail Riwayat", en: "History Detail" })}
            </DialogTitle>
          </DialogHeader>

          {selectedHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-dark-800/50 p-4 rounded-2xl border border-dark-600/30">
                <div>
                  <span className="text-[10px] text-dark-500 uppercase font-bold block mb-1">
                    {language({ id: "Tipe", en: "Type" })}
                  </span>
                  <Badge
                    variant={
                      selectedHistory.type === "IN" ? "default" : "destructive"
                    }
                  >
                    {selectedHistory.type === "IN"
                      ? language({ id: "Masuk", en: "In" })
                      : language({ id: "Keluar", en: "Out" })}
                  </Badge>
                </div>
                <div>
                  <span className="text-[10px] text-dark-500 uppercase font-bold block mb-1">
                    {language({ id: "Jumlah", en: "Quantity" })}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {selectedHistory.qty} Unit
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-500 uppercase font-bold block mb-1">
                    {language({ id: "Referensi", en: "Reference" })}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {selectedHistory.reference}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-dark-500 uppercase font-bold block mb-1">
                    {language({ id: "Operator", en: "Operator" })}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {selectedHistory.user}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-dark-500 uppercase font-bold block mb-2 px-1">
                  {language({ id: "Waktu", en: "Time" })}
                </span>
                <div className="flex items-center gap-2 bg-dark-800/30 p-3 rounded-xl border border-dark-600/20">
                  <IconComponent
                    iconName="Hi/HiOutlineCalendar"
                    size={16}
                    className="text-accent-500"
                  />
                  <span className="text-sm text-foreground font-medium">
                    {formatDateTime(selectedHistory.date)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-dark-500 uppercase font-bold block mb-2 px-1">
                  {language({ id: "Catatan", en: "Notes" })}
                </span>
                <div className="bg-dark-800/30 p-3 rounded-xl border border-dark-600/20 min-h-20">
                  <p className="text-sm text-dark-300 italic">
                    "{selectedHistory.notes}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setShowDetailModal(false)}
            >
              {language({ id: "Tutup", en: "Close" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
