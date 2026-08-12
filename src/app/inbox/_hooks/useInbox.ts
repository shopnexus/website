"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import type { ConversationId, ListingId } from "@/api/generated/types.gen"
import { lastReferencedListingId } from "@/components/chat/chat.logic"
import { useChatUnreadCount, useConversations, useMessages } from "@/hooks/api/useChat"
import { useListing } from "@/hooks/api/useCatalog"
import { useAuthStore } from "@/stores/use-auth-store"

import { matchesQuery } from "../_lib/inbox.logic"
import type { InboxTab } from "../_types"

/** Everything the inbox screen is, minus the markup. */
export function useInbox() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const queryC = searchParams.get("c")
	const queryListingId = searchParams.get("listing_id")

	const [tab, setTab] = useState<InboxTab>("all")
	const [search, setSearch] = useState("")
	const [selectedId, setSelectedId] = useState<ConversationId | "">("")
	const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)

	const accountId = useAuthStore((state) => state.user?.id)
	const { conversations, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useConversations()

	/**
	 * The threads this pane can open — every one except a ticket's.
	 *
	 * A ticket is still *listed*, because `GET /conversations/unread-count` counts it and
	 * that badge is what a user comes here to clear: dropping the row left "N tin nhắn chưa
	 * đọc" over a list with nothing unread in it, and the empty "Chưa đọc" tab then offered
	 * a next page that does not exist. It is *read* at /support/[id] instead, where the
	 * status and the verdict are, so `select` sends it there rather than opening a nameless
	 * thread with the desk here.
	 */
	const openable = useMemo(
		() => conversations.filter((conversation) => !conversation.ticket_id),
		[conversations],
	)

	const visible = useMemo(
		() =>
			conversations
				.filter((conversation) => (tab === "unread" ? conversation.unread > 0 : true))
				.filter((conversation) => matchesQuery(conversation, search, accountId)),
		[conversations, tab, search, accountId],
	)

	/**
	 * From the server, not from the rows on screen: `GET /conversations/unread-count`
	 * counts every thread, including the ones past the page that has been loaded, and it is
	 * pushed by the socket. Counting the loaded rows would quietly under-report the badge
	 * on an account with more than one page of conversations.
	 */
	const { data: unreadTotals } = useChatUnreadCount()

	// Derived rather than synced: the first conversation is the default until one is
	// picked, and a picked thread that leaves the list falls back to the first again.
	const activeId =
		(selectedId && openable.some((conversation) => conversation.id === selectedId)
			? selectedId
			: queryC && openable.some((conversation) => conversation.id === queryC)
				? (queryC as ConversationId)
				: openable[0]?.id) ?? ""

	const active = openable.find((conversation) => conversation.id === activeId)

	// The same query ChatThread reads, so this shares its cache rather than fetching again.
	const { messages } = useMessages(activeId || undefined)

	/**
	 * The listing this thread is about. A conversation carries none of its own — it is
	 * between two accounts and can outlive any one item — so the panel follows the most
	 * recently referenced listing, and the URL's only while its thread is the open one.
	 */
	const referencedListingId = useMemo(() => lastReferencedListingId(messages), [messages])
	const listingId = (
		activeId === queryC ? queryListingId || referencedListingId : referencedListingId
	) as ListingId | undefined
	const { data: listing } = useListing(listingId)

	const select = (id: ConversationId) => {
		const ticketId = conversations.find((conversation) => conversation.id === id)?.ticket_id
		if (ticketId) {
			router.push(`/support/${ticketId}`)
			return
		}
		setSelectedId(id)
		setShowThreadOnMobile(true)
	}

	return {
		accountId,
		conversations,
		visible,
		unreadThreadCount: unreadTotals?.conversations ?? 0,
		unreadMessageCount: unreadTotals?.unread ?? 0,
		isLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		tab,
		setTab,
		search,
		setSearch,
		activeId,
		active,
		select,
		showThreadOnMobile,
		setShowThreadOnMobile,
		listing,
	}
}
