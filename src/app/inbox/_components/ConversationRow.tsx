"use client"

import Image from "next/image"

import type { AccountId, Conversation, Listing, Offer, Ticket } from "@/api/generated/types.gen"
import { TICKET_STATUS_VI } from "@/lib/dictionaries"
import { formatMoney } from "@/lib/money"

import { dealLabel, offerForListing } from "../_lib/deal.logic"
import { conversationPreview, conversationTimeLabel, isLastMessageSeen } from "../_lib/inbox.logic"
import { TICKET_STATUS_TONE, ticketKindLine } from "../_lib/ticket.logic"
import Highlight from "./Highlight"

/**
 * One thread in the list: who, when, what is being traded at what price, and what was
 * last said.
 *
 * The middle line is the reason this is not a messenger row. A name and a preview answer
 * "who wrote" but not "about what, for how much" — which in a marketplace is the whole
 * question, and used to need the thread opened to answer. A support thread answers the
 * same two questions with the ticket's subject and its status.
 *
 * Unread is carried by weight and colour rather than by a larger size: the type scale pairs
 * `label` and `body` at matching metrics for exactly this, so an unread row and a read one
 * occupy the same height and the list does not jump as it is read.
 *
 * The "mark read" action is on the row rather than only inside the thread, because
 * clearing a badge should not require reading something you have decided not to read.
 */
export default function ConversationRow({
	conversation,
	accountId,
	listing,
	ticket,
	deals,
	query,
	isActive,
	onSelect,
	onMarkRead,
	isMarkingRead,
}: {
	conversation: Conversation
	accountId: AccountId | undefined
	/** The item the last message pointed at, once the batched lookup has resolved it. */
	listing: Listing | undefined
	/** The ticket behind a support thread, once the lookup has resolved it. */
	ticket: Ticket | undefined
	/** Offers still in play with this counterparty, newest first. */
	deals: readonly Offer[] | undefined
	/** The live search term, marked wherever it matched. */
	query: string
	isActive: boolean
	onSelect: () => void
	onMarkRead: () => void
	isMarkingRead: boolean
}) {
	const contact = conversation.counterparty
	const isUnread = conversation.unread > 0
	const seen = isLastMessageSeen(conversation, accountId)
	// Support answers as the platform, so a ticket row is titled by what was raised rather
	// than by whoever is on shift.
	const isSupport = Boolean(conversation.ticket_id)
	const title = isSupport ? (ticket?.subject ?? "Yêu cầu hỗ trợ") : contact.name

	const offer = offerForListing(deals, listing?.id)
	const standing = dealLabel(deals)

	return (
		<div
			role="button"
			tabIndex={0}
			data-conversation-row
			aria-current={isActive ? "true" : undefined}
			onClick={onSelect}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault()
					onSelect()
				}
			}}
			className={`group flex cursor-pointer items-start gap-3 border-l-[3px] px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
				isActive
					? "border-primary bg-secondary-container/40"
					: "border-transparent bg-surface-container-lowest hover:bg-surface-container"
			}`}
		>
			<div
				className={`relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border text-title-sm ${
					isSupport
						? "border-primary/20 bg-primary-container/10 text-primary"
						: "border-outline-variant bg-surface-container text-on-surface-variant"
				}`}
			>
				{isSupport ? (
					<span className="material-symbols-outlined text-[20px]" aria-hidden="true">
						support_agent
					</span>
				) : contact.avatar?.url ? (
					<Image src={contact.avatar.url} alt="" fill className="object-cover" sizes="40px" />
				) : (
					contact.name.charAt(0)
				)}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline justify-between gap-2">
					<h3
						className={`truncate ${
							isUnread ? "text-label-md text-on-surface" : "text-body-sm text-on-surface"
						}`}
					>
						<Highlight text={title} query={query} />
					</h3>
					<span
						className={`shrink-0 text-label-xs tabular-nums ${
							isUnread ? "text-primary" : "text-outline"
						}`}
					>
						{conversationTimeLabel(conversation.last_message_at)}
					</span>
				</div>

				{/* The deal line: the item, and whatever money is currently on it. Omitted
				    entirely when a thread is about neither — an empty row of dashes says less
				    than one line fewer. */}
				{isSupport ? (
					ticket && (
						<div className="mt-0.5 flex min-w-0 items-center gap-1.5">
							<span
								className={`shrink-0 rounded-full border px-1.5 text-label-xs uppercase ${TICKET_STATUS_TONE[ticket.status]}`}
							>
								{TICKET_STATUS_VI[ticket.status]}
							</span>
							<span className="truncate text-body-xs text-on-surface-variant">
								{ticketKindLine(ticket)}
							</span>
						</div>
					)
				) : listing ? (
					<div className="mt-0.5 flex min-w-0 items-center gap-1.5">
						<span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-[4px] border border-outline-variant bg-surface-container">
							{listing.cover?.url && (
								<Image src={listing.cover.url} alt="" fill className="object-cover" sizes="16px" />
							)}
						</span>
						<span className="truncate text-body-xs text-on-surface-variant">
							<Highlight text={listing.name} query={query} />
						</span>
						{offer ? (
							<span className="ml-auto flex shrink-0 items-center gap-0.5 text-label-sm text-tertiary tabular-nums">
								{offer.status === "accepted" && (
									<span className="material-symbols-outlined text-[13px]" aria-hidden="true">
										handshake
									</span>
								)}
								{formatMoney(offer.total, offer.currency)}
								{offer.quantity > 1 && <span>×{offer.quantity}</span>}
							</span>
						) : (
							<span className="ml-auto shrink-0 text-label-sm text-on-surface-variant tabular-nums">
								{formatMoney(listing.price, listing.currency)}
							</span>
						)}
					</div>
				) : (
					standing && (
						<div className="mt-0.5 flex items-center gap-1 text-label-sm text-tertiary">
							<span className="material-symbols-outlined text-[13px]" aria-hidden="true">
								handshake
							</span>
							{standing}
						</div>
					)
				)}

				<div className="mt-0.5 flex items-center justify-between gap-1.5">
					<p
						className={`flex min-w-0 items-center gap-1 truncate ${
							isUnread ? "text-label-sm text-on-surface" : "text-body-xs text-on-surface-variant"
						}`}
					>
						{seen && (
							<span
								className="material-symbols-outlined shrink-0 text-[13px] text-primary"
								title="Đã xem"
							>
								done_all
							</span>
						)}
						<span className="truncate">
							<Highlight text={conversationPreview(conversation, accountId)} query={query} />
						</span>
					</p>

					{isUnread && (
						<span className="flex shrink-0 items-center gap-1">
							<button
								type="button"
								title="Đánh dấu đã đọc"
								aria-label={`Đánh dấu "${title}" là đã đọc`}
								disabled={isMarkingRead}
								onClick={(event) => {
									event.stopPropagation()
									onMarkRead()
								}}
								className="hidden h-5 w-5 cursor-pointer items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-40 group-hover:flex group-focus-within:flex"
							>
								<span className="material-symbols-outlined text-[14px]">done_all</span>
							</button>
							<span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-label-xs text-on-primary tabular-nums">
								{conversation.unread > 99 ? "99+" : conversation.unread}
							</span>
						</span>
					)}
				</div>
			</div>
		</div>
	)
}
