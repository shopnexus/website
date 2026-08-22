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
 * The unread badge and the per-category counts behind it, from one call — the server answers
 * both from one query, so the number on the bell and the number beside each filter cannot
 * disagree.
 *
 * Pushed, not polled: `account.notification_created` updates it, and every reconnect
 * invalidates it, which covers the events a disconnect lost. Still `silent` — a failed
 * background read is not worth interrupting the user over.
 */
export function useUnreadCount(options: { enabled?: boolean } = {}) {
	const { enabled = true } = options

	const query = useQuery({
		...getNotificationsUnreadCountOptions(),
		select: unwrapData,
		enabled,
		meta: { silent: true },
	})

	return {
		...query,
		unread: query.data?.unread ?? 0,
		byCategory: query.data?.by_category ?? {},
	}
}

/** What one call to `POST /notifications/read` covers. Undefined is the whole feed. */
export type ReadTarget = { ids: string[] } | { before: string } | undefined

/**
 * Mark notifications read: a list of ids, everything up to an instant, or the whole feed.
 *
 * The ids shape is why this is not just a bound any more. Opening one notification used to
 * mark everything older read along with it, because a bound was the only thing a row could be
 * named by — so glancing at the bell emptied the unread list.
 *
 * Optimistic on the badge: the count is what the user is watching, and waiting a round trip to
 * decrement it makes the click feel ignored. Ids decrement by their own number and a bound
 * zeroes it, which is the most the client can know before the server answers; `onSettled`
 * reconciles either way.
 */
export function useMarkNotificationsRead() {
	const queryClient = useQueryClient()
	const unreadKey = [{ _id: OPERATIONS.notificationsUnread }]

	return useMutation({
		mutationFn: async (target: ReadTarget) => {
			const { data } = await postNotificationsRead({ body: target ?? {}, throwOnError: true })
			return data.data
		},
		onMutate: async (target) => {
			await queryClient.cancelQueries({ queryKey: unreadKey })
			const previous = queryClient.getQueryData(unreadKey)
			queryClient.setQueryData(unreadKey, (current: unknown) => {
				const shown = (current as { data?: { unread?: number } })?.data?.unread ?? 0
				const opened = target && "ids" in target ? target.ids.length : shown
				return { data: { unread: Math.max(0, shown - opened) } }
			})
			return { previous }
		},
		onError: (_err, _vars, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData(unreadKey, context.previous)
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
