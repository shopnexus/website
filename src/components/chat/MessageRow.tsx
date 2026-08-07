"use client"

import Image from "next/image"

import type { Message } from "@/api/generated/types.gen"
import OfferMessageCard from "@/components/offers/OfferMessageCard"

import MessageActions from "./MessageActions"
import MessageAttachments from "./MessageAttachments"
import MessageEditor from "./MessageEditor"
import { formatClock, isRedacted, offerIdOf } from "./chat.logic"
import type { Counterparty } from "./types"

const SUPPORT_NAME = "ShopNexus Hỗ trợ"

interface MessageRowProps {
	message: Message
	isMine: boolean
	canModify: boolean
	counterparty?: Counterparty
	/** "Đã xem"/"Đã gửi" on the newest message the caller sent, and nowhere else. */
	receipt?: string
	isEditing: boolean
	isSaving: boolean
	onStartEdit: () => void
	onCancelEdit: () => void
	onSaveEdit: (body: string) => void
	onDelete: () => void
	onOpenImage: (url: string) => void
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
	counterparty,
	receipt,
	isEditing,
	isSaving,
	onStartEdit,
	onCancelEdit,
	onSaveEdit,
	onDelete,
	onOpenImage,
}: MessageRowProps) {
	const redacted = isRedacted(message)
	const offerId = offerIdOf(message)
	const card = offerId ? <OfferMessageCard offerId={offerId} /> : null
	const edited = message.edited_at !== null && !redacted

	if (isMine) {
		return (
			<div className="group flex gap-1.5 max-w-[85%] md:max-w-[75%] ml-auto justify-end">
				{canModify && !isEditing && (
					<MessageActions onEdit={onStartEdit} onDelete={onDelete} isBusy={isSaving} />
				)}
				<div className="flex flex-col items-end space-y-1.5 min-w-0">
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

					<span className="text-[9px] text-outline flex items-center gap-1">
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
			<div className="flex w-full justify-center my-4">
				<div className="flex flex-col items-center">
					{card ??
						(message.body ? (
							<span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] md:text-xs text-on-surface-variant max-w-[80%] text-center">
								{message.body}
							</span>
						) : null)}
					<span className="text-[9px] text-outline mt-1 block">
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
		<div className="flex gap-2.5 max-w-[85%] md:max-w-[75%]">
			<div className="relative w-7 h-7 rounded-full overflow-hidden self-end mb-4 shrink-0 border border-outline-variant/30 bg-surface-container flex items-center justify-center text-xs">
				{fromSupport ? (
					<span className="material-symbols-outlined text-primary text-[16px]">support_agent</span>
				) : counterparty?.avatarUrl ? (
					<Image src={counterparty.avatarUrl} alt="" fill className="object-cover" />
				) : (
					incomingName.charAt(0)
				)}
			</div>
			<div className="flex flex-col items-start space-y-1.5 min-w-0">
				{fromSupport && <span className="text-[10px] font-bold text-primary">{SUPPORT_NAME}</span>}

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
							<div className="bg-surface-container-high text-on-surface px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-bl-sm text-xs md:text-sm shadow-sm leading-relaxed break-words whitespace-pre-wrap border border-outline-variant/20 max-w-full">
								{message.body}
							</div>
						) : null))
				)}

				<span className="text-[9px] text-outline pl-1 flex items-center gap-1">
					{edited && <span className="italic">đã chỉnh sửa</span>}
					<span>{formatClock(message.created_at)}</span>
				</span>
			</div>
		</div>
	)
}
