"use client"

import Image from "next/image"

import type { AccountId, Message } from "@/api/generated/types.gen"
import OfferMessageCard from "@/components/offers/OfferMessageCard"

import MessageActions from "./MessageActions"
import MessageAttachments from "./MessageAttachments"
import MessageEditor from "./MessageEditor"
import QuoteBlock from "./QuoteBlock"
import { formatClock, isRedacted, offerIdOf, quoteLines } from "./chat.logic"
import type { Counterparty } from "./types"

const SUPPORT_NAME = "ShopNexus Hỗ trợ"

interface MessageRowProps {
	message: Message
	isMine: boolean
	canModify: boolean
	/** The reader, so a quote of their own words reads "Bạn". */
	accountId: AccountId | undefined
	counterparty?: Counterparty
	/** Set briefly after jumping here from a reply, so the eye finds the row. */
	isHighlighted?: boolean
	/** "Đã xem"/"Đã gửi" on the newest message the caller sent, and nowhere else. */
	receipt?: string
	isEditing: boolean
	isSaving: boolean
	onStartEdit: () => void
	onCancelEdit: () => void
	onSaveEdit: (body: string) => void
	onDelete: () => void
	/** The message's own image set and the one that was clicked, for the viewer. */
	onOpenImage: (images: string[], index: number) => void
	/** Only on the other side's messages, and only where the host offers reporting. */
	onReport?: () => void
	/** Start a reply to this message. Absent where the thread does not accept one. */
	onReply?: () => void
	/** Scroll to the message this one answers. */
	onJumpToQuoted?: () => void
}

/** A redaction keeps the row and loses the content, so the thread has no unexplained gap. */
function RedactedBubble({ isMine }: { isMine: boolean }) {
	return (
		<div
			className={`px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm italic border border-dashed border-outline-variant text-on-surface-variant bg-transparent ${
				isMine ? "rounded-br-sm" : "rounded-bl-sm"
			}`}
		>
			Tin nhắn đã được thu hồi
		</div>
	)
}

export default function MessageRow({
	message,
	isMine,
	canModify,
	accountId,
	counterparty,
	isHighlighted,
	receipt,
	isEditing,
	isSaving,
	onStartEdit,
	onCancelEdit,
	onSaveEdit,
	onDelete,
	onOpenImage,
	onReport,
	onReply,
	onJumpToQuoted,
}: MessageRowProps) {
	const redacted = isRedacted(message)
	const offerId = offerIdOf(message)
	const card = offerId ? <OfferMessageCard offerId={offerId} /> : null
	const edited = message.edited_at !== null && !redacted

	// The quote rides inside the bubble's column on either side, so it reads as part of the
	// message rather than as a row of its own.
	const quote = message.reply_to ? (
		<QuoteBlock
			lines={quoteLines(message.reply_to, accountId, counterparty?.name)}
			tone={isMine ? "mine" : "theirs"}
			onJump={onJumpToQuoted}
		/>
	) : null

	// What a jump from a quote scrolls to, and how the row shows that it was found.
	const found = `rounded-xl transition-shadow motion-reduce:transition-none${
		isHighlighted ? " ring-2 ring-tertiary/60" : ""
	}`

	if (isMine) {
		return (
			<div
				data-message-id={message.id}
				className={`group flex gap-1.5 max-w-[85%] md:max-w-[75%] ml-auto justify-end ${found}`}
			>
				{!isEditing && (
					<MessageActions
						onEdit={canModify ? onStartEdit : undefined}
						onDelete={canModify ? onDelete : undefined}
						onReply={onReply}
						isBusy={isSaving}
					/>
				)}
				<div className="flex flex-col items-end space-y-1.5 min-w-0">
					{quote}
					<MessageAttachments
						attachments={message.attachments}
						isMine
						onOpen={onOpenImage}
					/>

					{isEditing ? (
						<MessageEditor
							initialBody={message.body}
							isSaving={isSaving}
							onSave={onSaveEdit}
							onCancel={onCancelEdit}
						/>
					) : redacted ? (
						<RedactedBubble isMine />
					) : (
						(card ??
							(message.body ? (
								<div className="bg-primary text-on-primary px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-br-sm text-xs md:text-sm shadow-sm leading-relaxed break-words whitespace-pre-wrap max-w-full">
									{message.body}
								</div>
							) : null))
					)}

					<span className="text-label-xs text-outline flex items-center gap-1">
						{edited && <span className="italic">đã chỉnh sửa</span>}
						<span>{formatClock(message.created_at)}</span>
						{receipt && (
							<span className="flex items-center gap-0.5 font-semibold text-primary">
								<span className="material-symbols-outlined text-[11px]">
									{receipt === "Đã xem" ? "done_all" : "done"}
								</span>
								{receipt}
							</span>
						)}
					</span>
				</div>
			</div>
		)
	}

	// A system note and a support reply both arrive with a null `sender_id`, so
	// `from_support` is the only thing that tells them apart.
	if (!message.sender_id && !message.from_support) {
		return (
			<div data-message-id={message.id} className={`flex w-full justify-center my-4 ${found}`}>
				<div className="flex flex-col items-center">
					{card ??
						(message.body ? (
							<span className="bg-surface-container-high px-3 py-1 rounded-full text-label-xs md:text-label-sm text-on-surface-variant max-w-[80%] text-center">
								{message.body}
							</span>
						) : null)}
					<span className="text-label-xs text-outline mt-1 block">
						{formatClock(message.created_at)}
					</span>
				</div>
			</div>
		)
	}

	// Support answers as the platform, never as a person: staff are anonymous to the
	// requester, so there is no avatar and no name to show but the desk's.
	const fromSupport = Boolean(message.from_support)
	const incomingName = counterparty?.name ?? "Người dùng"

	return (
		<div
			data-message-id={message.id}
			className={`group flex gap-2.5 max-w-[85%] md:max-w-[75%] ${found}`}
		>
			<div className="relative w-7 h-7 rounded-full overflow-hidden self-end mb-4 shrink-0 border border-outline-variant bg-surface-container flex items-center justify-center text-xs">
				{fromSupport ? (
					<span className="material-symbols-outlined text-primary text-[16px]">support_agent</span>
				) : counterparty?.avatarUrl ? (
					<Image src={counterparty.avatarUrl} alt="" fill className="object-cover" />
				) : (
					incomingName.charAt(0)
				)}
			</div>
			<div className="flex flex-col items-start space-y-1.5 min-w-0">
				{fromSupport && <span className="text-label-xs text-primary">{SUPPORT_NAME}</span>}

				{quote}

				<MessageAttachments
					attachments={message.attachments}
					isMine={false}
					onOpen={onOpenImage}
				/>

				{redacted ? (
					<RedactedBubble isMine={false} />
				) : (
					(card ??
						(message.body ? (
							<div className="bg-surface-container-high text-on-surface px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-bl-sm text-xs md:text-sm shadow-sm leading-relaxed break-words whitespace-pre-wrap border border-outline-variant max-w-full">
								{message.body}
							</div>
						) : null))
				)}

				<span className="text-label-xs text-outline pl-1 flex items-center gap-1">
					{edited && <span className="italic">đã chỉnh sửa</span>}
					<span>{formatClock(message.created_at)}</span>
				</span>
			</div>

			{/* Reporting is not offered on a redacted message: there is nothing left in it. */}
			<MessageActions onReply={onReply} onReport={redacted ? undefined : onReport} />
		</div>
	)
}
