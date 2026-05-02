import { Fragment, useEffect, useState } from "react";
import {
  RiPulseLine,
  RiInboxLine,
  RiTimeLine,
  RiAlertLine,
  RiTimerLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";

import satellite from "@/lib/satellite";
import StatCard from "@/components/StatCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useLanguageStore } from "@/stores/languageStore";
import type { Response } from "@/types/response";
import type { Option } from "@/types/option";
import { DAYS_30, MONTHS } from "@/dummy";

// Highcharts Widgets
import WidgetAreaChart from "@/components/widget/WidgetAreaChart";
import WidgetColumnChart from "@/components/widget/WidgetColumnChart";
import WidgetGaugeChart from "@/components/widget/WidgetGaugeChart";
import WidgetDonutChart from "@/components/widget/WidgetDonutChart";
import WidgetTrafficStats from "@/components/widget/WidgetTrafficStats";
import WidgetTableList from "@/components/widget/WidgetTableList";
import WidgetProgressList from "@/components/widget/WidgetProgressList";
import WidgetLineChart from "@/components/widget/WidgetLineChart";
import { Button } from "@/components/ui/Button";

const widgets = [
  {
    label: "Chart Area",
    key: "chart_area",
    type: "timeline",
    element: WidgetAreaChart,
    /**
Example Response:
  {
    "data": {
      "x_type": "month",
      "rows": [
        {
          "x": 1, // Jan
          "y": 100
        }
      ]
    }
  }
     */
  },
  {
    label: "Chart Column",
    key: "chart_column",
    type: "bar",
    element: WidgetColumnChart,
  },
  {
    label: "Chart Gauge",
    key: "chart_gauge",
    type: "gauge",
    element: WidgetGaugeChart,
  },
  {
    label: "Chart Donut",
    key: "chart_donut",
    type: "pie",
    element: WidgetDonutChart,
  },
  {
    label: "Table List",
    key: "chart_table",
    type: "table",
    element: WidgetTableList,
  },
  {
    label: "Progress List",
    key: "chart_progress",
    type: "progress",
    element: WidgetProgressList,
  },
  {
    label: "Traffic Stats",
    key: "chart_traffic",
    type: "traffic",
    element: WidgetTrafficStats,
  },
  {
    label: "Chart Line",
    key: "chart_line",
    type: "line",
    element: WidgetLineChart,
  },
];

interface DashboardPageProps {}
export default function DashboardPage({}: DashboardPageProps) {
  const { fetchStats } = useDashboardStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const [roles, setRoles] = useState<Option[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    setLoadingRoles(true);
    satellite
      .get<Response<Option[]>>("/api/option/roles")
      .then((res) => {
        setRoles(res.data.data || []);
      })
      .catch((err) => console.error("Failed to fetch roles:", err))
      .finally(() => setLoadingRoles(false));
  }, []);

  // Period state for charts
  const [statsPeriod, setStatsPeriod] = useState("Monthly");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("Monthly");
  const [trafficPeriod, setTrafficPeriod] = useState("Monthly");

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
          {!(selectedRole === "" || selectedRole === "-") && (
            <Button
              // onClick={() => setAddWidgetOpen(true)}
              className="shrink-0 whitespace-nowrap"
            >
              {language({ id: "Tambah Widget", en: "Add Widget" })}
            </Button>
          )}

          {/* Select Role on SU */}
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
              icon={RiInboxLine}
              color="indigo"
              trend={{ value: "+20%", up: true }}
            />
            <StatCard
              label={language({ id: "Total Pesan", en: "Total Messages" })}
              value="55.9K"
              icon={RiPulseLine}
              color="green"
              trend={{ value: "+4%", up: true }}
            />
            <StatCard
              label={language({ id: "Selesai", en: "Completed" })}
              value="54%"
              icon={RiCheckboxCircleLine}
              color="cyan"
              trend={{ value: "-1.59%", up: false }}
            />
            <StatCard
              label={language({ id: "Tertunda", en: "Pending" })}
              value="2m 56s"
              icon={RiTimeLine}
              color="yellow"
              trend={{ value: "+7%", up: true }}
            />
            <StatCard
              label={language({ id: "Waktu", en: "Timing" })}
              value="3,782"
              icon={RiTimerLine}
              color="indigo"
              trend={{ value: "+11.01%", up: true }}
            />
            <StatCard
              label={language({ id: "Gagal", en: "Failed" })}
              value="874"
              icon={RiAlertLine}
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
    </div>
  );
}
