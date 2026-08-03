"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	postConversationsByIdMessages,
	postConversationsByIdRead,
	postConversations,
	patchMessagesById,
	deleteMessagesById,
	postConversationsUploads,
	postConversationsUploadsByIdConfirmation,
} from "@/api/generated/sdk.gen"
import {
	getConversationsByIdMessagesInfiniteOptions,
	getConversationsInfiniteOptions,
	getConversationsUnreadCountOptions,
	getConversationsByIdOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	ConversationId,
	SendMessageRequest,
	StartConversationRequest,
	UpdateMessageRequest,
	MessageId,
	CreateUploadRequest,
	ResourceId,
} from "@/api/generated/types.gen"
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

export function useStartConversation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (body: StartConversationRequest) => {
			const { data } = await postConversations({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: [{ _id: CONVERSATIONS }] }),
	})
}

export function useConversation(conversationId: ConversationId | undefined) {
	return useQuery({
		...getConversationsByIdOptions({ path: { id: conversationId! } }),
		select: unwrapData,
		enabled: Boolean(conversationId),
	})
}

export function useEditMessage(conversationId: ConversationId) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, created_at, body }: { id: MessageId; created_at: string; body: UpdateMessageRequest }) => {
			const { data } = await patchMessagesById({ path: { id }, query: { created_at }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: [{ _id: MESSAGES }, { _id: CONVERSATIONS }] }),
	})
}

export function useDeleteMessage(conversationId: ConversationId) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, created_at }: { id: MessageId; created_at: string }) => {
			await deleteMessagesById({ path: { id }, query: { created_at }, throwOnError: true })
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: [{ _id: MESSAGES }, { _id: CONVERSATIONS }] }),
	})
}

export function useRequestChatUpload() {
	return useMutation({
		mutationFn: async (body: CreateUploadRequest) => {
			const { data } = await postConversationsUploads({ body, throwOnError: true })
			return data.data
		},
	})
}

export function useConfirmChatUpload() {
	return useMutation({
		mutationFn: async (id: ResourceId) => {
			const { data } = await postConversationsUploadsByIdConfirmation({ path: { id }, throwOnError: true })
			return data.data
		},
	})
}
