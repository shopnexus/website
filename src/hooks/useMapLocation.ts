"use client";

import { useState, useEffect, useCallback } from "react";

export interface Coordinates {
  lat: number;
  lon: number;
  label: string;
}

export interface UseMapLocationReturn {
  coords: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  mapUrl: string | null;
  refreshLocation: () => void;
}

export function useMapLocation(): UseMapLocationReturn {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateCoordinates = useCallback((lat: number, lon: number, label: string): void => {
    setCoords({ lat, lon, label });
    setError(null);
    setIsLoading(false);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("shopnexus:last-detected-location", label);
      } catch {}
      window.dispatchEvent(
        new CustomEvent("shopnexus:location-detected", { detail: { label } })
      );
    }
  }, []);

  const runDetection = useCallback(
    (isManual: boolean): void => {
      if (isManual) {
        setIsLoading(true);
        setError(null);
      }

      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
                { headers: { "Accept-Language": "vi,en" } }
              );
              const data = await res.json();
              const address = data?.address || {};
              const cityName =
                address.city ||
                address.state ||
                address.province ||
                address.town ||
                address.county ||
                "Vị trí của bạn";

              const cleanName = cityName
                .replace(/^Thành phố\s+/i, "TP. ")
                .replace(/^Tỉnh\s+/i, "")
                .replace(/^Thủ đô\s+/i, "")
                .trim();

              updateCoordinates(latitude, longitude, cleanName);
            } catch {
              updateCoordinates(pos.coords.latitude, pos.coords.longitude, "Vị trí GPS của bạn");
            }
          },
          (err) => {
            if (err.code === 1 || err.code === err.PERMISSION_DENIED) {
              setCoords(null);
              setError(
                "Bạn chưa cấp quyền hoặc đã từ chối truy cập vị trí. Vui lòng bật định vị trong trình duyệt để hiển thị bản đồ khu vực."
              );
              setIsLoading(false);
            } else {
              fetch("https://ipapi.co/json/")
                .then((res) => res.json())
                .then((data) => {
                  if (data && data.latitude && data.longitude) {
                    updateCoordinates(
                      data.latitude,
                      data.longitude,
                      data.city || data.region || "Vị trí của bạn"
                    );
                  } else {
                    setCoords(null);
                    setError("Không thể xác định tọa độ vị trí của bạn.");
                    setIsLoading(false);
                  }
                })
                .catch(() => {
                  setCoords(null);
                  setError("Không thể xác định vị trí của bạn.");
                  setIsLoading(false);
                });
            }
          },
          { timeout: 8000, maximumAge: 600000 }
        );
      } else {
        setCoords(null);
        setError("Trình duyệt của bạn không hỗ trợ chức năng định vị GPS.");
        setIsLoading(false);
      }
    },
    [updateCoordinates]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      runDetection(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [runDetection]);

  const refreshLocation = useCallback((): void => {
    runDetection(true);
  }, [runDetection]);

  let mapUrl: string | null = null;
  if (coords) {
    const delta = 0.035;
    const minLon = (coords.lon - delta).toFixed(4);
    const minLat = (coords.lat - delta).toFixed(4);
    const maxLon = (coords.lon + delta).toFixed(4);
    const maxLat = (coords.lat + delta).toFixed(4);
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${coords.lat.toFixed(4)}%2C${coords.lon.toFixed(4)}`;
  }

  return {
    coords,
    isLoading,
    error,
    mapUrl,
    refreshLocation,
  };
}
