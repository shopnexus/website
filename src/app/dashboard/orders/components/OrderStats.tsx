export interface OrderStats {
  stat1Value: string | number;
  stat2Label: string;
  stat2Value: string | number;
  stat3Label: string;
  stat3Value: string;
}

interface OrderStatsProps {
  stats: OrderStats;
}

export default function OrderStatsCard({ stats }: OrderStatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between h-32 hover:border-primary/30 transition-colors">
        <span className="text-sm font-medium text-on-surface-variant">Chờ lấy hàng</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-primary">{stats.stat1Value}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Đơn</span>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between h-32 hover:border-primary/30 transition-colors">
        <span className="text-sm font-medium text-on-surface-variant">{stats.stat2Label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-on-surface">{stats.stat2Value}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Đơn</span>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between h-32 hover:border-primary/30 transition-colors">
        <span className="text-sm font-medium text-on-surface-variant">{stats.stat3Label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-on-surface truncate">{stats.stat3Value}</span>
        </div>
      </div>
    </section>
  );
}
