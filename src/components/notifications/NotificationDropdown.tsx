"use client"

import Link from "next/link"
import * as Popover from "@radix-ui/react-popover"
import { useState } from "react"

import { useMarkNotificationsRead, useNotificationsFeed, useUnreadCount } from "@/hooks/api/useNotifications"
import { useAuthStore } from "@/stores/use-auth-store"

import Skeleton from "../ui/Skeleton"
import NotificationRow from "./NotificationRow"

/**
 * The bell.
 *
 * A Radix popover rather than a hand-rolled panel: outside-click, Escape, focus return and the
 * `aria-expanded` on the trigger come with it, and it portals out so no ancestor's
 * `overflow-hidden` can clip it. The version this replaces bound its own `mousedown` listener
 * and had none of the rest.
 *
 * Opening it marks nothing read. It used to mark the whole feed read up to its newest row —
 * glancing at the bell destroyed the unread list — which was not a choice so much as the only
 * thing a time bound could express. A row is now addressed by its id, so reading one is reading
 * one.
 */
export default function NotificationDropdown() {
	const [isOpen, setIsOpen] = useState(false)
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

	// Pushed over the socket while signed in; disabled entirely when signed out — the
	// endpoint needs a token, and fetching it without one was a 401.
	const { unread } = useUnreadCount({ enabled: isAuthenticated })

	// Only fetched once the panel is open. Six rows is all it shows.
	const { notifications, isLoading } = useNotificationsFeed({
		limit: 6,
		enabled: isOpen && isAuthenticated,
	})

	const markRead = useMarkNotificationsRead()

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger
				aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
				className={`relative pb-1 px-2 transition-all cursor-pointer flex items-center justify-center border-b-2 duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
					isOpen
						? "text-primary border-primary font-bold"
						: "text-on-surface-variant border-transparent hover:text-primary"
				}`}
			>
				<span
					className="material-symbols-outlined"
					style={{ fontVariationSettings: isOpen ? "'FILL' 1" : "'FILL' 0" }}
					aria-hidden="true"
				>
					notifications
				</span>
				{unread > 0 && (
					<span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
						{unread > 99 ? "99+" : unread}
					</span>
				)}
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content
					align="end"
					sideOffset={8}
					className="w-[22rem] bg-surface rounded-2xl shadow-lg border border-outline-variant overflow-hidden z-50"
				>
					<div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
						<h3 className="text-title-sm text-on-surface">Thông báo</h3>
						{unread > 0 && (
							<button
								type="button"
								onClick={() => markRead.mutate(undefined)}
								disabled={markRead.isPending}
								className="text-label-md text-primary hover:underline cursor-pointer disabled:opacity-50"
							>
								Đọc tất cả
							</button>
						)}
					</div>

					<div className="max-h-96 overflow-y-auto">
						{isLoading ? (
							<div className="p-4 space-y-4">
								{[0, 1, 2].map((i) => (
									<div key={i} className="flex gap-3">
										<Skeleton shape="circle" className="w-10 h-10 shrink-0" />
										<div className="flex-grow space-y-2">
											<Skeleton className="h-3 w-3/5" />
											<Skeleton className="h-3 w-4/5" />
										</div>
									</div>
								))}
							</div>
						) : notifications.length === 0 ? (
							<p className="p-8 text-center text-body-sm text-on-surface-variant">
								Không có thông báo nào.
							</p>
						) : (
							<div className="divide-y divide-outline-variant">
								{notifications.map((notification) => (
									<NotificationRow
										key={notification.id}
										notification={notification}
										variant="compact"
										isMarking={markRead.isPending}
										onMarkRead={() => markRead.mutate({ ids: [notification.id] })}
									/>
								))}
							</div>
						)}
					</div>

					<div className="p-3 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
						<Link
							href="/notifications"
							className="text-label-md text-primary hover:underline"
						>
							Xem tất cả
						</Link>
						<Link
							href="/account/notifications"
							className="text-label-sm text-on-surface-variant hover:text-primary"
						>
							Cài đặt
						</Link>
					</div>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
