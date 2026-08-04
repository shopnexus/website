"use client";

import { useState, useEffect, useCallback } from "react";

export interface LocationOption {
  value: string;
  label: string;
}

const INITIAL_OPTIONS: LocationOption[] = [
  { value: "79", label: "TP. Hồ Chí Minh" },
  { value: "1", label: "Hà Nội" },
  { value: "48", label: "Đà Nẵng" },
  { value: "92", label: "Cần Thơ" },
  { value: "31", label: "Hải Phòng" },
];

export interface UseUserLocationReturn {
  locationOptions: LocationOption[];
}

export function useUserLocation(
  currentLocation: string,
  onLocationChange: (loc: string) => void
): UseUserLocationReturn {
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>(INITIAL_OPTIONS);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => res.json())
      .then((data: any[]) => {
        const apiOptions = data.map((p) => ({
          value: p.code.toString(),
          label: p.name
            .replace(/^Thành phố\s+/i, "TP. ")
            .replace(/^Tỉnh\s+/i, ""),
        }));
        setLocationOptions(apiOptions);
      })
      .catch(() => {
        // Fallback to INITIAL_OPTIONS if API fails, no action needed as state is already INITIAL_OPTIONS
      });
  }, []);

  const handleCityFound = useCallback(
    (rawCity: string): void => {
      const cleanName = rawCity
        .replace(/^Thành phố\s+/i, "TP. ")
        .replace(/^Tỉnh\s+/i, "")
        .replace(/^Thủ đô\s+/i, "")
        .trim();

      const lowerName = cleanName.toLowerCase();

      // If we match basic names, we could try to map it to the fetched list
      // For simplicity, we just dispatch the custom value or pre-defined code if we had it mapped.
      // In this setup, we just pass the original string or a normalized custom one.
      if (lowerName.includes("hồ chí minh") || lowerName === "ho chi minh city" || lowerName === "ho chi minh") {
        onLocationChange("79"); // HCM code is 79 in API
      } else if (lowerName.includes("hà nội") || lowerName === "hanoi" || lowerName === "ha noi") {
        onLocationChange("1"); // HN code is 1 in API
      } else if (lowerName.includes("đà nẵng") || lowerName === "da nang") {
        onLocationChange("48"); // ĐN code is 48 in API
      } else if (lowerName.includes("cần thơ") || lowerName === "can tho") {
        onLocationChange("92"); // CT code is 92 in API
      } else if (lowerName.includes("hải phòng") || lowerName === "hai phong") {
        onLocationChange("31"); // HP code is 31 in API
      } else {
        const locValue = `custom_${lowerName.replace(/\s+/g, "_")}`;
        setLocationOptions((prev) => {
          if (prev.some((opt) => opt.value === locValue)) return prev;
          return [
            { value: locValue, label: `${cleanName}` },
            ...prev.filter((opt) => !opt.value.startsWith("custom_")),
          ];
        });
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
