"use client"

import Image from "next/image"

import type { AccountId, Conversation } from "@/api/generated/types.gen"

import { conversationPreview, conversationTimeLabel, isLastMessageSeen } from "../_lib/inbox.logic"

/**
 * One thread in the list: who, when, what was last said, and whether it landed.
 *
 * The "mark read" action is on the row rather than only inside the thread, because
 * clearing a badge should not require reading something you have decided not to read.
 */
export default function ConversationRow({
	conversation,
	accountId,
	isActive,
	onSelect,
	onMarkRead,
	isMarkingRead,
}: {
	conversation: Conversation
	accountId: AccountId | undefined
	isActive: boolean
	onSelect: () => void
	onMarkRead: () => void
	isMarkingRead: boolean
}) {
	const contact = conversation.counterparty
	const isUnread = conversation.unread > 0
	const seen = isLastMessageSeen(conversation, accountId)

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault()
					onSelect()
				}
			}}
			className={`group p-3 flex items-center gap-2.5 transition-colors cursor-pointer border-l-[3px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
				isActive
					? "bg-secondary-container/30 border-primary"
					: "hover:bg-surface-container border-transparent bg-surface-container-lowest"
			}`}
		>
			<div className="relative shrink-0">
				<div className="w-10 h-10 rounded-full overflow-hidden relative border border-outline-variant/20 bg-surface-container flex items-center justify-center text-on-surface-variant font-bold">
					{contact.avatar?.url ? (
						<Image src={contact.avatar.url} alt={contact.name} fill className="object-cover" />
					) : (
						contact.name.charAt(0)
					)}
				</div>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-center mb-0.5 gap-2">
					<h3
						className={`text-xs truncate ${isUnread ? "font-bold text-on-surface" : "font-medium text-on-surface"}`}
					>
						{contact.name}
					</h3>
					<span
						className={`text-[10px] shrink-0 font-medium ${isUnread ? "text-primary font-bold" : "text-outline"}`}
					>
						{conversationTimeLabel(conversation.last_message_at)}
					</span>
				</div>

				<div className="flex justify-between items-center gap-1.5">
					<p
						className={`text-xs truncate flex items-center gap-1 ${
							isUnread ? "text-on-surface font-semibold" : "text-on-surface-variant"
						}`}
					>
						{seen && (
							<span
								className="material-symbols-outlined text-[13px] text-primary shrink-0"
								title="Đã xem"
							>
								done_all
							</span>
						)}
						<span className="truncate">{conversationPreview(conversation, accountId)}</span>
					</p>

					{isUnread ? (
						<span className="flex items-center gap-1 shrink-0">
							<button
								type="button"
								title="Đánh dấu đã đọc"
								aria-label="Đánh dấu đã đọc"
								disabled={isMarkingRead}
								onClick={(event) => {
									event.stopPropagation()
									onMarkRead()
								}}
								className="hidden group-hover:flex group-focus-within:flex w-5 h-5 rounded-full items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-40"
							>
								<span className="material-symbols-outlined text-[14px]">done_all</span>
							</button>
							<span className="min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary flex items-center justify-center text-[9px] font-bold">
								{conversation.unread > 99 ? "99+" : conversation.unread}
							</span>
						</span>
					) : null}
				</div>
			</div>
		</div>
	)
}
