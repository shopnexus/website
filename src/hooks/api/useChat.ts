"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	deleteMessagesById,
	patchMessagesById,
	postConversationsByIdMessages,
	postConversationsByIdRead,
	postConversations,
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
	AccountId,
	ConversationId,
	MessageId,
	SendMessageRequest,
	StartConversationRequest,
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
const CONVERSATION = "getConversationsById"
const MESSAGES = "getConversationsByIdMessages"
const UNREAD = "getConversationsUnreadCount"

/**
 * `enabled` is for a caller that is not the inbox: the product page's chat dock reads this
 * list only to find out whether a thread with the seller already exists, and only once the
 * reader has opened it. Every product page fetching every conversation on load would be a
 * request per view for an answer nobody asked for — and it 401s for a signed-out reader.
 */
export function useConversations(limit = 30, enabled = true) {
	const query = useInfiniteQuery({
		...getConversationsInfiniteOptions({ query: { limit } }),
		...cursorPagination,
		enabled,
	})

	const conversations = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, conversations }
}

/**
 * The chat badge.
 *
 * Pushed, not polled: `chat.message_created` and `chat.conversation_read` update it, and
 * every reconnect invalidates it, which covers the events a disconnect lost. Still
 * `silent` — a failed background read is not worth interrupting the user over.
 */
export function useChatUnreadCount(enabled = true) {
	return useQuery({
		...getConversationsUnreadCountOptions(),
		select: unwrapData,
		enabled,
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

/**
 * A message the sender wants to change or unsend.
 *
 * Both routes take the message's own `created_at` as a query parameter: `chat.message` is
 * partitioned on it, so without it the row has to be hunted through every chunk. The
 * client always holds the message it is acting on, so it always has the value.
 */
export interface MessageRef {
	id: MessageId
	/** Passed straight back from the message being acted on. */
	createdAt: string
}

/** Rewrite the body of your own message. The server records that it was edited. */
export function useEditMessage() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, createdAt, body }: MessageRef & { body: string }) => {
			const { data } = await patchMessagesById({
				path: { id },
				query: { created_at: createdAt },
				body: { body },
				throwOnError: true,
			})
			return data.data
		},
		// The list shows the last message, which an edit to it rewrites.
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: [{ _id: MESSAGES }] }),
				queryClient.invalidateQueries({ queryKey: [{ _id: CONVERSATIONS }] }),
			]),
	})
}

/**
 * Unsend: the row survives with its body and attachments cleared, so a thread that is
 * evidence in a dispute has no unexplained gaps.
 */
export function useDeleteMessage() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, createdAt }: MessageRef) => {
			await deleteMessagesById({
				path: { id },
				query: { created_at: createdAt },
				throwOnError: true,
			})
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: [{ _id: MESSAGES }] }),
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
				// The single-thread read too: it is what the ticket screens pass as `unread`,
				// so leaving it cached keeps a thread claiming unread after the mark landed.
				queryClient.invalidateQueries({ queryKey: [{ _id: CONVERSATION }] }),
				queryClient.invalidateQueries({ queryKey: [{ _id: UNREAD }] }),
			]),
	})
}

/**
 * Open the thread with somebody and say the first thing in it, as one action.
 *
 * The two halves are separate routes and they have to stay that way — a thread outlives any
 * one message — but a caller that has no thread yet has no id to send to, so it cannot use
 * `useSendMessage`. This is the case where "start chatting" is one press: `POST /conversations`
 * is idempotent per pair of accounts, so it answers with the existing thread when there is
 * one and the message lands in it rather than in a duplicate.
 */
export function useStartConversationWithMessage() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			accountId,
			...message
		}: SendMessageRequest & { accountId: AccountId }) => {
			const { data: started } = await postConversations({
				body: { account_id: accountId },
				throwOnError: true,
			})
			const conversation = started.data
			const { data: sent } = await postConversationsByIdMessages({
				path: { id: conversation.id },
				body: message,
				throwOnError: true,
			})
			return { conversation, message: sent.data }
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: [{ _id: CONVERSATIONS }] }),
				queryClient.invalidateQueries({ queryKey: [{ _id: MESSAGES }] }),
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
