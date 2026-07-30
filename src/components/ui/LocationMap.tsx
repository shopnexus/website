"use client";

import React from "react";

import { useMapLocation } from "@/hooks/useMapLocation";

export default function LocationMap(): React.ReactElement {
  const { coords, isLoading, error, mapUrl, refreshLocation } = useMapLocation();

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-outline-variant/20 shadow-inner group bg-surface-container-low">
      {isLoading ? (
        <div className="w-full h-full bg-surface-container-high animate-pulse flex flex-col items-center justify-center gap-2 p-4 text-center">
          <span className="material-symbols-outlined text-primary text-2xl animate-spin" aria-hidden="true">
            progress_activity
          </span>
          <span className="text-label-sm text-on-surface-variant italic">
            Đang tải bản đồ & định vị khu vực của bạn...
          </span>
        </div>
      ) : error || !coords || !mapUrl ? (
        <div className="w-full h-full bg-surface-container-high/60 flex items-center justify-center p-4 animate-fade-in">
          <button
            type="button"
            onClick={refreshLocation}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-label-md hover:bg-primary/90 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              my_location
            </span>
            <span>Cấp quyền & Thử lại</span>
          </button>
        </div>
      ) : (
        <iframe
          title="Bản đồ khu vực của bạn"
          src={mapUrl}
          className="w-full h-full border-0 transition-opacity duration-300"
          loading="lazy"
        />
      )}

      {coords && mapUrl && !isLoading && !error && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-outline-variant/30 flex items-center gap-1.5 pointer-events-auto">
            <span className="material-symbols-outlined text-primary text-sm" aria-hidden="true">
              my_location
            </span>
            <span className="text-label-sm font-bold text-on-surface truncate max-w-[140px]">
              {coords.label}
            </span>
          </div>

          <button
            type="button"
            onClick={refreshLocation}
            title="Cập nhật lại vị trí bản đồ"
            aria-label="Cập nhật lại vị trí bản đồ"
            className="bg-surface/90 backdrop-blur-md p-1.5 rounded-md shadow-sm border border-outline-variant/30 text-on-surface hover:text-primary transition-colors cursor-pointer pointer-events-auto flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              refresh
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
