import { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsMoreModule from "highcharts/highcharts-more";
import HighchartsSolidGaugeModule from "highcharts/modules/solid-gauge";
import HighchartsReact from "highcharts-react-official";

// Initialize Highcharts modules (handle both ESM default and CJS)
const HighchartsMore =
  // @ts-ignore
  (HighchartsMoreModule as unknown).default ?? HighchartsMoreModule;
const HighchartsSolidGauge =
  // @ts-ignore
  (HighchartsSolidGaugeModule as unknown).default ?? HighchartsSolidGaugeModule;
if (typeof HighchartsMore === "function") HighchartsMore(Highcharts);
if (typeof HighchartsSolidGauge === "function")
  HighchartsSolidGauge(Highcharts);

interface WidgetGaugeChartProps {
  title: string;
  subtitle?: string;
  value: number;
  max?: number;
  label?: string;
  color?: string;
  height?: number;
  /** Bottom row summary items */
  bottomStats?: {
    label: string;
    value: string;
    change?: string;
    up?: boolean;
  }[];
}

export default function WidgetGaugeChart({
  title,
  subtitle,
  value,
  max = 100,
  label,
  color = "#6366f1",
  height = 200,
  bottomStats,
}: WidgetGaugeChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      chartRef.current?.chart?.reflow();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const options: Highcharts.Options = {
    chart: {
      type: "solidgauge",
      backgroundColor: "transparent",
      height,
      style: { fontFamily: "Inter, sans-serif" },
    },
    title: { text: undefined },
    credits: { enabled: false },
    pane: {
      center: ["50%", "70%"],
      size: "120%",
      startAngle: -90,
      endAngle: 90,
      background: [
        {
          backgroundColor: "#1a1a2e",
          innerRadius: "75%",
          outerRadius: "100%",
          shape: "arc",
          borderWidth: 0,
        },
      ],
    },
    yAxis: {
      min: 0,
      max,
      stops: [[1, color]],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: undefined,
      labels: { enabled: false },
    },
    tooltip: { enabled: false },
    plotOptions: {
      solidgauge: {
        // @ts-ignore
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          y: -25,
          borderWidth: 0,
          useHTML: true,
          format: `<div style="text-align:center"><span style="font-size:28px;font-weight:700;color:#fff">{y}${label ?? ""}</span></div>`,
        },
        rounded: true,
        innerRadius: "75%",
      },
    },
    series: [
      {
        type: "solidgauge" as const,
        name: title,
        data: [value],
        color,
      },
    ],
  };

  return (
    <div className="bg-dark-800 border border-dark-600/40 rounded-2xl overflow-hidden p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
      {bottomStats && bottomStats.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-2 pt-3 border-t border-dark-600/40">
          {bottomStats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-dark-400 mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              {stat.change && (
                <span
                  className={`text-xs font-semibold ${stat.up ? "text-neon-green" : "text-neon-red"}`}
                >
                  {stat.up ? "↑" : "↓"} {stat.change}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
