import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The search box, wherever it appears.
 *
 * `province` is an administrative code from the real dataset — the same one a contact is
 * saved with and the same one `/listings` filters on — so what this puts in the URL is a
 * value the API accepts. It used to be an invented vocabulary (`hcm`, `hn`) that no route
 * had ever heard of, and the results page ignored it.
 */
export function useSearch(initialProvince = "") {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlQuery = searchParams.get("q") || "";
  const urlProvince = searchParams.get("province") || initialProvince;

  const [query, setQuery] = useState(urlQuery);
  const [province, setProvince] = useState(urlProvince);

  // The URL is the truth; this state only holds what is being typed before it is
  // submitted. So the reset happens *during* render when the URL moves under us — a
  // search run from another box, or the back button — rather than in an effect, which
  // committed the stale value first and re-rendered over it.
  const [syncedTo, setSyncedTo] = useState({ urlQuery, urlProvince });
  if (syncedTo.urlQuery !== urlQuery || syncedTo.urlProvince !== urlProvince) {
    setSyncedTo({ urlQuery, urlProvince });
    setQuery(urlQuery);
    setProvince(urlProvince);
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Allow empty search to reset/clear filters, or you can prevent it.
    // Usually, submitting empty should just go to /search without params.
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (province) params.append("province", province);

    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return { query, setQuery, province, setProvince, handleSearch };
}
