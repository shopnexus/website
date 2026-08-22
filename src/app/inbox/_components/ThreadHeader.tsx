"use client"

import Image from "next/image"
import Link from "next/link"

import type { Conversation } from "@/api/generated/types.gen"

/**
 * Who you are talking to, how far they have read, and the two things you might do next.
 *
 * The read line is `counterparty_read_at` spelled out — which on a support thread answers
 * "has anyone looked at this yet". The name is a link because the question that follows
 * "who is this" is "who are they", and reputation is a page away rather than a guess; the
 * desk has no such page, so it is not one.
 */
export default function ThreadHeader({
	conversation,
	productHref,
	isSupport,
	onBack,
	onToggleInfo,
	isInfoOpen,
}: {
	conversation: Conversation | undefined
	/** The item this thread is about, when one has resolved. */
	productHref: string | undefined
	/** A ticket's thread: the other side is the desk, which answers as the platform. */
	isSupport: boolean
	onBack: () => void
	onToggleInfo: () => void
	isInfoOpen: boolean
}) {
	const contact = conversation?.counterparty
	const readAt = conversation?.counterparty_read_at

	return (
		<div className="px-3 py-2.5 md:px-5 md:py-3 flex justify-between items-center gap-2 border-b border-outline-variant bg-surface/80 backdrop-blur-md shrink-0">
			<div className="flex items-center gap-2.5 min-w-0">
				<button
					type="button"
					onClick={onBack}
					aria-label="Quay lại danh sách hội thoại"
					className="md:hidden p-1 -ml-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
				>
					<span className="material-symbols-outlined text-[20px]">arrow_back</span>
				</button>

				<div
					className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border shrink-0 flex items-center justify-center text-title-sm ${
						isSupport
							? "border-primary/20 bg-primary-container/10 text-primary"
							: "border-outline-variant bg-surface-container text-on-surface-variant"
					}`}
				>
					{isSupport ? (
						<span className="material-symbols-outlined text-[20px]" aria-hidden="true">
							support_agent
						</span>
					) : contact?.avatar?.url ? (
						<Image src={contact.avatar.url} alt="" fill className="object-cover" sizes="40px" />
					) : (
						(contact?.name.charAt(0) ?? "U")
					)}
				</div>

				<div className="min-w-0">
					{isSupport ? (
						<h2 className="text-title-sm text-on-surface md:text-title-md">ShopNexus Hỗ trợ</h2>
					) : contact ? (
						<Link
							href={`/shop/${contact.id}`}
							className="block truncate text-title-sm text-on-surface transition-colors hover:text-primary md:text-title-md"
						>
							{contact.name}
						</Link>
					) : (
						<h2 className="text-title-sm text-on-surface md:text-title-md">Người dùng</h2>
					)}
					{conversation && (
						<p className="truncate text-label-xs text-on-surface-variant">
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

			<div className="flex items-center gap-0.5 shrink-0">
				{productHref && (
					<Link
						href={productHref}
						title="Mở trang sản phẩm"
						aria-label="Mở trang sản phẩm"
						className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
					>
						<span className="material-symbols-outlined text-[19px]">open_in_new</span>
					</Link>
				)}

				{/* The rail does not fit below `lg`, where this is the only way to reach the
				    price, the stock and who you are dealing with. */}
				<button
					type="button"
					onClick={onToggleInfo}
					aria-expanded={isInfoOpen}
					aria-label="Thông tin giao dịch"
					title="Thông tin giao dịch"
					className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
						isInfoOpen
							? "text-primary bg-primary-container/15"
							: "text-on-surface-variant hover:text-primary hover:bg-surface-container"
					}`}
				>
					<span className="material-symbols-outlined text-[19px]">info</span>
				</button>
			</div>
		</div>
	)
}
