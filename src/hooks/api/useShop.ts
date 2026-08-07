"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
	getAccountsByAccountIdFeedbackInfiniteOptions,
	getAccountsByAccountIdReputationOptions,
	getAccountsByIdFollowersInfiniteOptions,
	getAccountsByIdOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type { AccountId, ReputationRole } from "@/api/generated/types.gen"
import { cursorPagination, flattenPages, pagePagination, totalCountOf } from "@/api/pagination"
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

/**
 * Published feedback an account has received. A blind submission stays hidden until the
 * window closes.
 *
 * `role` is which side of the order the account was on, and it is a real distinction: the
 * same person is rated as a seller by the people who bought from them and as a buyer by
 * the people who sold to them. Omitting it answers both at once, which mixes two claims
 * into one list.
 */
export function useAccountFeedback(
	id: AccountId | undefined,
	role?: ReputationRole,
	limit = 20,
) {
	const query = useInfiniteQuery({
		...getAccountsByAccountIdFeedbackInfiniteOptions({
			path: { accountID: id! },
			query: { role, limit },
		}),
		...cursorPagination,
		enabled: Boolean(id),
	})

	const feedback = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, feedback }
}

/**
 * Who follows this account. Page-paginated, so the total is a real count rather than a
 * short page — which is what lets the tab carry a number.
 */
export function useFollowers(id: AccountId | undefined, limit = 24) {
	const query = useInfiniteQuery({
		...getAccountsByIdFollowersInfiniteOptions({ path: { id: id! }, query: { limit } }),
		...pagePagination,
		enabled: Boolean(id),
	})

	const followers = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, followers, totalCount: totalCountOf(query.data) }
}
