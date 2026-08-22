"use client"

import Link from "next/link"

import type { Notification } from "@/api/generated/types.gen"
import { timeAgo } from "@/lib/day"
import { categoryStyle } from "@/lib/notification-display"

/**
 * One notification, drawn once for both places that show them: the inbox page and the bell's
 * panel. They used to be two copies of the same markup, and the panel's had already fallen a
 * revision behind — it showed no link and a raw `toLocaleString` timestamp.
 *
 * Reading it is per-row. Opening the panel used to mark the whole feed read up to its newest
 * row, so glancing at the bell destroyed the unread list; a row is now addressed by its own id,
 * and nothing is marked read that the reader did not act on.
 */
export default function NotificationRow({
	notification,
	onMarkRead,
	isMarking,
	variant = "card",
}: {
	notification: Notification
	/** Mark this one read. Called on open, and by the button on a row with nowhere to open. */
	onMarkRead: () => void
	isMarking: boolean
	/** `card` is the inbox page; `compact` is the bell's panel, which has a fifth of the width. */
	variant?: "card" | "compact"
}) {
	const isUnread = notification.read_at === null
	const style = categoryStyle(notification.category)
	const compact = variant === "compact"

	const body = (
		<>
			<div
				className={`${compact ? "w-10 h-10 rounded-xl" : "w-12 h-12 rounded-2xl"} ${style.bg} flex items-center justify-center shrink-0`}
			>
				<span
					className={`material-symbols-outlined ${compact ? "text-[20px]" : "text-[24px]"} ${style.color}`}
					aria-hidden="true"
				>
					{style.icon}
				</span>
			</div>

			<div className="flex-grow min-w-0">
				<div className="flex justify-between items-start gap-3">
					<h3
						className={`${compact ? "text-title-sm" : "text-title-md"} ${isUnread ? "text-on-surface" : "text-on-surface-variant"} line-clamp-2`}
					>
						{notification.title}
					</h3>
					{/* An unread row says so with a dot rather than a colour the reader has to
					    compare against the row beside it. */}
					{isUnread && (
						<span
							className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0"
							aria-label="Chưa đọc"
						/>
					)}
				</div>

				{notification.body && (
					<p
						className={`text-body-sm text-on-surface-variant leading-relaxed mt-0.5 ${compact ? "line-clamp-2" : "line-clamp-3"}`}
					>
						{notification.body}
					</p>
				)}

				<div className="mt-2 flex items-center gap-3 flex-wrap">
					{/* Relative, with the exact instant on hover: "3 giờ trước" is what a reader
					    wants, and the timestamp is what they need when it matters. */}
					<time
						dateTime={notification.created_at}
						title={new Date(notification.created_at).toLocaleString("vi-VN")}
						className="text-label-xs text-outline"
					>
						{timeAgo(notification.created_at)}
					</time>

					{notification.href && !compact && (
						<span className="text-label-md text-primary inline-flex items-center gap-1">
							<span>Xem chi tiết</span>
							<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
								arrow_forward
							</span>
						</span>
					)}

					{/* Only for a row with nowhere to go — everything else is marked read by
					    opening it, and two ways to do one thing is a row of buttons. */}
					{isUnread && !notification.href && (
						<button
							type="button"
							disabled={isMarking}
							onClick={onMarkRead}
							className="text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
						>
							Đánh dấu đã đọc
						</button>
					)}
				</div>
			</div>
		</>
	)

	const shell = [
		"flex gap-3 transition-colors text-left w-full",
		compact ? "p-4" : "p-5 rounded-2xl border",
		compact
			? isUnread
				? "bg-primary/5 hover:bg-primary/10"
				: "hover:bg-surface-container-lowest"
			: isUnread
				? "bg-surface-container-lowest border-primary/30 hover:border-primary/60"
				: "bg-surface border-outline-variant hover:bg-surface-container-lowest/60",
	].join(" ")

	if (!notification.href) return <div className={shell}>{body}</div>

	return (
		<Link
			href={notification.href}
			className={`${shell} cursor-pointer`}
			onClick={() => {
				if (isUnread) onMarkRead()
			}}
		>
			{body}
		</Link>
	)
}
