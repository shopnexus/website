"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import type {
	Conversation,
	ConversationId,
	Listing,
	ListingId,
	Message,
	ReputationRole,
	Ticket,
	TicketKind,
} from "@/api/generated/types.gen"
import { lastReferencedListingId } from "@/components/chat/chat.logic"
import { useChatUnreadCount, useConversations, useMessages } from "@/hooks/api/useChat"
import { useListing } from "@/hooks/api/useCatalog"
import { useOffers } from "@/hooks/api/useOffers"
import { useListingMap } from "@/hooks/api/useOrders"
import { useTicket, useTickets } from "@/hooks/api/useTickets"
import { useAuthStore } from "@/stores/use-auth-store"

import { dealsByCounterparty } from "../_lib/deal.logic"
import { conversationListingId, matchesQuery, nextInboxQuery } from "../_lib/inbox.logic"
import { ticketsByConversation } from "../_lib/ticket.logic"
import type { InboxTab } from "../_types"

/** Enough tickets to name every row of the first few conversation pages. */
const TICKET_LOOKUP_LIMIT = 50

/**
 * Everything the inbox screen is, minus the markup.
 *
 * Which thread is open, which tab is showing and whether the ticket form is up all live in
 * the URL rather than in state beside it. They were state, and the URL was read once on
 * entry: a reload dropped the reader back on the newest thread, a link to a conversation
 * could not be sent to anyone, and Back walked out of the screen from the middle of it.
 * One source of truth for navigation is also what makes a deep link from a product page
 * (`?kind=report-listing&ref_id=…`) the same mechanism as clicking a row.
 */
export function useInbox() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	/** One write per action: each call reads the current query, so two in a row would race. */
	const setParams = useCallback(
		(changes: Record<string, string | null>) => {
			const query = nextInboxQuery(searchParams, changes).toString()
			router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
		},
		[router, pathname, searchParams],
	)

	const queryC = searchParams.get("c")
	const queryListingId = searchParams.get("listing_id")
	// A page that knows what a ticket is about links here with the kind and the ref filled
	// in — a report button on a listing, a problem button on an order.
	const composeKind = searchParams.get("kind") as TicketKind | null
	const composeRefId = searchParams.get("ref_id") ?? ""

	/** A deep link carrying a ticket kind is a support link, whether or not it said so. */
	const tab: InboxTab =
		searchParams.get("tab") === "support" || composeKind !== null ? "support" : "all"
	const isComposeOpen = composeKind !== null

	const [search, setSearch] = useState("")
	const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)
	/** The right rail as a sheet, which is the only way it fits below `lg`. */
	const [isInfoOpen, setInfoOpen] = useState(false)

	const accountId = useAuthStore((state) => state.user?.id)
	const { conversations, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useConversations()

	/**
	 * The tickets behind the support threads, so a row can say what was raised rather than
	 * showing a nameless thread with the desk. One read for the list: the ticket is a row in
	 * another module, and the conversation only carries its id.
	 */
	const { tickets } = useTickets(undefined, TICKET_LOOKUP_LIMIT)
	const ticketByConversation = useMemo(() => ticketsByConversation(tickets), [tickets])
	const ticketOf = (conversation: Conversation): Ticket | undefined =>
		conversation.ticket_id ? ticketByConversation.get(conversation.id) : undefined

	/**
	 * The item each row is about, resolved in one request for the whole list rather than
	 * one per row — see `useListingMap`, which is the same batching the order history uses.
	 */
	const listingIds = useMemo(
		() => conversations.map(conversationListingId).filter((id): id is ListingId => Boolean(id)),
		[conversations],
	)
	const listings = useListingMap(listingIds)
	const listingOf = (listingId: string | undefined): Listing | undefined =>
		listingId ? listings.get(listingId as ListingId) : undefined

	/**
	 * The negotiations in play, so a row can say there is money on the table. One read
	 * covers every row.
	 */
	const { offers } = useOffers()
	const deals = useMemo(() => dealsByCounterparty(offers), [offers])

	/**
	 * Which tab a thread belongs to. Support is a tab rather than another screen: a ticket
	 * *is* a conversation, and sending the reader elsewhere to read one was a redirect out
	 * of the inbox and back.
	 */
	const inTab = useMemo(
		() =>
			conversations.filter((conversation) =>
				tab === "support" ? Boolean(conversation.ticket_id) : !conversation.ticket_id,
			),
		[conversations, tab],
	)

	const visible = useMemo(
		() =>
			inTab.filter((conversation) => {
				const itemId = conversationListingId(conversation)
				const extra =
					ticketByConversation.get(conversation.id)?.subject ??
					(itemId ? listings.get(itemId)?.name : undefined)
				return matchesQuery(conversation, search, accountId, extra)
			}),
		[inTab, search, accountId, listings, ticketByConversation],
	)

	/** Support threads still waiting on the desk — a resolved one needs no attention. */
	const openTicketCount = useMemo(
		() =>
			conversations.filter((conversation) => {
				// Only what is known: a ticket whose row has not resolved yet is not counted,
				// rather than counted as unresolved and quietly inflating the badge.
				const ticket = ticketByConversation.get(conversation.id)
				return ticket !== undefined && ticket.status !== "resolved"
			}).length,
		[conversations, ticketByConversation],
	)

	/**
	 * From the server, not from the rows on screen: `GET /conversations/unread-count`
	 * counts every thread, including the ones past the page that has been loaded, and it is
	 * pushed by the socket. Counting the loaded rows would quietly under-report the badge
	 * on an account with more than one page of conversations.
	 */
	const { data: unreadTotals } = useChatUnreadCount()

	// Derived rather than synced: the newest conversation is the default until one is named
	// in the URL, and a named thread that is not in the list falls back to it.
	const activeId =
		(queryC && conversations.some((conversation) => conversation.id === queryC)
			? (queryC as ConversationId)
			: conversations[0]?.id) ?? ""

	const active = conversations.find((conversation) => conversation.id === activeId)

	// The same query ChatThread reads, so this shares its cache rather than fetching again.
	const { messages } = useMessages(activeId || undefined)

	/**
	 * The ticket the open thread belongs to, read rather than taken from the list: that read
	 * is also what repairs a `conversation_id` the row is still missing, because the ticket
	 * and its thread live in different schemas and one lands first.
	 */
	const { data: activeTicket } = useTicket(active?.ticket_id ?? undefined)
	const isTicketThread = Boolean(active?.ticket_id)

	/**
	 * The listing this thread is about. A conversation carries none of its own — it is
	 * between two accounts and can outlive any one item — so the panel follows the most
	 * recently referenced listing, and the URL's only while its thread is the open one.
	 * A ticket thread has none: what it is about is the ticket's own `ref_id`.
	 */
	const referencedListingId = useMemo(() => lastReferencedListingId(messages), [messages])
	const listingId = isTicketThread
		? undefined
		: ((activeId === queryC ? queryListingId || referencedListingId : referencedListingId) as
				| ListingId
				| undefined)
	const { data: listing } = useListing(listingId)

	const activeDeals = active ? deals.get(active.counterparty.id) : undefined

	/**
	 * Which reputation to read for the other side. The same account is rated separately as
	 * a seller and as a buyer, and which one they are here is decided by whose listing this
	 * thread is about — reading the seller's numbers for a buyer would show zeroes.
	 */
	const counterpartyRole: ReputationRole =
		listing && accountId && listing.seller.id === accountId ? "buyer" : "seller"

	const setTab = (next: InboxTab) => setParams({ tab: next === "support" ? "support" : null })

	const select = (id: ConversationId) => {
		setParams({ c: id })
		setShowThreadOnMobile(true)
		setInfoOpen(false)
	}

	const openCompose = (kind: TicketKind = "other", refId?: string) =>
		setParams({ kind, ref_id: refId ?? null })

	const closeCompose = () => setParams({ kind: null, ref_id: null })

	/** Reporting a message is a `report-message` ticket about it, raised where it is read. */
	const reportMessage = (message: Message) => openCompose("report-message", message.id)

	/** A freshly raised ticket opens in its own tab, where the answer will arrive. */
	const openCreatedTicket = (ticket: Ticket) => {
		setSearch("")
		setShowThreadOnMobile(true)
		setInfoOpen(false)
		setParams({
			tab: "support",
			kind: null,
			ref_id: null,
			c: ticket.conversation_id ?? null,
		})
	}

	return {
		accountId,
		conversations,
		visible,
		listingOf,
		ticketOf,
		deals,
		activeDeals,
		activeTicket,
		isTicketThread,
		counterpartyRole,
		unreadThreadCount: unreadTotals?.conversations ?? 0,
		unreadMessageCount: unreadTotals?.unread ?? 0,
		openTicketCount,
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
		isInfoOpen,
		setInfoOpen,
		isComposeOpen,
		composeKind,
		composeRefId,
		openCompose,
		closeCompose,
		reportMessage,
		openCreatedTicket,
		listing,
	}
}
