import { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface DonutSlice {
  name: string;
  y: number;
  color?: string;
  detail?: string;
}

interface WidgetDonutChartProps {
  title: string;
  subtitle?: string;
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}

export default function WidgetDonutChart({
  title,
  subtitle,
  data,
  height = 280,
  centerLabel,
  centerValue,
}: WidgetDonutChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      chartRef.current?.chart?.reflow();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const defaultColors = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
  ];

  const options: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height,
      style: { fontFamily: "Inter, sans-serif" },
    },
    title: { text: undefined },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: "#1a1a2e",
      borderColor: "#232340",
      style: { color: "#ffffff" },
      pointFormat: "<b>{point.percentage:.1f}%</b><br/>{point.y:,.0f}",
    },
    plotOptions: {
      pie: {
        innerSize: "65%",
        borderWidth: 0,
        borderRadius: 4,
        dataLabels: { enabled: false },
        showInLegend: false,
        states: {
          hover: {
            brightness: 0.1,
            halo: { size: 5 },
          },
        },
      },
    },
    series: [
      {
        type: "pie" as const,
        name: title,
        data: data.map((d, i) => ({
          name: d.name,
          y: d.y,
          color: d.color ?? defaultColors[i % defaultColors.length],
        })),
      },
    ],
  };

  const total = data.reduce((acc, d) => acc + d.y, 0);

  return (
    <div className="bg-dark-800 border border-dark-600/40 rounded-2xl overflow-hidden p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}

      <div className="flex items-center gap-4 mt-2">
        <div className="relative shrink-0 w-[160px]">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartRef}
          />
          {/* Center label overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-dark-400">
              {centerLabel ?? "Total"}
            </span>
            <span className="text-lg font-bold text-foreground">
              {centerValue ?? total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div className="flex-1 space-y-3">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    d.color ?? defaultColors[i % defaultColors.length],
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {d.name}
                </p>
                <p className="text-xs text-dark-400">
                  {total > 0 ? ((d.y / total) * 100).toFixed(0) : 0}%
                  {d.detail && ` · ${d.detail}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
