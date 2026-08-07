"use client"

import { useState } from "react"
import type { PaymentSessionStatus } from "@/api/generated/types.gen"
import { useAdminWithdrawals } from "@/hooks/api/useAdminFinance"

/**
 * The queue and the one thing that filters it.
 *
 * Opens on `pending`, which is the desk's actual job: everything else on this screen is
 * history somebody is looking up rather than work waiting to be done.
 */
export function useWithdrawalQueue() {
	const [statusFilter, setStatusFilter] = useState<PaymentSessionStatus | undefined>("pending")
	const queue = useAdminWithdrawals(statusFilter)

	// Not `status`: a TanStack query result already carries one, meaning its own fetch
	// state, and spreading this over that would quietly replace it.
	return { statusFilter, setStatusFilter, ...queue }
}
