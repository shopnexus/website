"use client";

import { useState, useEffect, useCallback } from "react";

export interface LocationOption {
  value: string;
  label: string;
}

const INITIAL_OPTIONS: LocationOption[] = [
  { value: "hcm", label: "TP. Hồ Chí Minh" },
  { value: "hn", label: "Hà Nội" },
  { value: "dn", label: "Đà Nẵng" },
  { value: "ct", label: "Cần Thơ" },
  { value: "hp", label: "Hải Phòng" },
];

export interface UseUserLocationReturn {
  locationOptions: LocationOption[];
}

export function useUserLocation(
  currentLocation: string,
  onLocationChange: (loc: string) => void
): UseUserLocationReturn {
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>(INITIAL_OPTIONS);

  const handleCityFound = useCallback(
    (rawCity: string): void => {
      const cleanName = rawCity
        .replace(/^Thành phố\s+/i, "TP. ")
        .replace(/^Tỉnh\s+/i, "")
        .replace(/^Thủ đô\s+/i, "")
        .trim();

      const lowerName = cleanName.toLowerCase();

      if (lowerName.includes("hồ chí minh") || lowerName === "ho chi minh city" || lowerName === "ho chi minh") {
        onLocationChange("hcm");
      } else if (lowerName.includes("hà nội") || lowerName === "hanoi" || lowerName === "ha noi") {
        onLocationChange("hn");
      } else if (lowerName.includes("đà nẵng") || lowerName === "da nang") {
        onLocationChange("dn");
      } else if (lowerName.includes("cần thơ") || lowerName === "can tho") {
        onLocationChange("ct");
      } else if (lowerName.includes("hải phòng") || lowerName === "hai phong") {
        onLocationChange("hp");
      } else {
        const locValue = `custom_${lowerName.replace(/\s+/g, "_")}`;
        setLocationOptions((prev) => [
          { value: locValue, label: `${cleanName}` },
          ...prev.filter((opt) => !opt.value.startsWith("custom_")),
        ]);
        onLocationChange(locValue);
      }
    },
    [onLocationChange]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("shopnexus:last-detected-location");
        if (cached) {
          const timer = setTimeout(() => handleCityFound(cached), 0);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [handleCityFound]);

  useEffect(() => {
    const handleLocationEvent = (e: Event): void => {
      const customEvent = e as CustomEvent<{ label?: string }>;
      if (customEvent.detail?.label) {
        handleCityFound(customEvent.detail.label);
      }
    };

    window.addEventListener("shopnexus:location-detected", handleLocationEvent);
    return () => {
      window.removeEventListener("shopnexus:location-detected", handleLocationEvent);
    };
  }, [handleCityFound]);

  return {
    locationOptions,
  };
}
