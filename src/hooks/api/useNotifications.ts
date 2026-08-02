"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { postNotificationsRead, putNotificationPreferences } from "@/api/generated/sdk.gen"
import {
	getNotificationPreferencesOptions,
	getNotificationsInfiniteOptions,
	getNotificationsUnreadCountOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	NotificationCategory,
	UpdateNotificationPreferencesRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * The notification feed. Cursor-paginated, because it is an append-only stream whose
 * head moves while you read it — a page number would skip or repeat rows as new
 * notifications arrive.
 */
export function useNotificationsFeed(
	options: {
		category?: NotificationCategory
		unread?: boolean
		limit?: number
		/** Off by default nowhere — but a dropdown should not fetch until it opens. */
		enabled?: boolean
	} = {},
) {
	const { category, unread, limit = 20, enabled = true } = options

	const query = useInfiniteQuery({
		...getNotificationsInfiniteOptions({ query: { category, unread, limit } }),
		...cursorPagination,
		enabled,
	})

	const notifications = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, notifications }
}

/**
 * The unread badge.
 *
 * Polled rather than pushed, so it is `silent`: a dropped poll is not something to
 * interrupt the user about, and at one request a minute a visible failure would be a
 * toast a minute on a flaky connection.
 */
export function useUnreadCount(options: { enabled?: boolean; pollMs?: number } = {}) {
	const { enabled = true, pollMs = 60_000 } = options

	return useQuery({
		...getNotificationsUnreadCountOptions(),
		select: (envelope) => unwrapData(envelope).unread,
		enabled,
		refetchInterval: pollMs,
		meta: { silent: true },
	})
}

/**
 * Mark the feed read up to an instant, or entirely when given none.
 *
 * Optimistically zeroes the badge: the count is the thing the user is watching, and
 * waiting a round trip to clear it makes the click feel ignored. `onSettled` then
 * reconciles with the server either way.
 */
export function useMarkNotificationsRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (before?: string) => {
			const { data } = await postNotificationsRead({
				body: before ? { before } : {},
				throwOnError: true,
			})
			return data.data
		},
		onMutate: async () => {
			const key = [{ _id: OPERATIONS.notificationsUnread }]
			await queryClient.cancelQueries({ queryKey: key })
			const previous = queryClient.getQueryData(key)
			queryClient.setQueryData(key, { data: { unread: 0 } })
			return { previous }
		},
		onError: (_err, _vars, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData([{ _id: OPERATIONS.notificationsUnread }], context.previous)
			}
		},
		onSettled: () =>
			invalidate(queryClient, OPERATIONS.notificationsUnread, OPERATIONS.notifications),
	})
}

// ── Preferences ──────────────────────────────────────────────────────────────

export function useNotificationPreferences() {
	return useQuery({
		...getNotificationPreferencesOptions(),
		select: unwrapData,
	})
}

/**
 * Save preference rows. PUT, not PATCH — the server replaces the set it is given, and
 * the route only answers to PUT.
 */
export function useUpdateNotificationPreferences() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: UpdateNotificationPreferencesRequest) => {
			const { data } = await putNotificationPreferences({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.notificationPreferences),
	})
}
