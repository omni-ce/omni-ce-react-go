export interface TableRow {
  source: string;
  value: string;
}

interface WidgetTableListProps {
  title: string;
  columns: { label: string; key: "source" | "value" };
  rows: TableRow[];
  footerLabel?: string;
  onFooterClick?: () => void;
}

export default function WidgetTableList({
  title,
  columns,
  rows,
  footerLabel,
  onFooterClick,
}: WidgetTableListProps) {
  return (
    <div className="bg-dark-800 border border-dark-600/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between text-xs text-dark-400 pb-2 border-b border-dark-600/30">
          <span>{columns.label}</span>
          <span>{columns.key === "source" ? "Source" : columns.label}</span>
        </div>
        <div className="divide-y divide-dark-600/20">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 hover:bg-dark-700/20 transition-colors -mx-5 px-5"
            >
              <span className="text-sm text-foreground truncate">
                {row.source}
              </span>
              <span className="text-sm font-semibold text-foreground shrink-0 ml-4">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {footerLabel && (
        <button
          onClick={onFooterClick}
          className="w-full py-3 text-sm text-dark-400 hover:text-foreground border-t border-dark-600/30 flex items-center justify-center gap-1.5 transition-colors"
        >
          {footerLabel} <span className="text-base">→</span>
        </button>
      )}
    </div>
  );
}
