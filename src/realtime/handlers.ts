import type { InfiniteData, QueryClient } from "@tanstack/react-query"

import { OPERATIONS, invalidate, type Operation } from "@/api/invalidate"
import type { RealtimeEvent } from "@/api/generated/ws-events"
import type { Message, MessagePage } from "@/api/generated/types.gen"

/**
 * Turning a pushed event into a cache change.
 *
 * Invalidating is the default: it cannot desynchronise anything, and every event here
 * except one is low-frequency enough that a refetch costs nothing. `chat.message_created`
 * is the exception — `useMessages` pages fifty rows, so invalidating per message refetches
 * fifty to show one, and a busy thread would refetch on every keystroke of the other side.
 */

/**
 * Everything the socket feeds. Invalidated wholesale on every (re)connect, because a
 * disconnect is precisely when events are lost and nothing replays them.
 */
export const REALTIME_FED_OPERATIONS: readonly Operation[] = [
	OPERATIONS.conversations,
	OPERATIONS.messages,
	OPERATIONS.conversationsUnread,
	OPERATIONS.notifications,
	OPERATIONS.notificationsUnread,
	OPERATIONS.orders,
	OPERATIONS.offers,
] as const

/** Apply one pushed event to the query cache — invalidate, or for chat, a surgical write. */
export function applyRealtimeEvent(client: QueryClient, event: RealtimeEvent): void {
	switch (event.code) {
		case "chat.message_created":
			prependMessage(client, event.data)
			// The list shows the last message and its timestamp, and the badge counts it.
			void invalidate(client, OPERATIONS.conversations, OPERATIONS.conversationsUnread)
			return

		case "chat.message_updated":
		case "chat.message_deleted":
			// An edit or a delete rewrites a row that may be on any page, so there is no
			// cheap surgical update — and neither is frequent enough to be worth one.
			void invalidate(client, OPERATIONS.messages, OPERATIONS.conversations)
			return

		case "chat.conversation_read":
			void invalidate(client, OPERATIONS.conversations)
			return

		case "order.offer_updated":
			void invalidate(client, OPERATIONS.offers, OPERATIONS.conversations)
			return

		case "order.placed":
		case "order.settled":
			void invalidate(client, OPERATIONS.orders, OPERATIONS.order)
			return

		case "account.notification_created":
			void invalidate(client, OPERATIONS.notifications, OPERATIONS.notificationsUnread)
			return
	}
}

/**
 * Insert a new message into an open thread without refetching.
 *
 * Prepended to page 0, not appended to the last page: the cursor walks newest-first, and
 * `useMessages` reverses the flattened result for rendering. Appending would put the new
 * message at the top of the screen.
 *
 * Only touches threads already in the cache. A message for a conversation the user has
 * not opened needs no cache entry — the invalidation of the conversation list is what
 * surfaces it.
 *
 * The cached page is `MessagePage` itself (`{ data: Message[], meta }`), not a second
 * `{ data: ... }` wrapper around it — confirmed from `GetConversationsByIdMessagesResponses`
 * (`200: MessagePage`) and mirrored by `flattenPages`, which reads `page.data` directly.
 */
function prependMessage(client: QueryClient, message: Message): void {
	client.setQueriesData<InfiniteData<MessagePage>>(
		{ queryKey: [{ _id: OPERATIONS.messages }] },
		(existing) => {
			if (!existing || existing.pages.length === 0) return existing

			const [first, ...rest] = existing.pages
			if (first.data.some((m) => m.id === message.id)) {
				// Already here: the sender's own optimistic insert, or a duplicate delivery.
				// The bus is at-least-once, so this is a case that happens.
				return existing
			}
			if (first.data.some((m) => m.conversation_id !== message.conversation_id)) {
				// A different thread's cache entry. setQueriesData matches every cached
				// messages query, so the payload has to be checked against each one.
				return existing
			}

			return {
				...existing,
				pages: [{ ...first, data: [message, ...first.data] }, ...rest],
			}
		},
	)
}
