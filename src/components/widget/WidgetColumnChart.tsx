import { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface ColumnChartSeries {
  name: string;
  data: number[];
  color?: string;
}

interface WidgetColumnChartProps {
  title: string;
  subtitle?: string;
  categories: string[];
  series: ColumnChartSeries[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  stacked?: boolean;
  periodTabs?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export default function WidgetColumnChart({
  title,
  subtitle,
  categories,
  series,
  height = 280,
  valuePrefix = "",
  valueSuffix = "",
  stacked = false,
  periodTabs,
  activePeriod,
  onPeriodChange,
}: WidgetColumnChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      chartRef.current?.chart.reflow();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      height,
      style: { fontFamily: "Inter, sans-serif" },
      spacingTop: 10,
      spacingBottom: 0,
    },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: {
      categories,
      labels: {
        style: { color: "#6b6b8a", fontSize: "11px" },
      },
      lineColor: "#232340",
      tickColor: "transparent",
    },
    yAxis: {
      title: { text: undefined },
      labels: {
        style: { color: "#6b6b8a", fontSize: "11px" },
      },
      gridLineColor: "#232340",
      gridLineDashStyle: "Dash",
      stackLabels: stacked
        ? {
            enabled: true,
            style: { color: "#9d9db5", fontSize: "10px", fontWeight: "600" },
          }
        : undefined,
    },
    tooltip: {
      shared: true,
      backgroundColor: "#1a1a2e",
      borderColor: "#232340",
      style: { color: "#ffffff" },
      valuePrefix,
      valueSuffix,
    },
    legend: {
      enabled: series.length > 1,
      itemStyle: { color: "#9d9db5" },
      itemHoverStyle: { color: "#ffffff" },
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        borderWidth: 0,
        stacking: stacked ? "normal" : undefined,
        groupPadding: 0.15,
        pointPadding: 0.05,
      },
    },
    series: series.map((s) => ({
      type: "column" as const,
      name: s.name,
      data: s.data,
      color: s.color ?? "#6366f1",
    })),
  };

  return (
    <div className="bg-dark-800 border border-dark-600/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {periodTabs && (
          <div className="flex items-center bg-dark-900 rounded-lg p-0.5 border border-dark-600/40 shrink-0">
            {periodTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onPeriodChange?.(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activePeriod === tab
                    ? "bg-dark-700 text-foreground shadow-sm"
                    : "text-dark-400 hover:text-dark-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="px-2 pb-2">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartRef}
        />
      </div>
    </div>
  );
}
