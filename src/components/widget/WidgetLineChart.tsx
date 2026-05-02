import { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface WidgetLineChartProps {
  title: string;
  subtitle?: string;
  categories: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
    dashStyle?: string;
  }[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function WidgetLineChart({
  title,
  subtitle,
  categories,
  series,
  height = 280,
  valuePrefix = "",
  valueSuffix = "",
}: WidgetLineChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      chartRef.current?.chart?.reflow();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const options: Highcharts.Options = {
    chart: {
      type: "spline",
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
      spline: {
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
      type: "spline" as const,
      name: s.name,
      data: s.data,
      color: s.color || "#6366f1",
      dashStyle: (s.dashStyle as Highcharts.DashStyleValue) || "Solid",
    })),
  };

  return (
    <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>
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
