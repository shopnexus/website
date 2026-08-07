"use client";

import { useEffect, useState } from "react";
import type { AccountRole, AccountStatus } from "@/api/generated/types.gen";
import { useAdminAccounts, type AdminAccountFilters } from "@/hooks/api/useAdminConfig";

const DEBOUNCE_MS = 350;

/**
 * The filter bar's state plus the page it drives.
 *
 * `q` is debounced because on the server it is an exact lookup on email, phone or
 * username — a moderator pasting an address would otherwise fire one index probe per
 * keystroke. Any filter change resets to page 1: staying on page 4 of a result set that
 * no longer has four pages shows an empty table, which reads as "no such account".
 *
 * `pinned` wins over the controls, so the moderator roster can fix `role` and simply not
 * render a control for it.
 */
export function useAccountSearch(pinned: AdminAccountFilters = {}) {
  const [term, setTermState] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatusState] = useState<AccountStatus | undefined>(undefined);
  const [role, setRoleState] = useState<AccountRole | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [term]);

  // The reset rides with each setter rather than an effect watching the filters: an effect
  // would render the new filter against the old page first, firing a request for a page
  // that may not exist.
  const setTerm = (value: string) => {
    setTermState(value);
    setPage(1);
  };
  const setStatus = (value: AccountStatus | undefined) => {
    setStatusState(value);
    setPage(1);
  };
  const setRole = (value: AccountRole | undefined) => {
    setRoleState(value);
    setPage(1);
  };

  const query = useAdminAccounts({ q: debounced || undefined, status, role, ...pinned }, page);

  return {
    term,
    setTerm,
    status,
    setStatus,
    role,
    setRole,
    page,
    setPage,
    accounts: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
