"use client"

import type { Notification } from "@/api/generated/types.gen"
import NotificationRow from "@/components/notifications/NotificationRow"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import type { DayGroup } from "@/lib/day"

export default function NotificationFeed({
	days,
	isLoading,
	unreadOnly,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onMarkRowRead,
	isMarking,
}: {
	days: ReadonlyArray<DayGroup<Notification>>
	isLoading: boolean
	unreadOnly: boolean
	hasNextPage: boolean
	isFetchingNextPage: boolean
	onLoadMore: () => void
	onMarkRowRead: (id: string) => void
	isMarking: boolean
}) {
	// Skeleton rows rather than a spinner: the feed's shape is known before its contents are,
	// so the page does not jump once they land.
	if (isLoading) {
		return (
			<div className="space-y-3">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="flex gap-3 p-5 rounded-2xl border border-outline-variant">
						<Skeleton shape="circle" className="w-12 h-12 shrink-0" />
						<div className="flex-grow space-y-2">
							<Skeleton className="h-4 w-2/5" />
							<Skeleton className="h-3 w-4/5" />
							<Skeleton className="h-3 w-1/4" />
						</div>
					</div>
				))}
			</div>
		)
	}

	if (days.length === 0) {
		return unreadOnly ? (
			<EmptyState
				icon="mark_email_read"
				title="Bạn đã đọc hết rồi"
				description="Tắt bộ lọc để xem lại các thông báo đã đọc."
			/>
		) : (
			<EmptyState
				icon="notifications_off"
				title="Không có thông báo nào"
				description="Thông báo về đơn hàng, tin nhắn và khuyến mãi sẽ xuất hiện ở đây."
				action={{ label: "Khám phá sản phẩm", href: "/search" }}
			/>
		)
	}

	return (
		<div className="space-y-8">
			{days.map((day) => (
				<div key={day.key} className="space-y-3">
					<div className="flex items-center gap-2 px-2 text-label-xs uppercase tracking-widest text-outline">
						<span className="w-2 h-2 rounded-full bg-outline-variant inline-block" />
						<span>{day.label}</span>
					</div>
					<div className="space-y-3">
						{day.items.map((notification) => (
							// The row's own id. It used to be `created_at`, which is also what the
							// read bound was expressed against — two jobs for one value, and two
							// rows landing in the same instant collided as one key.
							<NotificationRow
								key={notification.id}
								notification={notification}
								isMarking={isMarking}
								onMarkRead={() => onMarkRowRead(notification.id)}
							/>
						))}
					</div>
				</div>
			))}

			{hasNextPage && (
				<div className="flex justify-center pt-4">
					<Button variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
						{isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
					</Button>
				</div>
			)}
		</div>
	)
}
