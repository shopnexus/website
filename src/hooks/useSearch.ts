import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The search box, wherever it appears.
 *
 * `province` is an administrative code from the real dataset — the same one a contact is
 * saved with and the same one `/listings` filters on — so what this puts in the URL is a
 * value the API accepts. It used to be an invented vocabulary (`hcm`, `hn`) that no route
 * had ever heard of, and the results page ignored it.
 */
export function useSearch(initialProvince = "") {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState(initialProvince);
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() && !province) return;

    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (province) params.append("province", province);

    router.push(`/search?${params.toString()}`);
  };

  return { query, setQuery, province, setProvince, handleSearch };
}
