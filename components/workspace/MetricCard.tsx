import type { LucideIcon } from "lucide-react";
export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        {Icon && <Icon aria-hidden="true" />}
      </div>
      <strong>{value}</strong>
      {note && <p>{note}</p>}
    </div>
  );
}
