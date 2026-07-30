import type { Metric } from "../_hooks/useAnalyticsData";

export default function MetricCard({ metric }: { metric: Metric }) {
  const isPositive = metric.change > 0;
  
  // Choose colors based on the icon for variety, matching the design
  let iconBg = "bg-primary-fixed";
  let iconColor = "text-on-primary-fixed";
  
  if (metric.icon === "visibility") {
    iconBg = "bg-secondary-fixed";
    iconColor = "text-on-secondary-fixed";
  } else if (metric.icon === "ads_click") {
    iconBg = "bg-tertiary-fixed";
    iconColor = "text-on-tertiary-fixed";
  } else if (metric.icon === "group") {
    iconBg = "bg-surface-container-highest";
    iconColor = "text-on-surface";
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm transition-transform hover:-translate-y-1 duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined p-2 rounded-lg ${iconBg} ${iconColor}`}>
          {metric.icon}
        </span>
        <span 
          className={`text-[11px] font-bold px-2 py-1 rounded-full ${
            isPositive ? "text-primary bg-primary/10" : "text-error bg-error-container/50"
          }`}
        >
          {isPositive ? "+" : ""}{metric.change}%
        </span>
      </div>
      <p className="text-body-sm text-on-surface-variant mb-1 font-medium">{metric.label}</p>
      <h3 className="text-2xl font-bold font-headline tracking-tight text-on-surface">{metric.value}</h3>
    </div>
  );
}
