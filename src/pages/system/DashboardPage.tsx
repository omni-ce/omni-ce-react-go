import React, { Fragment, useEffect, useState, useCallback } from "react";
import { IconComponent } from "@/components/ui/IconSelector";

import {
  dashboardService,
  type DashboardWidget,
} from "@/services/dashboard.service";
import type { Option } from "@/types/option";
import { lgMap, mdMap, spanMap, xlMap } from "@/responsive";
import { DAYS_30, MONTHS } from "@/dummy";

import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import Stepper from "@/components/ui/Stepper";
import StatCard from "@/components/StatCard";
import type { DynamicFormField } from "@/components/DynamicForm";
import DynamicForm from "@/components/DynamicForm";

// Highcharts Widgets
import WidgetAreaChart, {
  type AreaChartSeries,
} from "@/components/widget/WidgetAreaChart";
import WidgetColumnChart from "@/components/widget/WidgetColumnChart";
import WidgetGaugeChart from "@/components/widget/WidgetGaugeChart";
import WidgetDonutChart from "@/components/widget/WidgetDonutChart";
import WidgetTrafficStats, {
  type SparklineStat,
} from "@/components/widget/WidgetTrafficStats";
import WidgetTableList, {
  type TableRow,
} from "@/components/widget/WidgetTableList";
import WidgetProgressList from "@/components/widget/WidgetProgressList";
import WidgetLineChart from "@/components/widget/WidgetLineChart";

import { useLanguageStore } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { useRuleStore } from "@/stores/ruleStore";
import { getSseClient } from "@/lib/sse";

interface Widget {
  label: string;
  key: string; // as type on backend
  element: React.ComponentType;
}

const widgets: Widget[] = [
  {
    label: "Chart Area",
    key: "chart_area",
    element: WidgetAreaChart as React.ComponentType,
  },
  {
    label: "Chart Column",
    key: "chart_column",
    element: WidgetColumnChart as React.ComponentType,
  },
  {
    label: "Chart Gauge",
    key: "chart_gauge",
    element: WidgetGaugeChart as React.ComponentType,
  },
  {
    label: "Chart Pie",
    key: "chart_pie",
    element: WidgetDonutChart as React.ComponentType,
  },
  {
    label: "Table List",
    key: "chart_table",
    element: WidgetTableList as React.ComponentType,
  },
  {
    label: "Progress List",
    key: "chart_progress",
    element: WidgetProgressList as React.ComponentType,
  },
  {
    label: "Traffic Stats",
    key: "chart_traffic",
    element: WidgetTrafficStats as React.ComponentType,
  },
  {
    label: "Chart Line",
    key: "chart_line",
    element: WidgetLineChart as React.ComponentType,
  },
];

interface DashboardPageProps {}
export default function DashboardPage({}: DashboardPageProps) {
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
  const { role_selected } = useRuleStore();

  const [roles, setRoles] = useState<Option[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState(
    user?.role !== "su" ? role_selected?.role_id || "" : "",
  );

  useEffect(() => {
    if (!selectedRole || selectedRole == "-") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const stream = getSseClient("/api/event/dashboard", {
      query: {
        role_id: selectedRole,
      },
    });

    const handleLiveWidget = (data: {
      widgets: { id: string; data: unknown }[];
    }) => {
      const widgetsList = data?.widgets || [];
      const newWidgetData: Record<string, unknown> = {};
      for (const w of widgetsList) {
        newWidgetData[w.id] = w.data;
      }
      setLiveWidgetsData(newWidgetData);
    };
    stream.on("live_widgets", handleLiveWidget);
    return () => {
      stream.off("live_widgets", handleLiveWidget);
      stream.disconnect();
    };
  }, [selectedRole]);

  useEffect(() => {
    if (user?.role !== "su") {
      setSelectedRole(role_selected?.role_id || "");
    }
  }, [user?.role, role_selected?.role_id]);

  useEffect(() => {
    setLoadingRoles(true);

    if (user?.role === "su") {
      dashboardService
        .getRoles()
        .then((res) => {
          setRoles(res.data || []);
        })
        .catch((err) => console.error("Failed to fetch roles:", err))
        .finally(() => setLoadingRoles(false));
      dashboardService
        .getFunctions()
        .then((data) => {
          setFunctionsData(data.data);
        })
        .catch((err) =>
          console.error("Failed to fetch dashboard functions:", err),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Period state for charts
  const [statsPeriod, setStatsPeriod] = useState("Monthly");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("Monthly");
  const [trafficPeriod, setTrafficPeriod] = useState("Monthly");

  // Widget CRUD state
  const [liveWidgetsData, setLiveWidgetsData] = useState<
    Record<string, unknown>
  >({});
  const [roleWidgets, setRoleWidgets] = useState<DashboardWidget[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(
    null,
  );
  const [deletingWidget, setDeletingWidget] = useState<DashboardWidget | null>(
    null,
  );
  const [formType, setFormType] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formColObj, setFormColObj] = useState({
    mobile: 12,
    tablet: 6,
    laptop: 4,
    desktop: 3,
  });
  const [selectedWidgetKey, setSelectedWidgetKey] = useState("");
  const [selectedFunctionKey, setSelectedFunctionKey] = useState("");
  const [functionsData, setFunctionsData] = useState<
    Record<string, { label: string; key: string }[]>
  >({});
  const [addFormData, setAddFormData] = useState<Record<string, unknown>>({
    label: "",
    description: "",
    col: { mobile: 12, tablet: 6, laptop: 4, desktop: 3 },
  });

  const addWidgetFields: DynamicFormField[] = [
    {
      key: "label",
      label: language({ id: "Label", en: "Label" }),
      type: "text",
      required: true,
      col: 12,
    },
    {
      key: "description",
      label: language({ id: "Deskripsi", en: "Description" }),
      type: "textarea",
      col: 12,
    },
    {
      key: "col",
      label: language({
        id: "Lebar Kolom Responsif",
        en: "Responsive Column Width",
      }),
      type: "col",
      required: true,
      col: 12,
    },
  ];

  const fetchWidgets = useCallback((roleId: string) => {
    if (!roleId || roleId === "" || roleId === "-") return;
    dashboardService
      .getWidgets(roleId)
      .then((res) => setRoleWidgets(res.data || []))
      .catch(() => setRoleWidgets([]));
  }, []);

  useEffect(() => {
    fetchWidgets(selectedRole);
  }, [selectedRole, fetchWidgets]);

  const resetForm = () => {
    setAddStep(1);
    setSelectedWidgetKey("");
    setAddFormData({
      label: "",
      description: "",
      col: { mobile: 12, tablet: 6, laptop: 4, desktop: 3 },
    });
    setFormColObj({ mobile: 12, tablet: 6, laptop: 4, desktop: 3 });
    setFormType("");
  };

  const handleCreate = async () => {
    const w = widgets.find((w) => w.key === selectedWidgetKey);
    if (!w || !selectedRole) return;
    try {
      const colData = (addFormData.col as {
        mobile: number;
        tablet: number;
        laptop: number;
        desktop: number;
      }) || { mobile: 12, tablet: 6, laptop: 4, desktop: 3 };
      await dashboardService.createWidget({
        role_id: Number(selectedRole),
        function_key: selectedFunctionKey,
        type: w.key,
        col: {
          mobile: colData.mobile,
          tablet: colData.tablet,
          laptop: colData.laptop,
          desktop: colData.desktop,
        },
        label: (addFormData.label as string) || w.label,
        description: (addFormData.description as string) || "",
      });
      setAddModalOpen(false);
      resetForm();
      fetchWidgets(selectedRole);
    } catch (err) {
      console.error("Failed to create widget:", err);
    }
  };

  const openEdit = (w: DashboardWidget) => {
    setEditingWidget(w);
    setFormType(w.type);
    setFormColObj({
      mobile: w.col?.mobile || 12,
      tablet: w.col?.tablet || 6,
      laptop: w.col?.laptop || 4,
      desktop: w.col?.desktop || 3,
    });
    setFormLabel(w.label);
    setFormDesc(w.description);
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingWidget) return;
    try {
      await dashboardService.editWidget(editingWidget.id, {
        type: formType,
        col: {
          mobile: formColObj.mobile,
          tablet: formColObj.tablet,
          laptop: formColObj.laptop,
          desktop: formColObj.desktop,
        },
        label: formLabel,
        description: formDesc,
      });
      setEditModalOpen(false);
      setEditingWidget(null);
      fetchWidgets(selectedRole);
    } catch (err) {
      console.error("Failed to edit widget:", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingWidget) return;
    try {
      await dashboardService.deleteWidget(deletingWidget.id);
      setDeleteModalOpen(false);
      setDeletingWidget(null);
      fetchWidgets(selectedRole);
    } catch (err) {
      console.error("Failed to delete widget:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {language({ id: "Dashboard", en: "Dashboard" })}
          </h2>
          <p className="text-sm text-dark-300 mt-1">
            {language({
              id: "Ikhtisar sistem secara real-time",
              en: "Real-time overview of your system",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Button Add Widget on left side select role */}
          {user?.role === "su" &&
            !(selectedRole === "" || selectedRole === "-") && (
              <Button
                onClick={() => setAddModalOpen(true)}
                className="shrink-0 whitespace-nowrap"
              >
                {language({ id: "Tambah Widget", en: "Add Widget" })}
              </Button>
            )}

          {/* Select Role on SU */}
          {user?.role === "su" && (
            <div className="w-full sm:w-64">
              <SearchableSelect
                options={[
                  {
                    label: language({ id: "--Contoh--", en: "--Example--" }),
                    value: "-",
                  },
                  ...roles
                    .sort((a, b) =>
                      a.label.localeCompare(b.label, undefined, {
                        numeric: true,
                        sensitivity: "base",
                      }),
                    )
                    .map((r) => ({
                      value: String(r.value),
                      label: r.label,
                    })),
                ]}
                value={selectedRole}
                onChange={setSelectedRole}
                loading={loadingRoles}
                placeholder={language({ id: "Pilih Role", en: "Select Role" })}
              />
            </div>
          )}
        </div>
      </div>

      {selectedRole === "" && (
        <div className="flex items-center justify-center">
          <p className="text-sm text-dark-300 mt-1">
            {language({
              id: "Pilih Role terlebih dahulu",
              en: "Please select a role first",
            })}
          </p>
        </div>
      )}

      {selectedRole === "-" && (
        <Fragment>
          {/* Stats grid — Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard
              label={language({ id: "Total Antrian", en: "Total Queues" })}
              value="24.7K"
              icon={"Ri/RiInboxLine"}
              color="indigo"
              trend={{ value: "+20%", up: true }}
            />
            <StatCard
              label={language({ id: "Total Pesan", en: "Total Messages" })}
              value="55.9K"
              icon={"Ri/RiPulseLine"}
              color="green"
              trend={{ value: "+4%", up: true }}
            />
            <StatCard
              label={language({ id: "Selesai", en: "Completed" })}
              value="54%"
              icon={"Ri/RiCheckboxCircleLine"}
              color="cyan"
              trend={{ value: "-1.59%", up: false }}
            />
            <StatCard
              label={language({ id: "Tertunda", en: "Pending" })}
              value="2m 56s"
              icon={"Ri/RiTimeLine"}
              color="yellow"
              trend={{ value: "+7%", up: true }}
            />
            <StatCard
              label={language({ id: "Waktu", en: "Timing" })}
              value="3,782"
              icon={"Ri/RiTimerLine"}
              color="indigo"
              trend={{ value: "+11.01%", up: true }}
            />
            <StatCard
              label={language({ id: "Gagal", en: "Failed" })}
              value="874"
              icon={"Ri/RiAlertLine"}
              color="red"
              trend={{ value: "-4.5%", up: false }}
            />
          </div>

          {/* Row 2 — Statistics Area Chart + Monthly Target Gauge */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <WidgetAreaChart
                title={language({ id: "Statistik", en: "Statistics" })}
                subtitle={language({
                  id: "Target yang Anda tetapkan setiap bulan",
                  en: "Target you've set for each month",
                })}
                categories={MONTHS}
                series={[
                  {
                    name: language({ id: "Pendapatan", en: "Revenue" }),
                    data: [
                      180, 200, 175, 190, 160, 170, 150, 165, 185, 195, 210,
                      230,
                    ],
                    color: "#6366f1",
                  },
                  {
                    name: language({ id: "Pengeluaran", en: "Expenses" }),
                    data: [40, 55, 35, 50, 30, 45, 25, 35, 55, 50, 60, 65],
                    color: "#06b6d4",
                  },
                ]}
                summaryStats={[
                  {
                    label: language({
                      id: "Rata-rata Keuntungan Tahunan",
                      en: "Avg. Yearly Profit",
                    }),
                    value: "$212,142.12",
                    change: "+23.2%",
                    up: true,
                  },
                  {
                    label: language({
                      id: "Rata-rata Kerugian Tahunan",
                      en: "Avg. Yearly Loss",
                    }),
                    value: "$30,321.23",
                    change: "-12.3%",
                    up: false,
                  },
                ]}
                periodTabs={["Monthly", "Quarterly", "Annually"]}
                activePeriod={statsPeriod}
                onPeriodChange={setStatsPeriod}
                height={320}
              />
            </div>
            <WidgetGaugeChart
              title={language({
                id: "Target Bulanan",
                en: "Monthly Target",
              })}
              subtitle={language({
                id: "Target yang Anda tetapkan setiap bulan",
                en: "Target you've set for each month",
              })}
              value={75.55}
              max={100}
              label="%"
              color="#6366f1"
              height={180}
              bottomStats={[
                {
                  label: "Target",
                  value: "$20K",
                  change: "3.2%",
                  up: false,
                },
                {
                  label: language({ id: "Pendapatan", en: "Revenue" }),
                  value: "$20K",
                  change: "7.8%",
                  up: true,
                },
                {
                  label: language({ id: "Hari Ini", en: "Today" }),
                  value: "$20K",
                  change: "12%",
                  up: true,
                },
              ]}
            />
          </div>

          {/* Row 3 — Analytics Column Chart */}
          <WidgetColumnChart
            title={language({ id: "Analitik", en: "Analytics" })}
            subtitle={language({
              id: "Analitik pengunjung 30 hari terakhir",
              en: "Visitor analytics of last 30 days",
            })}
            categories={DAYS_30}
            series={[
              {
                name: language({ id: "Pengunjung", en: "Visitors" }),
                data: [
                  180, 350, 280, 320, 200, 240, 370, 300, 250, 220, 310, 260,
                  190, 280, 170, 210, 380, 340, 290, 150, 230, 270, 310, 350,
                  290, 200, 240, 330, 380, 360,
                ],
                color: "#6366f1",
              },
            ]}
            height={300}
            periodTabs={["Monthly", "Quarterly", "Annually"]}
            activePeriod={analyticsPeriod}
            onPeriodChange={setAnalyticsPeriod}
          />

          {/* Row 4 — Top Channels + Top Pages + Traffic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <WidgetTableList
              title={language({
                id: "Channel Teratas",
                en: "Top Channels",
              })}
              columns={{
                label: language({ id: "Sumber", en: "Source" }),
                key: "source",
              }}
              rows={[
                { source: "Google", value: "4.7K" },
                { source: "Facebook", value: "3.4K" },
                { source: "Instagram", value: "2.9K" },
                { source: "Twitter", value: "1.5K" },
              ]}
              footerLabel={language({
                id: "Laporan Channel",
                en: "Channels Report",
              })}
            />
            <WidgetTableList
              title={language({
                id: "Halaman Teratas",
                en: "Top Pages",
              })}
              columns={{
                label: language({ id: "Sumber", en: "Source" }),
                key: "value",
              }}
              rows={[
                { source: "app.example.com", value: "4.7K" },
                { source: "preview.example.com", value: "3.4K" },
                { source: "docs.example.com", value: "2.9K" },
                { source: "api.example.com", value: "1.5K" },
              ]}
              footerLabel={language({
                id: "Laporan Halaman",
                en: "Pages Report",
              })}
            />
            <WidgetTrafficStats
              title={language({
                id: "Statistik Traffic",
                en: "Traffic Stats",
              })}
              periodTabs={["Monthly", "Quarterly", "Annually"]}
              activePeriod={trafficPeriod}
              onPeriodChange={setTrafficPeriod}
              stats={[
                {
                  label: language({
                    id: "Pelanggan Baru",
                    en: "New Subscribers",
                  }),
                  value: "567K",
                  change: "3.85%",
                  up: true,
                  sparkData: [20, 35, 25, 45, 30, 40, 55, 50, 60],
                  color: "#10b981",
                },
                {
                  label: language({
                    id: "Tingkat Konversi",
                    en: "Conversion Rate",
                  }),
                  value: "276K",
                  change: "-5.39%",
                  up: false,
                  sparkData: [50, 40, 45, 35, 40, 30, 25, 28, 22],
                  color: "#ef4444",
                },
                {
                  label: language({
                    id: "Rasio Pentalan",
                    en: "Page Bounce Rate",
                  }),
                  value: "285",
                  change: "12.74%",
                  up: true,
                  sparkData: [10, 15, 20, 18, 25, 30, 35, 40, 50],
                  color: "#10b981",
                },
              ]}
            />
          </div>

          {/* Row 5 — Impression Area Chart + Progress List */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <WidgetAreaChart
                title={language({
                  id: "Impresi & Traffic Data",
                  en: "Impression & Data Traffic",
                })}
                subtitle="Jun 1, 2024 - Dec 1, 2025"
                categories={MONTHS}
                series={[
                  {
                    name: "Traffic",
                    data: [
                      120, 180, 165, 190, 150, 170, 140, 130, 145, 160, 175,
                      200,
                    ],
                    color: "#6366f1",
                  },
                ]}
                summaryStats={[
                  {
                    label: language({
                      id: "Total Pendapatan",
                      en: "Total Revenue",
                    }),
                    value: "$9,758.00",
                    change: "+7.96%",
                    up: true,
                  },
                ]}
                height={300}
              />
            </div>
            <WidgetProgressList
              title={language({
                id: "Estimasi Pendapatan",
                en: "Estimated Revenue",
              })}
              subtitle={language({
                id: "Target yang Anda tetapkan setiap bulan",
                en: "Target you've set for each month",
              })}
              items={[
                {
                  label: "Marketing",
                  value: 85,
                  amount: "$30,569.00",
                  color: "#6366f1",
                },
                {
                  label: "Sales",
                  value: 55,
                  amount: "$20,486.00",
                  color: "#6366f1",
                },
                {
                  label: "Operations",
                  value: 42,
                  amount: "$12,350.00",
                  color: "#06b6d4",
                },
              ]}
            />
          </div>

          {/* Row 6 — Donut Chart + Line Chart comparison */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <WidgetDonutChart
              title={language({
                id: "Kategori Penjualan",
                en: "Sales Category",
              })}
              data={[
                {
                  name: "Affiliate Program",
                  y: 2040,
                  detail: "2,040 Products",
                  color: "#6366f1",
                },
                {
                  name: "Direct Buy",
                  y: 1402,
                  detail: "1,402 Products",
                  color: "#10b981",
                },
                {
                  name: "Adsense",
                  y: 510,
                  detail: "510 Products",
                  color: "#f59e0b",
                },
              ]}
              centerLabel="Total 3.5K"
              centerValue="2450"
              height={200}
            />
            <WidgetLineChart
              title={language({ id: "Performa", en: "Performance" })}
              subtitle={language({
                id: "Perbandingan performa bulanan",
                en: "Monthly performance comparison",
              })}
              categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
              series={[
                {
                  name: language({ id: "Tahun Ini", en: "This Year" }),
                  data: [150, 180, 200, 220, 250, 280],
                  color: "#6366f1",
                },
                {
                  name: language({ id: "Tahun Lalu", en: "Last Year" }),
                  data: [120, 140, 160, 170, 190, 210],
                  color: "#3d3d5c",
                  dashStyle: "Dash",
                },
              ]}
              height={250}
            />
          </div>

          {/* Row 7 — Monthly Sales Column + Stacked Column */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <WidgetColumnChart
              title={language({
                id: "Penjualan Bulanan",
                en: "Monthly Sales",
              })}
              categories={MONTHS}
              series={[
                {
                  name: language({ id: "Penjualan", en: "Sales" }),
                  data: [
                    120, 160, 280, 320, 300, 250, 180, 290, 260, 350, 150, 80,
                  ],
                  color: "#6366f1",
                },
              ]}
              height={280}
            />
            <WidgetColumnChart
              title={language({
                id: "Dividen",
                en: "Dividend",
              })}
              categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
              series={[
                {
                  name: "Q1",
                  data: [80, 120, 300, 250, 180, 220],
                  color: "#6366f1",
                },
                {
                  name: "Q2",
                  data: [60, 180, 100, 150, 120, 160],
                  color: "#818cf8",
                },
              ]}
              stacked
              height={280}
            />
          </div>
        </Fragment>
      )}

      {/* Dynamic widget list from API */}
      {!(selectedRole === "" || selectedRole === "-") && (
        <div className="grid grid-cols-12 gap-4">
          {roleWidgets.length === 0 && (
            <div className="col-span-12 flex items-center justify-center py-12">
              <p className="text-sm text-dark-400">
                {language({ id: "Belum ada widget", en: "No widgets yet" })}
              </p>
            </div>
          )}
          {roleWidgets.map((rw) => {
            const widgetDef = widgets.find((w) => w.key === rw.function_key);

            const m = rw.col?.mobile || 12;
            const t = rw.col?.tablet || 6;
            const l = rw.col?.laptop || 4;
            const d = rw.col?.desktop || 3;

            const colClass = `${spanMap[m] || "col-span-12"} ${mdMap[t] || "md:col-span-6"} ${lgMap[l] || "lg:col-span-4"} ${xlMap[d] || "xl:col-span-3"}`;

            return (
              <div key={rw.id} className={`relative group ${colClass}`}>
                {/* SU edit/delete controls */}
                {user?.role === "su" && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(rw)}
                      className="p-1.5 rounded-lg bg-dark-700/80 backdrop-blur-sm text-dark-300 hover:text-accent-400 hover:bg-dark-600/80 transition-all"
                      title={language({ id: "Edit", en: "Edit" })}
                    >
                      <IconComponent
                        iconName="Ri/RiEditLine"
                        className="w-4 h-4"
                      />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingWidget(rw);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-dark-700/80 backdrop-blur-sm text-dark-300 hover:text-neon-red hover:bg-dark-600/80 transition-all"
                      title={language({ id: "Hapus", en: "Delete" })}
                    >
                      <IconComponent
                        iconName="Ri/RiDeleteBinLine"
                        className="w-4 h-4"
                      />
                    </button>
                  </div>
                )}
                {/* Widget Component */}
                <div className="h-full bg-dark-800/60 border border-dark-600/40 rounded-2xl overflow-hidden relative">
                  {(() => {
                    const widgetData = liveWidgetsData[rw.id];

                    if (!widgetData) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full min-h-50 text-dark-400 p-5">
                          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mb-4"></span>
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            {rw.label}
                          </h3>
                          {rw.description && (
                            <p className="text-xs text-dark-400">
                              {rw.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    switch (rw.type) {
                      case "timeline":
                        return (
                          <WidgetAreaChart
                            title={rw.label}
                            subtitle={rw.description}
                            {...(widgetData as unknown as {
                              categories: string[];
                              series: AreaChartSeries[];
                            })}
                          />
                        );
                      case "bar":
                        return (
                          <WidgetColumnChart
                            title={rw.label}
                            subtitle={rw.description}
                            {...(widgetData as unknown as {
                              categories: string[];
                              series: AreaChartSeries[];
                            })}
                          />
                        );
                      case "gauge":
                        return (
                          <WidgetGaugeChart
                            title={rw.label}
                            subtitle={rw.description}
                            {...(widgetData as unknown as {
                              value: number;
                              max: number;
                              label: string;
                              color: string;
                              height: number;
                            })}
                          />
                        );
                      case "pie":
                        return (
                          <WidgetDonutChart
                            title={rw.label}
                            subtitle={rw.description}
                            {...(widgetData as unknown as {
                              data: { name: string; y: number }[];
                              height: number;
                            })}
                          />
                        );
                      case "table":
                        return (
                          <WidgetTableList
                            title={rw.label}
                            {...(widgetData as unknown as {
                              columns: {
                                label: string;
                                key: "source" | "value";
                              };
                              rows: TableRow[];
                              height: number;
                            })}
                          />
                        );
                      case "progress":
                        return (
                          <WidgetProgressList
                            title={rw.label}
                            subtitle={rw.description}
                            {...(widgetData as unknown as {
                              items: {
                                label: string;
                                value: number;
                                color: string;
                              }[];
                              height: number;
                            })}
                          />
                        );
                      case "traffic":
                        return (
                          <WidgetTrafficStats
                            title={rw.label}
                            {...(widgetData as unknown as {
                              stats: SparklineStat[];
                              periodTabs?: string[];
                              activePeriod?: string;
                            })}
                          />
                        );
                      case "line":
                        return (
                          <WidgetLineChart
                            title={rw.label}
                            subtitle={rw.description}
                            {...(widgetData as unknown as {
                              categories: string[];
                              series: {
                                name: string;
                                data: number[];
                                color?: string;
                                dashStyle?: string;
                              }[];
                            })}
                          />
                        );
                      default:
                        return (
                          <div className="p-5">
                            <p className="text-red-500">
                              Unknown widget type: {rw.type}
                            </p>
                          </div>
                        );
                    }
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Widget Modal */}
      <Dialog open={addModalOpen} onClose={() => {}}>
        <DialogContent
          onClose={() => {
            setAddModalOpen(false);
            resetForm();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Tambah Widget", en: "Add Widget" })}
            </DialogTitle>
            <DialogDescription>
              {addStep === 1
                ? language({
                    id: "Pilih jenis widget untuk ditambahkan",
                    en: "Select widget type to add",
                  })
                : language({
                    id: "Konfigurasi detail widget",
                    en: "Configure widget details",
                  })}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper indicator */}
          <Stepper
            currentStep={addStep}
            labels={[
              language({ id: "Pilih Widget", en: "Select Widget" }),
              language({ id: "Pilih Fungsi", en: "Select Function" }),
              language({ id: "Konfigurasi", en: "Configure" }),
            ]}
          />

          <div className="min-h-75">
            {addStep === 1 ? (
              <div className="grid grid-cols-2 gap-3 max-h-100 overflow-y-auto p-1 animate-fade-in">
                {widgets.map((w) => (
                  <button
                    key={w.key}
                    onClick={() => {
                      setSelectedWidgetKey(w.key);
                      setAddStep(2);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedWidgetKey === w.key
                        ? "border-accent-500 bg-accent-500/10 text-foreground"
                        : "border-dark-600/40 bg-dark-700/30 text-dark-300 hover:border-dark-500/60 hover:text-foreground"
                    }`}
                  >
                    <p className="text-sm font-semibold">{w.label}</p>
                  </button>
                ))}
              </div>
            ) : addStep === 2 ? (
              <div className="grid grid-cols-2 gap-3 max-h-100 overflow-y-auto p-1 animate-fade-in">
                {(() => {
                  const selectedWidget = widgets.find(
                    (w) => w.key === selectedWidgetKey,
                  );
                  const funcs =
                    selectedWidget && functionsData[selectedWidget.key]
                      ? functionsData[selectedWidget.key]
                      : [];
                  if (funcs.length === 0) {
                    return (
                      <div className="col-span-2 text-center py-8 text-dark-400">
                        {language({
                          id: "Tidak ada fungsi tersedia",
                          en: "No functions available",
                        })}
                      </div>
                    );
                  }
                  return funcs.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        setSelectedFunctionKey(f.key);
                        setAddStep(3);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedFunctionKey === f.key
                          ? "border-accent-500 bg-accent-500/10 text-foreground"
                          : "border-dark-600/40 bg-dark-700/30 text-dark-300 hover:border-dark-500/60 hover:text-foreground"
                      }`}
                    >
                      <p className="text-sm font-semibold">{f.label}</p>
                      <p className="text-xs text-dark-400 mt-1 uppercase tracking-wider">
                        {f.key}
                      </p>
                    </button>
                  ));
                })()}
              </div>
            ) : (
              <div className="animate-fade-in">
                <DynamicForm
                  fields={addWidgetFields}
                  formData={addFormData}
                  onChange={(key, value) =>
                    setAddFormData((prev) => ({ ...prev, [key]: value }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 border-t border-dark-600/30 pt-4">
            {addStep > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setAddStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="mr-auto"
              >
                {language({ id: "Kembali", en: "Back" })}
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setAddModalOpen(false);
                  resetForm();
                }}
              >
                {language({ id: "Batal", en: "Cancel" })}
              </Button>
            )}

            {addStep === 3 && (
              <Button
                onClick={handleCreate}
                disabled={!addFormData.key || !addFormData.label}
              >
                {language({ id: "Tambah", en: "Add" })}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Widget Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Edit Widget", en: "Edit Widget" })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                {language({ id: "Label", en: "Label" })}
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/40 text-foreground text-sm focus:outline-none focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                {language({ id: "Deskripsi", en: "Description" })}
              </label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/40 text-foreground text-sm focus:outline-none focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-700/50 border border-dark-600/40 text-foreground text-sm focus:outline-none focus:border-accent-500"
              >
                {widgets.map((w) => (
                  <option key={w.key} value={w.key}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-2 uppercase tracking-wider">
                {language({
                  id: "Lebar Kolom Responsif",
                  en: "Responsive Column Width",
                })}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {(
                  [
                    {
                      key: "mobile" as const,
                      label: "Mobile",
                      icon: "📱",
                      desc: "≤ 425px",
                    },
                    {
                      key: "tablet" as const,
                      label: "Tablet",
                      icon: "📋",
                      desc: "768px",
                    },
                    {
                      key: "laptop" as const,
                      label: "Laptop",
                      icon: "💻",
                      desc: "1024px",
                    },
                    {
                      key: "desktop" as const,
                      label: "Large",
                      icon: "🖥️",
                      desc: "≥ 1440px",
                    },
                  ] as const
                ).map((bp) => (
                  <div
                    key={bp.key}
                    className="bg-dark-900/60 border border-dark-600/40 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{bp.icon}</span>
                        <span className="text-xs font-semibold text-dark-200">
                          {bp.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded">
                        {formColObj[bp.key]}/12
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      step={1}
                      value={formColObj[bp.key]}
                      onChange={(e) =>
                        setFormColObj((prev) => ({
                          ...prev,
                          [bp.key]: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-500"
                    />
                    <div className="flex justify-between mt-1 text-[9px] text-dark-500">
                      <span>1</span>
                      <span>6</span>
                      <span>12</span>
                    </div>
                    <p className="text-[9px] text-dark-500 mt-1 text-center">
                      {bp.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button onClick={handleEdit}>
              {language({ id: "Simpan", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language({ id: "Hapus Widget", en: "Delete Widget" })}
            </DialogTitle>
            <DialogDescription>
              {language({
                id: `Apakah Anda yakin ingin menghapus widget "${deletingWidget?.label}"?`,
                en: `Are you sure you want to delete widget "${deletingWidget?.label}"?`,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              {language({ id: "Batal", en: "Cancel" })}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {language({ id: "Hapus", en: "Delete" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
