"use client"

import type { AccountId, Conversation, ConversationId } from "@/api/generated/types.gen"
import { useMarkConversationRead } from "@/hooks/api/useChat"

import type { InboxTab } from "../_types"
import ConversationRow from "./ConversationRow"

interface InboxSidebarProps {
	conversations: readonly Conversation[]
	accountId: AccountId | undefined
	activeId: ConversationId | ""
	tab: InboxTab
	onTabChange: (tab: InboxTab) => void
	search: string
	onSearchChange: (search: string) => void
	unreadThreadCount: number
	unreadMessageCount: number
	totalCount: number
	isLoading: boolean
	hasNextPage: boolean
	isFetchingNextPage: boolean
	onLoadMore: () => void
	onSelect: (id: ConversationId) => void
	hidden: boolean
}

const TABS: Array<{ id: InboxTab; label: string }> = [
	{ id: "all", label: "Tất cả" },
	{ id: "unread", label: "Chưa đọc" },
]

export default function InboxSidebar({
	conversations,
	accountId,
	activeId,
	tab,
	onTabChange,
	search,
	onSearchChange,
	unreadThreadCount,
	unreadMessageCount,
	totalCount,
	isLoading,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onSelect,
	hidden,
}: InboxSidebarProps) {
	const markRead = useMarkConversationRead()

	return (
		<aside
			className={`w-full md:w-[300px] lg:w-[320px] xl:w-[340px] 2xl:w-[360px] shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-full absolute md:relative z-20 transition-transform duration-300 ${
				hidden ? "-translate-x-full md:translate-x-0" : "translate-x-0"
			}`}
		>
			<div className="p-4 border-b border-outline-variant/20 shrink-0">
				<h1 className="text-base font-bold text-on-surface mb-1 flex items-center justify-between">
					<span>Hộp thư</span>
					<span className="text-[11px] font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/30">
						{totalCount} hội thoại
					</span>
				</h1>
				<p className="text-[11px] text-on-surface-variant mb-3">
					{unreadMessageCount > 0
						? `${unreadMessageCount} tin nhắn chưa đọc trong ${unreadThreadCount} hội thoại`
						: "Bạn đã đọc hết tin nhắn"}
				</p>
				<div className="relative">
					<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
						search
					</span>
					<input
						className="w-full pl-9 pr-8 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-xs transition-all outline-none text-on-surface placeholder:text-outline"
						placeholder="Tìm theo tên hoặc nội dung..."
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
							className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
						>
							<span className="material-symbols-outlined text-[14px]">close</span>
						</button>
					)}
				</div>
			</div>

			<div className="flex border-b border-outline-variant/20 px-4 bg-surface-container-lowest gap-1.5 pt-1.5 shrink-0 overflow-x-auto no-scrollbar">
				{TABS.map((entry) => (
					<button
						key={entry.id}
						type="button"
						onClick={() => onTabChange(entry.id)}
						className={`py-2 px-2.5 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1 cursor-pointer ${
							tab === entry.id
								? "text-primary border-primary font-bold bg-primary-container/10 rounded-t-md"
								: "text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-container-low rounded-t-md"
						}`}
					>
						{entry.label}
						{entry.id === "unread" && unreadThreadCount > 0 && (
							<span className="min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary flex items-center justify-center text-[9px] font-bold">
								{unreadThreadCount}
							</span>
						)}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
				{isLoading && (
					<div className="p-8 flex justify-center">
						<span className="material-symbols-outlined animate-spin text-primary">
							progress_activity
						</span>
					</div>
				)}

				{!isLoading && conversations.length === 0 && (
					<div className="p-8 text-center text-xs text-on-surface-variant">
						{search
							? "Không có hội thoại nào khớp với từ khóa."
							: tab === "unread"
								? // The badge counts every thread; the list only holds the pages
									// loaded so far, so the two can honestly disagree.
									unreadThreadCount > 0
									? "Hội thoại chưa đọc nằm ở trang sau. Tải thêm để xem."
									: "Không có tin nhắn chưa đọc."
								: "Chưa có cuộc trò chuyện nào."}
					</div>
				)}

				{conversations.map((conversation) => (
					<ConversationRow
						key={conversation.id}
						conversation={conversation}
						accountId={accountId}
						isActive={activeId === conversation.id}
						onSelect={() => onSelect(conversation.id)}
						onMarkRead={() => markRead.mutate(conversation.id)}
						isMarkingRead={markRead.isPending}
					/>
				))}

				{/* The list is a cursor stream. Searching only reaches what is loaded, so the
				    way to widen a search is to load more of it. */}
				{hasNextPage && (
					<div className="p-3 flex justify-center">
						<button
							type="button"
							disabled={isFetchingNextPage}
							onClick={onLoadMore}
							className="px-4 py-1.5 rounded-full border border-outline-variant text-[11px] font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50 cursor-pointer"
						>
							{isFetchingNextPage ? "Đang tải..." : "Tải thêm hội thoại"}
						</button>
					</div>
				)}
			</div>
		</aside>
	)
}
