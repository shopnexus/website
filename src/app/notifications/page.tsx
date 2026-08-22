"use client"

import Button from "@/components/ui/Button"

import NotificationFeed from "./_components/NotificationFeed"
import NotificationSidebar from "./_components/NotificationSidebar"
import { useNotificationInbox } from "./_hooks/useNotificationInbox"

export default function NotificationsPage() {
	const inbox = useNotificationInbox()

	return (
		<div className="min-h-[calc(100vh-80px)] py-8 px-4 md:px-6 max-w-[1440px] mx-auto w-full">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
				<NotificationSidebar
					category={inbox.category}
					onCategoryChange={inbox.setCategory}
					unreadOnly={inbox.unreadOnly}
					onUnreadOnlyChange={inbox.setUnreadOnly}
					unreadCount={inbox.unreadCount}
					unreadByCategory={inbox.unreadByCategory}
				/>

				<section className="md:col-span-8 lg:col-span-9 space-y-6">
					<div className="flex justify-between items-center gap-3 px-2 pb-2 border-b border-outline-variant">
						<span className="text-label-sm uppercase tracking-widest text-outline">
							{inbox.unreadOnly ? "Chưa đọc" : "Hoạt động gần đây"} ({inbox.notifications.length})
						</span>
						{inbox.unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={inbox.markAllRead}
								disabled={inbox.isMarking}
								icon={
									<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
										done_all
									</span>
								}
							>
								Đánh dấu đã đọc tất cả
							</Button>
						)}
					</div>

					<NotificationFeed
						days={inbox.days}
						isLoading={inbox.isLoading}
						unreadOnly={inbox.unreadOnly}
						hasNextPage={inbox.hasNextPage}
						isFetchingNextPage={inbox.isFetchingNextPage}
						onLoadMore={() => inbox.fetchNextPage()}
						onMarkRowRead={inbox.markRowRead}
						isMarking={inbox.isMarking}
					/>
				</section>
			</div>
		</div>
	)
}
