"use client"

import { useState } from "react"
import type { IdentityStatus } from "@/api/generated/types.gen"
import { useAdminIdentityDocuments } from "@/hooks/api/useAdminFinance"

/** The queue and its one filter. Opens on `pending`, which is the desk's actual work. */
export function useIdentityQueue() {
	const [statusFilter, setStatusFilter] = useState<IdentityStatus | undefined>("pending")
	const queue = useAdminIdentityDocuments(statusFilter)

	// Not `status`: a TanStack query result already carries one, meaning its own fetch
	// state, and spreading this over that would quietly replace it.
	return { statusFilter, setStatusFilter, ...queue }
}
