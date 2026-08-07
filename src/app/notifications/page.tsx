"use client"

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
				/>

				<section className="md:col-span-8 lg:col-span-9 space-y-6">
					<div className="flex justify-between items-center gap-3 px-2 pb-2 border-b border-outline-variant/20">
						<span className="text-label-sm font-bold uppercase tracking-widest text-outline">
							{inbox.unreadOnly ? "Chưa đọc" : "Hoạt động gần đây"} ({inbox.notifications.length})
						</span>
						{inbox.unreadCount > 0 && (
							<button
								type="button"
								onClick={inbox.markAllRead}
								disabled={inbox.isMarking}
								className="text-label-sm text-primary font-bold hover:opacity-75 transition-opacity cursor-pointer flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full disabled:opacity-50"
							>
								<span className="material-symbols-outlined text-[16px]">done_all</span>
								<span>Đánh dấu đã đọc tất cả</span>
							</button>
						)}
					</div>

					<NotificationFeed
						days={inbox.days}
						isLoading={inbox.isLoading}
						unreadOnly={inbox.unreadOnly}
						hasNextPage={inbox.hasNextPage}
						isFetchingNextPage={inbox.isFetchingNextPage}
						onLoadMore={() => inbox.fetchNextPage()}
						onMarkReadUpTo={inbox.markReadUpTo}
						isMarking={inbox.isMarking}
					/>
				</section>
			</div>
		</div>
	)
}
