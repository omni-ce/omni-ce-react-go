import { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface SparklineStat {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
  sparkData: number[];
  color?: string;
}

interface WidgetTrafficStatsProps {
  title: string;
  stats: SparklineStat[];
  periodTabs?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
}

function MiniSparkline({
  data,
  color = "#10b981",
  width = 80,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
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
      width,
      height,
      margin: [2, 0, 2, 0],
      style: { overflow: "visible" },
    },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { visible: false },
    yAxis: { visible: false },
    legend: { enabled: false },
    tooltip: { enabled: false },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.15,
        lineWidth: 1.5,
        marker: { enabled: false },
        enableMouseTracking: false,
      },
    },
    series: [
      {
        type: "areaspline" as const,
        data,
        color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, Highcharts.color(color).setOpacity(0.25).get("rgba") as string],
            [1, Highcharts.color(color).setOpacity(0).get("rgba") as string],
          ],
        },
      },
    ],
  };

  return (
    <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
  );
}

export default function WidgetTrafficStats({
  title,
  stats,
  periodTabs,
  activePeriod,
  onPeriodChange,
}: WidgetTrafficStatsProps) {
  return (
    <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl overflow-hidden p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      {periodTabs && (
        <div className="flex items-center bg-dark-900/60 rounded-lg p-0.5 border border-dark-600/40 mb-5">
          {periodTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onPeriodChange?.(tab)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all text-center ${
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

      <div className="space-y-5">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              {stat.change && (
                <p
                  className={`text-xs font-semibold mt-0.5 ${stat.up ? "text-neon-green" : "text-neon-red"}`}
                >
                  {stat.up ? "+" : ""}
                  {stat.change}{" "}
                  <span className="text-dark-400 font-normal">
                    then last week
                  </span>
                </p>
              )}
              <p className="text-xs text-dark-400 mt-0.5">{stat.label}</p>
            </div>
            <div className="shrink-0">
              <MiniSparkline
                data={stat.sparkData}
                color={stat.color || (stat.up ? "#10b981" : "#ef4444")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
