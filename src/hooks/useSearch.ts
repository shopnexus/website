import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The search box, wherever it appears.
 *
 * `province` and `ward` are administrative codes from the real dataset — the same ones a
 * contact is saved with and the same ones `/listings` filters on — so what this puts in the
 * URL is a value the API accepts, and the same parameter names the results page reads. They
 * used to be an invented vocabulary (`hcm`, `hn`) that no route had ever heard of, and the
 * results page ignored it.
 */
export function useSearch(initialProvince = "") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlQuery = searchParams.get("q") || "";
  const urlProvince = searchParams.get("province") || initialProvince;
  const urlWard = searchParams.get("ward") || "";

  const [query, setQuery] = useState(urlQuery);
  const [province, setProvince] = useState(urlProvince);
  const [ward, setWard] = useState(urlWard);

  // The URL is the truth; this state only holds what is being typed before it is
  // submitted. So the reset happens *during* render when the URL moves under us — a
  // search run from another box, or the back button — rather than in an effect, which
  // committed the stale value first and re-rendered over it.
  const [syncedTo, setSyncedTo] = useState({ urlQuery, urlProvince, urlWard });
  if (
    syncedTo.urlQuery !== urlQuery ||
    syncedTo.urlProvince !== urlProvince ||
    syncedTo.urlWard !== urlWard
  ) {
    setSyncedTo({ urlQuery, urlProvince, urlWard });
    setQuery(urlQuery);
    setProvince(urlProvince);
    setWard(urlWard);
  }

  /** The area, both levels at once: a ward belongs to the province it was picked under. */
  const setArea = (next: { provinceCode: string; wardCode: string }) => {
    setProvince(next.provinceCode);
    setWard(next.wardCode);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    // An empty box is a valid search: it browses the area instead of narrowing by words.
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (province) params.append("province", province);
    if (ward) params.append("ward", ward);

    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return { query, setQuery, province, setProvince, ward, setArea, handleSearch };
}
