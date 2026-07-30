"use client";

import { useAnalyticsData } from "../_hooks/useAnalyticsData";

export default function RevenueChart() {
  const { revenueChart, audienceOrigins } = useAnalyticsData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-headline font-bold text-lg text-primary">Hiệu suất Doanh thu</h4>
          <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-full"></span> Kỳ này
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-outline-variant rounded-full"></span> Kỳ trước
            </span>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 group">
          {revenueChart.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-outline-variant/20 rounded-t-sm h-32 relative">
                <div 
                  className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-1000 ease-out hover:opacity-80" 
                  style={{ height: `${day.value}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-on-surface-variant font-label-md">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
        <h4 className="font-headline font-bold text-lg text-primary mb-6">Nguồn khách hàng</h4>
        <div className="space-y-6 flex-1 flex flex-col justify-center">
          {audienceOrigins.map((origin, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-body-sm mb-2">
                <span className="font-medium text-on-surface">{origin.country}</span>
                <span className="text-on-surface-variant font-bold">{origin.percentage}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div 
                  className={`${origin.color} h-full rounded-full`} 
                  style={{ width: `${origin.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
