"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { postConversationsByIdMessages, postConversationsByIdRead } from "@/api/generated/sdk.gen"
import {
	getConversationsByIdMessagesInfiniteOptions,
	getConversationsInfiniteOptions,
	getConversationsUnreadCountOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type { ConversationId, SendMessageRequest } from "@/api/generated/types.gen"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * Conversations and their messages.
 *
 * Both are cursor streams. A message list especially has to be: chat.message is a
 * hypertable whose chunk exclusion needs a time bound in the query, and a page number
 * would skip or repeat rows as the other side types.
 */

const CONVERSATIONS = "getConversations"
const MESSAGES = "getConversationsByIdMessages"
const UNREAD = "getConversationsUnreadCount"

export function useConversations(limit = 30) {
	const query = useInfiniteQuery({
		...getConversationsInfiniteOptions({ query: { limit } }),
		...cursorPagination,
	})

	const conversations = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, conversations }
}

export function useChatUnreadCount(enabled = true) {
	return useQuery({
		...getConversationsUnreadCountOptions(),
		select: unwrapData,
		enabled,
		refetchInterval: 60_000,
		meta: { silent: true },
	})
}

/**
 * A thread's messages, newest first — which is the order the cursor walks, so the list
 * is reversed for rendering rather than re-sorted per page.
 */
export function useMessages(conversationId: ConversationId | undefined, limit = 50) {
	const query = useInfiniteQuery({
		...getConversationsByIdMessagesInfiniteOptions({
			path: { id: conversationId! },
			query: { limit },
		}),
		...cursorPagination,
		enabled: Boolean(conversationId),
	})

	// Oldest at the top, which is how a thread reads.
	const messages = useMemo(() => flattenPages(query.data).reverse(), [query.data])

	return { ...query, messages }
}

export function useSendMessage(conversationId: ConversationId | undefined) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (body: SendMessageRequest) => {
			const { data } = await postConversationsByIdMessages({
				path: { id: conversationId! },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: [{ _id: MESSAGES }] }),
				// The conversation list shows the last message and its timestamp.
				queryClient.invalidateQueries({ queryKey: [{ _id: CONVERSATIONS }] }),
			]),
	})
}

/** Mark a thread read up to now. Clears its unread count and the global badge. */
export function useMarkConversationRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (conversationId: ConversationId) => {
			await postConversationsByIdRead({ path: { id: conversationId }, throwOnError: true })
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: [{ _id: CONVERSATIONS }] }),
				queryClient.invalidateQueries({ queryKey: [{ _id: UNREAD }] }),
			]),
	})
}
