"use client"

import { useMemo, useState } from "react"
import type { PaymentSessionKind, PaymentSessionStatus } from "@/api/generated/types.gen"
import { useAdminPaymentSessions } from "@/hooks/api/useAdminFinance"
import { summarise } from "../_lib/sessions.logic"

/**
 * The reconciliation view's state.
 *
 * `limit` is a control rather than a constant because the route answers one page and no
 * more: how much of the tail somebody sees is the only thing they can decide, so it is
 * the only paging control there is.
 */
export function useSessionLedger() {
	const [kind, setKind] = useState<PaymentSessionKind | undefined>(undefined)
	const [statusFilter, setStatusFilter] = useState<PaymentSessionStatus | undefined>(undefined)
	const [limit, setLimit] = useState(50)

	const query = useAdminPaymentSessions(kind, statusFilter, limit)

	const totals = useMemo(() => summarise(query.sessions), [query.sessions])

	// Not `status`: a TanStack query result already carries one, meaning its own fetch
	// state, and spreading this over that would quietly replace it.
	return { kind, setKind, statusFilter, setStatusFilter, limit, setLimit, totals, ...query }
}
