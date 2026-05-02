import { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface AreaChartSeries {
  name: string;
  data: number[];
  color?: string;
}

interface WidgetAreaChartProps {
  title: string;
  subtitle?: string;
  categories: string[];
  series: AreaChartSeries[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  /** Show period toggle buttons */
  periodTabs?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  /** Summary stats shown above chart */
  summaryStats?: {
    label: string;
    value: string;
    change?: string;
    up?: boolean;
  }[];
}

export default function WidgetAreaChart({
  title,
  subtitle,
  categories,
  series,
  height = 300,
  valuePrefix = "",
  valueSuffix = "",
  periodTabs,
  activePeriod,
  onPeriodChange,
  summaryStats,
}: WidgetAreaChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      chartRef.current?.chart?.reflow();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const options: Highcharts.Options = {
    chart: {
      type: "areaspline",
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
        formatter: function () {
          return valuePrefix + Highcharts.numberFormat(this.value as number, 0) + valueSuffix;
        },
      },
      gridLineColor: "#232340",
      gridLineDashStyle: "Dash",
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
      areaspline: {
        fillOpacity: 0.15,
        lineWidth: 2.5,
        marker: {
          enabled: false,
          symbol: "circle",
          radius: 3,
          states: { hover: { enabled: true } },
        },
        states: {
          hover: { lineWidth: 3 },
        },
      },
    },
    series: series.map((s) => ({
      type: "areaspline" as const,
      name: s.name,
      data: s.data,
      color: s.color || "#6366f1",
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, Highcharts.color(s.color || "#6366f1").setOpacity(0.3).get("rgba") as string],
          [1, Highcharts.color(s.color || "#6366f1").setOpacity(0.02).get("rgba") as string],
        ],
      },
    })),
  };

  return (
    <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>
          )}
          {summaryStats && summaryStats.length > 0 && (
            <div className="flex items-center gap-6 mt-3">
              {summaryStats.map((stat, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    {stat.change && (
                      <span
                        className={`text-xs font-semibold ${stat.up ? "text-neon-green" : "text-neon-red"}`}
                      >
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-dark-400">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {periodTabs && (
          <div className="flex items-center bg-dark-900/60 rounded-lg p-0.5 border border-dark-600/40 shrink-0">
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
