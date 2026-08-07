"use client"

import Link from "next/link"

import { CATEGORY_FILTERS } from "../_lib/notifications.logic"
import type { CategoryFilter } from "../_types"

export default function NotificationSidebar({
	category,
	onCategoryChange,
	unreadOnly,
	onUnreadOnlyChange,
	unreadCount,
}: {
	category: CategoryFilter
	onCategoryChange: (category: CategoryFilter) => void
	unreadOnly: boolean
	onUnreadOnlyChange: (unreadOnly: boolean) => void
	unreadCount: number
}) {
	return (
		<aside className="md:col-span-4 lg:col-span-3 space-y-6">
			<div className="px-2">
				<h1 className="font-headline text-headline-sm font-extrabold text-on-surface flex items-center gap-2.5">
					<span>Thông báo</span>
					{unreadCount > 0 && (
						<span className="text-label-xs font-bold bg-primary text-on-primary px-2.5 py-0.5 rounded-full">
							{unreadCount} mới
						</span>
					)}
				</h1>
			</div>

			{/* The server's own `unread` filter, not a client-side one: the feed is a cursor
			    stream, so filtering after the fetch would end the list early. */}
			<div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
				<label htmlFor="unread-only" className="text-body-sm font-bold text-on-surface">
					Chỉ hiện chưa đọc
				</label>
				<button
					id="unread-only"
					type="button"
					role="switch"
					aria-checked={unreadOnly}
					onClick={() => onUnreadOnlyChange(!unreadOnly)}
					className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
						unreadOnly ? "bg-primary" : "bg-surface-container-high"
					}`}
				>
					<span
						className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white border border-outline-variant/40 transition-transform ${
							unreadOnly ? "translate-x-5" : "translate-x-0"
						}`}
					/>
				</button>
			</div>

			<nav className="space-y-1.5">
				{CATEGORY_FILTERS.map((entry) => {
					const isActive = category === entry.id
					return (
						<button
							key={entry.id}
							type="button"
							onClick={() => onCategoryChange(entry.id)}
							className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
								isActive
									? "bg-secondary-container text-on-secondary-container shadow-sm"
									: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
							}`}
						>
							<span className="flex items-center gap-3">
								<span
									className="material-symbols-outlined text-[22px]"
									style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
								>
									{entry.icon}
								</span>
								<span className="text-body-md font-bold">{entry.label}</span>
							</span>
							{entry.id === "all" && unreadCount > 0 && (
								<span className="text-label-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
									{unreadCount}
								</span>
							)}
						</button>
					)
				})}
			</nav>

			<Link
				href="/dashboard/notifications"
				className="block p-5 bg-primary-container/10 rounded-2xl border border-primary/15 hover:bg-primary-container/20 transition-colors"
			>
				<p className="text-body-sm text-primary font-bold mb-1.5 flex items-center gap-2">
					<span className="material-symbols-outlined text-[18px]">tune</span>
					<span>Cài đặt thông báo</span>
				</p>
				<p className="text-body-xs text-on-surface-variant opacity-90 mb-4 leading-relaxed">
					Chọn nhận thông báo nào qua ứng dụng, email, SMS hay thông báo đẩy.
				</p>
				<span className="text-label-sm text-primary font-extrabold hover:underline inline-flex items-center gap-1">
					<span>Tùy chỉnh ngay</span>
					<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
				</span>
			</Link>
		</aside>
	)
}
