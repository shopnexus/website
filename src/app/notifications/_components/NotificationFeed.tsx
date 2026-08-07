"use client"

import type { Notification } from "@/api/generated/types.gen"
import type { DayGroup } from "@/lib/day"

import { notificationKey } from "../_lib/notifications.logic"
import NotificationCard from "./NotificationCard"

export default function NotificationFeed({
	days,
	isLoading,
	unreadOnly,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onMarkReadUpTo,
	isMarking,
}: {
	days: ReadonlyArray<DayGroup<Notification>>
	isLoading: boolean
	unreadOnly: boolean
	hasNextPage: boolean
	isFetchingNextPage: boolean
	onLoadMore: () => void
	onMarkReadUpTo: (createdAt: string) => void
	isMarking: boolean
}) {
	if (isLoading) {
		return (
			<div className="flex justify-center py-20">
				<span className="material-symbols-outlined animate-spin text-primary text-4xl">
					progress_activity
				</span>
			</div>
		)
	}

	if (days.length === 0) {
		return (
			<div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 space-y-3">
				<span className="material-symbols-outlined text-[48px] text-outline/50">
					notifications_off
				</span>
				<p className="text-body-lg font-bold text-on-surface">
					{unreadOnly ? "Bạn đã đọc hết rồi" : "Không có thông báo nào"}
				</p>
				<p className="text-body-sm text-on-surface-variant">
					{unreadOnly
						? "Tắt bộ lọc để xem lại các thông báo đã đọc."
						: "Thông báo về đơn hàng, tin nhắn và khuyến mãi sẽ xuất hiện ở đây."}
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{days.map((day) => (
				<div key={day.key} className="space-y-3">
					<div className="flex items-center gap-2 px-2 text-label-xs font-bold uppercase tracking-widest text-outline">
						<span className="w-2 h-2 rounded-full bg-outline-variant inline-block" />
						<span>{day.label}</span>
					</div>
					<div className="space-y-3">
						{day.items.map((notification) => (
							<NotificationCard
								key={notificationKey(notification)}
								notification={notification}
								isMarking={isMarking}
								onMarkRead={() => onMarkReadUpTo(notification.created_at)}
							/>
						))}
					</div>
				</div>
			))}

			{hasNextPage && (
				<div className="flex justify-center pt-4">
					<button
						type="button"
						onClick={onLoadMore}
						disabled={isFetchingNextPage}
						className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant text-label-sm font-bold hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
					>
						{isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
					</button>
				</div>
			)}
		</div>
	)
}
