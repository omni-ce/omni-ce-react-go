import { IconComponent } from "@/components/ui/IconSelector";

export default function StatCard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: { value: string; up: boolean };
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-card-pale-blue text-accent-500 border-accent-500/20",
    green: "bg-card-mint/30 text-neon-green border-neon-green/20",
    cyan: "bg-card-ice text-neon-cyan border-neon-cyan/20",
    yellow: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20",
    red: "bg-neon-red/10 text-neon-red border-neon-red/20",
  };

  return (
    <div className="bg-dark-900 border border-dark-600/40 rounded-3xl p-5 hover:shadow-[0_2px_48px_rgba(205,208,223,0.4)] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}
        >
          <IconComponent iconName={icon} className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${trend.up ? "text-neon-green" : "text-neon-red"}`}
          >
            {trend.up ? (
              <IconComponent iconName="Ri/RiArrowUpLine" className="w-3 h-3" />
            ) : (
              <IconComponent
                iconName="Ri/RiArrowDownLine"
                className="w-3 h-3"
              />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-dark-400 mt-1">{label}</p>
    </div>
  );
}
