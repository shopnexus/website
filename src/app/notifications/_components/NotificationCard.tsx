"use client"

import Link from "next/link"

import type { Notification } from "@/api/generated/types.gen"
import { notificationBody, notificationHref } from "@/lib/notification-display"

import { CATEGORY_STYLES } from "../_lib/notifications.logic"

/**
 * One row of the feed.
 *
 * Opening it is the read receipt, bounded at this row's own instant: everything older
 * goes with it, anything newer stays unread. Rows with nowhere to go get the same action
 * as a button, so a promotion with no deep link is still dismissible.
 */
export default function NotificationCard({
	notification,
	onMarkRead,
	isMarking,
}: {
	notification: Notification
	onMarkRead: () => void
	isMarking: boolean
}) {
	const isUnread = notification.read_at === null
	const style = CATEGORY_STYLES[notification.category]
	const body = notificationBody(notification)
	const href = notificationHref(notification)

	const content = (
		<>
			<div className="shrink-0">
				<div
					className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center shadow-sm`}
				>
					<span className={`material-symbols-outlined text-[24px] ${style.color}`}>
						{style.icon}
					</span>
				</div>
			</div>

			<div className="flex-grow min-w-0">
				<div className="flex justify-between items-start mb-1 gap-3">
					<h3
						className={`font-headline text-body-md font-extrabold ${isUnread ? "text-primary" : "text-on-surface"}`}
					>
						{notification.title}
					</h3>
					<span className="text-label-xs text-outline font-medium shrink-0 whitespace-nowrap">
						{new Date(notification.created_at).toLocaleTimeString("vi-VN", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>

				{body && (
					<p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-3">{body}</p>
				)}

				<div className="mt-3 flex items-center gap-2 flex-wrap">
					{href && (
						<span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-label-sm font-bold shadow-sm bg-surface-container border border-outline-variant/40 text-on-surface group-hover:border-primary/50 transition-colors">
							<span>Xem chi tiết</span>
							<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
						</span>
					)}

					{isUnread && (
						<button
							type="button"
							disabled={isMarking}
							title="Đánh dấu thông báo này và những thông báo cũ hơn là đã đọc"
							onClick={(event) => {
								event.preventDefault()
								event.stopPropagation()
								onMarkRead()
							}}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50"
						>
							<span className="material-symbols-outlined text-[16px]">done_all</span>
							<span>Đánh dấu đã đọc từ đây</span>
						</button>
					)}
				</div>
			</div>
		</>
	)

	const shell = `group p-5 rounded-2xl border transition-all duration-300 flex gap-4 relative ${
		isUnread
			? "bg-surface-container-lowest border-primary/30 shadow-md shadow-primary/5 hover:border-primary/60"
			: "bg-surface border-outline-variant/20 opacity-85 hover:opacity-100 hover:bg-surface-container-lowest/60"
	}`

	if (!href) return <div className={shell}>{content}</div>

	return (
		<Link
			href={href}
			className={`${shell} cursor-pointer`}
			onClick={() => {
				if (isUnread) onMarkRead()
			}}
		>
			{content}
		</Link>
	)
}
