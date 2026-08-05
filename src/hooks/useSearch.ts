import { useState, useEffect } from "react";
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

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [province, setProvince] = useState(searchParams.get("province") || initialProvince);

  // Sync local state when the URL changes (e.g., user submits search from another bar or navigates back)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setProvince(searchParams.get("province") || initialProvince);
  }, [searchParams, initialProvince]);

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
