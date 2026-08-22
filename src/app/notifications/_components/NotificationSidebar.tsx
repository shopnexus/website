"use client"

import Link from "next/link"
import * as Switch from "@radix-ui/react-switch"

import Badge from "@/components/ui/Badge"

import { CATEGORY_FILTERS } from "../_lib/notifications.logic"
import type { CategoryFilter } from "../_types"

export default function NotificationSidebar({
	category,
	onCategoryChange,
	unreadOnly,
	onUnreadOnlyChange,
	unreadCount,
	unreadByCategory,
}: {
	category: CategoryFilter
	onCategoryChange: (category: CategoryFilter) => void
	unreadOnly: boolean
	onUnreadOnlyChange: (unreadOnly: boolean) => void
	unreadCount: number
	/** Per-category counts, keyed by category. The server sends every category, zeros included. */
	unreadByCategory: Record<string, number>
}) {
	return (
		<aside className="md:col-span-4 lg:col-span-3 space-y-6">
			<div className="px-2">
				<h1 className="text-headline-sm text-on-surface flex items-center gap-2.5">
					<span>Thông báo</span>
					{unreadCount > 0 && <Badge variant="primary">{unreadCount} mới</Badge>}
				</h1>
			</div>

			{/* The server's own `unread` filter, not a client-side one: the feed is a cursor
			    stream, so filtering after the fetch would end the list early. */}
			<div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant">
				<label htmlFor="unread-only" className="text-label-md text-on-surface">
					Chỉ hiện chưa đọc
				</label>
				{/* Radix, like every other control in this codebase: the hand-rolled
				    `<button role="switch">` this replaces had no keyboard affordance and no
				    label association. */}
				<Switch.Root
					id="unread-only"
					checked={unreadOnly}
					onCheckedChange={onUnreadOnlyChange}
					className="relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 bg-surface-container-high data-[state=checked]:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				>
					<Switch.Thumb className="block w-5 h-5 rounded-full bg-white border border-outline-variant transition-transform translate-x-[2px] data-[state=checked]:translate-x-[22px]" />
				</Switch.Root>
			</div>

			<nav className="space-y-1.5">
				{CATEGORY_FILTERS.map((entry) => {
					const isActive = category === entry.id
					// "all" counts everything; a category counts its own. Both come from the same
					// answer, so a filter's badge and the bell can never disagree.
					const count = entry.id === "all" ? unreadCount : (unreadByCategory[entry.id] ?? 0)
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
									aria-hidden="true"
								>
									{entry.icon}
								</span>
								<span className="text-label-lg">{entry.label}</span>
							</span>
							{count > 0 && (
								<span className="text-label-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
									{count}
								</span>
							)}
						</button>
					)
				})}
			</nav>

			<Link
				href="/account/notifications"
				className="block p-5 bg-primary-container/10 rounded-2xl border border-primary/15 hover:bg-primary-container/20 transition-colors"
			>
				<p className="text-label-md text-primary mb-1.5 flex items-center gap-2">
					<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
						tune
					</span>
					<span>Cài đặt thông báo</span>
				</p>
				<p className="text-body-xs text-on-surface-variant opacity-90 mb-4 leading-relaxed">
					Chọn nhận thông báo nào qua ứng dụng, email, SMS hay thông báo đẩy.
				</p>
				<span className="text-label-md text-primary hover:underline inline-flex items-center gap-1">
					<span>Tùy chỉnh ngay</span>
					<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
						arrow_forward
					</span>
				</span>
			</Link>
		</aside>
	)
}
