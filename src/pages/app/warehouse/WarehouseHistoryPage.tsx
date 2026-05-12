import { useMemo, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { IconComponent } from "@/components/ui/IconSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import GuardLayout from "@/components/GuardLayout";
import { dummyProductHistory } from "@/dummy";
import { formatDateTime } from "@/utils/datetime";

interface Props {
  ruleKey: string;
}

export default function WarehouseHistoryPage({ ruleKey }: Props) {
  const { language } = useLanguageStore();

  const [historyFilter, setHistoryFilter] = useState<"IN" | "OUT" | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const dummyHistory = useMemo(() => dummyProductHistory, []);

  const filteredHistory = useMemo(() => {
    return dummyHistory.filter((h) => {
      // Filter by type
      if (historyFilter && h.type !== historyFilter) return false;

      // Filter by date range
      if (startDate && h.date < startDate) return false;
      if (endDate && h.date > `${endDate} 23:59`) return false;

      return true;
    });
  }, [dummyHistory, historyFilter, startDate, endDate]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "History Barang Gudang",
        en: "Warehouse Product History",
      }}
      subtitle={{
        id: "Halaman ini digunakan untuk melihat history barang gudang",
        en: "This page is used to view warehouse product history",
      }}
    >
      <Card className="mt-4 animate-fade-in">
        <CardHeader>
          <CardTitle>
            {language({
              id: "Riwayat Pergerakan Barang",
              en: "Item Movement History",
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
          <div className="flex flex-col gap-6">
            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-dark-800/30 p-3 rounded-2xl border border-dark-600/30 gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-dark-900 rounded-lg p-1 border border-dark-600/50 w-full sm:w-auto">
                  <Input
                    type="date"
                    value={startDate}
                    max={endDate || today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none text-xs text-dark-200 outline-none h-8 w-full sm:w-[130px] px-2 py-0 focus:ring-0"
                  />
                  <span className="text-dark-500 text-xs px-1">
                    {language({ id: "ke", en: "to" })}
                  </span>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none text-xs text-dark-200 outline-none h-8 w-full sm:w-[130px] px-2 py-0 focus:ring-0"
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
            </div>

            {/* History List */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-dark-300 uppercase tracking-widest">
                  {language({
                    id: "Daftar Riwayat",
                    en: "History List",
                  })}
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={historyFilter === "IN" ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() =>
                      setHistoryFilter((prev) => (prev === "IN" ? null : "IN"))
                    }
                  >
                    {language({ id: "Barang Masuk", en: "Incoming Items" })}
                  </Button>
                  <Button
                    variant={historyFilter === "OUT" ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() =>
                      setHistoryFilter((prev) =>
                        prev === "OUT" ? null : "OUT",
                      )
                    }
                  >
                    {language({ id: "Barang Keluar", en: "Outgoing Items" })}
                  </Button>
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((h) => (
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
                              ? language({
                                  id: "Barang Masuk",
                                  en: "Item In",
                                })
                              : language({
                                  id: "Barang Keluar",
                                  en: "Item Out",
                                })}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <IconComponent
                              iconName="Hi/HiOutlineCalendar"
                              size={12}
                              className="text-dark-500"
                            />
                            <span className="text-[10px] text-dark-400 font-medium">
                              {formatDateTime(h.date).split(", ")[0]}
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
                          <div className="w-6 h-6 rounded-lg bg-dark-700 flex items-center justify-center text-[10px] text-accent-500 font-black shadow-sm">
                            {h.user[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-dark-300 font-bold leading-none">
                              {h.user}
                            </span>
                            <span className="text-[8px] text-dark-500 uppercase tracking-tighter">
                              {language({ id: "Operator", en: "Operator" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-dark-500">
                          <IconComponent
                            iconName="Hi/HiOutlineClock"
                            size={12}
                          />
                          <span className="text-[10px] font-bold">
                            {formatDateTime(h.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredHistory.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center bg-dark-800/20 rounded-3xl border border-dashed border-dark-600/40">
                    <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center text-dark-500 mb-4">
                      <IconComponent
                        iconName="Hi/HiOutlineDatabase"
                        size={32}
                      />
                    </div>
                    <p className="text-sm font-medium text-dark-400">
                      {language({
                        id: "Tidak ada riwayat ditemukan",
                        en: "No history found",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuardLayout>
  );
}
