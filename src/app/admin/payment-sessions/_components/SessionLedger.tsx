"use client";

import SessionFilters from "./SessionFilters";
import SessionTable from "./SessionTable";
import SessionTotals from "./SessionTotals";
import { useSessionLedger } from "../_hooks/useSessionLedger";

/** The ledger: what to read, what it adds up to, and the rows behind the sum. */
export default function SessionLedger() {
  const ledger = useSessionLedger();

  return (
    <>
      <SessionFilters
        kind={ledger.kind}
        onKindChange={ledger.setKind}
        status={ledger.statusFilter}
        onStatusChange={ledger.setStatusFilter}
        limit={ledger.limit}
        onLimitChange={ledger.setLimit}
      />

      <SessionTotals totals={ledger.totals} loading={ledger.isLoading} />

      <SessionTable
        sessions={ledger.sessions}
        isLoading={ledger.isLoading}
        shown={ledger.sessions.length}
        totalCount={ledger.totalCount}
      />
    </>
  );
}
