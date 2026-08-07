"use client";

import { useEffect, useState } from "react";
import { useAdminTags } from "@/hooks/api/useAdminConfig";
import { toTagSlug } from "../_lib/tag-slug";

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 30;

/**
 * The tag dictionary's search box.
 *
 * The term is pushed through the same slug normaliser the form uses, because the server
 * matches a *prefix of the slug* — typing "Đồ gốm" with no normalisation searches for a
 * string no slug can start with, and the empty result reads as "that tag does not exist".
 */
export function useTagSearch() {
  const [term, setTermState] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(toTagSlug(term)), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [term]);

  // Reset with the edit, not in an effect watching it — an effect renders the new term
  // against the old page first, which requests a page the narrowed result may not have.
  const setTerm = (value: string) => {
    setTermState(value);
    setPage(1);
  };

  const query = useAdminTags({ q: debounced || undefined, limit: PAGE_SIZE }, page);

  return {
    term,
    setTerm,
    normalizedTerm: debounced,
    page,
    setPage,
    tags: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
  };
}
