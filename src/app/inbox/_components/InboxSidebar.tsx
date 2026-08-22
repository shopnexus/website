"use client"

import { useEffect, useRef, type KeyboardEvent } from "react"
import * as Tabs from "@radix-ui/react-tabs"

import type {
	AccountId,
	Conversation,
	ConversationId,
	Listing,
	Offer,
	Ticket,
} from "@/api/generated/types.gen"
import { useMarkConversationRead } from "@/hooks/api/useChat"

import { conversationListingId } from "../_lib/inbox.logic"
import type { InboxTab } from "../_types"
import ConversationRow from "./ConversationRow"
import ConversationSkeleton from "./ConversationSkeleton"

interface InboxSidebarProps {
	conversations: readonly Conversation[]
	accountId: AccountId | undefined
	activeId: ConversationId | ""
	listingOf: (listingId: string | undefined) => Listing | undefined
	ticketOf: (conversation: Conversation) => Ticket | undefined
	deals: Map<AccountId, Offer[]>
	tab: InboxTab
	onTabChange: (tab: InboxTab) => void
	search: string
	onSearchChange: (search: string) => void
	unreadThreadCount: number
	unreadMessageCount: number
	openTicketCount: number
	totalCount: number
	isLoading: boolean
	hasNextPage: boolean
	isFetchingNextPage: boolean
	onLoadMore: () => void
	onSelect: (id: ConversationId) => void
	onCompose: () => void
	hidden: boolean
}

const TABS: Array<{ id: InboxTab; label: string }> = [
	{ id: "all", label: "Mua bán" },
	{ id: "support", label: "Hỗ trợ" },
]

/** What an empty list means, which depends on why it is empty. */
function emptyMessage(tab: InboxTab, search: string): string {
	if (search) return "Không có hội thoại nào khớp với từ khóa. Tải thêm để tìm trong phần cũ hơn."
	if (tab === "support") return "Bạn chưa gửi yêu cầu hỗ trợ nào."
	return "Chưa có cuộc trò chuyện nào."
}

export default function InboxSidebar({
	conversations,
	accountId,
	activeId,
	listingOf,
	ticketOf,
	deals,
	tab,
	onTabChange,
	search,
	onSearchChange,
	unreadThreadCount,
	unreadMessageCount,
	openTicketCount,
	totalCount,
	isLoading,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onSelect,
	onCompose,
	hidden,
}: InboxSidebarProps) {
	const markRead = useMarkConversationRead()
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	// A badge means "this needs you". "Mua bán" carries no count: the total is already in the
	// header, and a number there would read as work waiting.
	const counts: Record<InboxTab, number> = { all: 0, support: openTicketCount }

	/**
	 * Paging on scroll, except while searching.
	 *
	 * The filter is client-side, so a search can leave three rows in a pane with no scroll
	 * at all — the sentinel would then be permanently in view and walk the whole cursor in
	 * a burst. With a query on screen the next page stays a decision, which is also the one
	 * case where the reader knows they want it.
	 */
	const autoLoad = hasNextPage && !isFetchingNextPage && !search.trim()

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!autoLoad || !sentinel) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) onLoadMore()
			},
			{ rootMargin: "200px" },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
		// `tab` is a dependency because switching tabs unmounts the panel the sentinel is in:
		// without it the observer would keep watching a node no longer in the document.
	}, [autoLoad, onLoadMore, tab])

	/** Up and down through the rows, so a full inbox is readable without the mouse. */
	const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return

		const rows = Array.from(
			event.currentTarget.querySelectorAll<HTMLElement>("[data-conversation-row]"),
		)
		const index = rows.indexOf(document.activeElement as HTMLElement)
		if (index === -1) return

		const next = rows[index + (event.key === "ArrowDown" ? 1 : -1)]
		if (!next) return
		event.preventDefault()
		next.focus()
	}

	const panel = (
		<>
			{/* Raising a ticket happens where it is answered: the thread this opens is the one
			    the desk replies in. */}
			{tab === "support" && (
				<div className="border-b border-outline-variant p-3">
					<button
						type="button"
						onClick={onCompose}
						className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-label-md text-on-primary transition-all hover:brightness-110"
					>
						<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
							add
						</span>
						Gửi yêu cầu mới
					</button>
				</div>
			)}

			{isLoading && <ConversationSkeleton />}

			{!isLoading && conversations.length === 0 && (
				<p className="p-8 text-center text-body-xs text-on-surface-variant">
					{emptyMessage(tab, search)}
				</p>
			)}

			<div role="list" className="divide-y divide-outline-variant/50">
				{conversations.map((conversation) => (
					<div role="listitem" key={conversation.id}>
						<ConversationRow
							conversation={conversation}
							accountId={accountId}
							listing={listingOf(conversationListingId(conversation))}
							ticket={ticketOf(conversation)}
							deals={deals.get(conversation.counterparty.id)}
							query={search}
							isActive={activeId === conversation.id}
							onSelect={() => onSelect(conversation.id)}
							onMarkRead={() => markRead.mutate(conversation.id)}
							isMarkingRead={markRead.isPending}
						/>
					</div>
				))}
			</div>

			{/* The list is a cursor stream: it pages itself as you reach the end, and asks
			    while a search is narrowing it — see `autoLoad`. */}
			<div ref={sentinelRef} aria-hidden="true" className="h-px" />

			{isFetchingNextPage && <ConversationSkeleton rows={2} />}

			{hasNextPage && !isFetchingNextPage && search.trim() && (
				<div className="flex justify-center p-3">
					<button
						type="button"
						onClick={onLoadMore}
						className="cursor-pointer rounded-full border border-outline-variant px-4 py-1.5 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
					>
						Tải thêm để tìm tiếp
					</button>
				</div>
			)}

			{!hasNextPage && conversations.length > 0 && (
				<p className="py-4 text-center text-label-xs text-outline">Đã hết hội thoại</p>
			)}
		</>
	)

	return (
		<aside
			className={`absolute z-20 flex h-full w-full shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none md:relative md:w-[320px] lg:w-[340px] xl:w-[360px] 2xl:w-[380px] ${
				hidden ? "-translate-x-full md:translate-x-0" : "translate-x-0"
			}`}
		>
			<div className="shrink-0 border-b border-outline-variant p-4 pb-3">
				<div className="mb-1 flex items-center justify-between gap-2">
					<h1 className="text-title-lg text-on-surface">Hộp thư</h1>
					<span className="rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 text-label-xs text-on-surface-variant tabular-nums">
						{totalCount} hội thoại
					</span>
				</div>
				<p className="mb-3 text-body-xs text-on-surface-variant">
					{unreadMessageCount > 0
						? `${unreadMessageCount} tin nhắn chưa đọc trong ${unreadThreadCount} hội thoại`
						: "Bạn đã đọc hết tin nhắn"}
				</p>

				<div className="relative">
					<label className="sr-only" htmlFor="inbox-search">
						Tìm hội thoại theo tên, sản phẩm hoặc nội dung
					</label>
					<span
						className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-outline"
						aria-hidden="true"
					>
						search
					</span>
					{/* 16px: anything smaller makes iOS Safari zoom the page on focus. */}
					<input
						id="inbox-search"
						className="w-full rounded-lg border-none bg-surface-container py-2 pl-9 pr-8 text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/30"
						placeholder="Tìm tên, sản phẩm hoặc nội dung..."
						type="search"
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
					/>
					{search && (
						<button
							type="button"
							title="Xóa tìm kiếm"
							aria-label="Xóa tìm kiếm"
							onClick={() => onSearchChange("")}
							className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
						>
							<span className="material-symbols-outlined text-[14px]">close</span>
						</button>
					)}
				</div>

				{search.trim() && (
					<p className="mt-2 text-label-xs text-on-surface-variant tabular-nums" aria-live="polite">
						{conversations.length} hội thoại khớp trong {totalCount} đã tải
					</p>
				)}
			</div>

			<Tabs.Root
				value={tab}
				onValueChange={(next) => onTabChange(next as InboxTab)}
				className="flex min-h-0 flex-1 flex-col"
			>
				<Tabs.List
					aria-label="Lọc hội thoại"
					className="hide-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-outline-variant px-3 pt-1.5"
				>
					{TABS.map((entry) => (
						<Tabs.Trigger
							key={entry.id}
							value={entry.id}
							className="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-t-md border-b-2 border-transparent px-2.5 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface data-[state=active]:border-primary data-[state=active]:bg-primary-container/10 data-[state=active]:text-primary"
						>
							{entry.label}
							{counts[entry.id] > 0 && (
								<span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-tertiary px-1 text-label-xs text-on-tertiary tabular-nums">
									{counts[entry.id]}
								</span>
							)}
						</Tabs.Trigger>
					))}
				</Tabs.List>

				{TABS.map((entry) => (
					<Tabs.Content
						key={entry.id}
						value={entry.id}
						onKeyDown={moveFocus}
						className="min-h-0 flex-1 overflow-y-auto outline-none"
					>
						{panel}
					</Tabs.Content>
				))}
			</Tabs.Root>
		</aside>
	)
}
