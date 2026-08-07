"use client"

import Image from "next/image"

import type { Conversation } from "@/api/generated/types.gen"

/**
 * Who you are talking to, and how far they have read.
 *
 * The read line is `counterparty_read_at` spelled out. The row has always carried it; the
 * header showed a name and nothing else, so "have they seen it" was unanswerable without
 * waiting for a reply.
 */
export default function ThreadHeader({
	conversation,
	onBack,
}: {
	conversation: Conversation | undefined
	onBack: () => void
}) {
	const contact = conversation?.counterparty
	const readAt = conversation?.counterparty_read_at

	return (
		<div className="px-4 py-2.5 md:px-5 md:py-3 flex justify-between items-center border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md shrink-0">
			<div className="flex items-center gap-2.5 min-w-0">
				<button
					type="button"
					onClick={onBack}
					aria-label="Quay lại danh sách hội thoại"
					className="md:hidden p-1 -ml-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
				>
					<span className="material-symbols-outlined text-[20px]">arrow_back</span>
				</button>

				<div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-outline-variant/30 shrink-0 bg-surface-container flex items-center justify-center text-on-surface-variant font-bold">
					{contact?.avatar?.url ? (
						<Image src={contact.avatar.url} alt={contact.name} fill className="object-cover" />
					) : (
						(contact?.name.charAt(0) ?? "U")
					)}
				</div>

				<div className="min-w-0">
					<h2 className="text-sm md:text-base font-bold text-on-surface truncate">
						{contact?.name || "Người dùng"}
					</h2>
					{conversation && (
						<p className="text-[10px] text-on-surface-variant truncate">
							{readAt
								? `Đã đọc lúc ${new Date(readAt).toLocaleString("vi-VN", {
										hour: "2-digit",
										minute: "2-digit",
										day: "2-digit",
										month: "2-digit",
									})}`
								: "Chưa đọc tin nhắn của bạn"}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
