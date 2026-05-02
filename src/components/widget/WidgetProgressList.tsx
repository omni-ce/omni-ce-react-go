interface ProgressItem {
  label: string;
  value: number;
  amount?: string;
  color?: string;
}

interface WidgetProgressListProps {
  title: string;
  subtitle?: string;
  items: ProgressItem[];
}

export default function WidgetProgressList({
  title,
  subtitle,
  items,
}: WidgetProgressListProps) {
  const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl overflow-hidden p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-foreground font-medium">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                {item.amount && (
                  <span className="text-sm font-semibold text-foreground">
                    {item.amount}
                  </span>
                )}
                <span className="text-xs text-dark-400">{item.value}%</span>
              </div>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(item.value, 100)}%`,
                  backgroundColor:
                    item.color || defaultColors[i % defaultColors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
