"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
	getAccountsByAccountIdFeedbackInfiniteOptions,
	getAccountsByAccountIdReputationOptions,
	getAccountsByIdOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type { AccountId, ReputationRole } from "@/api/generated/types.gen"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * A seller's public page.
 *
 * `GET /accounts/{id}` is the public projection — name, avatar, description, follower
 * count, verified flag — and deliberately carries no email, phone or addresses. The
 * numbers a shop page shows beside it (ratings, completed orders) come from the separate
 * reputation read, which is scoped by role: the same account has one reputation as a
 * seller and another as a buyer.
 */

export function usePublicAccount(id: AccountId | undefined) {
	return useQuery({
		...getAccountsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

export function useReputation(id: AccountId | undefined, role: ReputationRole = "seller") {
	return useQuery({
		...getAccountsByAccountIdReputationOptions({
			path: { accountID: id! },
			query: { role },
		}),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

/** Published feedback an account has received. A blind submission stays hidden until the window closes. */
export function useAccountFeedback(id: AccountId | undefined, limit = 20) {
	const query = useInfiniteQuery({
		...getAccountsByAccountIdFeedbackInfiniteOptions({
			path: { accountID: id! },
			query: { limit },
		}),
		...cursorPagination,
		enabled: Boolean(id),
	})

	const feedback = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, feedback }
}
