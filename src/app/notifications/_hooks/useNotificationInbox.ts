"use client"

import { useMemo, useState } from "react"
import { toast } from "react-hot-toast"

import {
	useMarkNotificationsRead,
	useNotificationsFeed,
	useUnreadCount,
} from "@/hooks/api/useNotifications"

import { groupNotifications } from "../_lib/notifications.logic"
import type { CategoryFilter } from "../_types"

/**
 * The notification screen's state: what is being shown and what marking it read means.
 *
 * `unreadOnly` is the server's `unread` filter rather than a client-side one — the feed is
 * a cursor stream, so filtering after the fetch would show three rows on a page of fifty
 * and call it the end of the list.
 */
export function useNotificationInbox() {
	const [category, setCategory] = useState<CategoryFilter>("all")
	const [unreadOnly, setUnreadOnly] = useState(false)

	const feed = useNotificationsFeed({
		category: category === "all" ? undefined : category,
		unread: unreadOnly ? true : undefined,
		limit: 50,
	})

	const { unread, byCategory } = useUnreadCount()
	const markRead = useMarkNotificationsRead()

	const days = useMemo(() => groupNotifications(feed.notifications), [feed.notifications])

	/** The whole feed: the server reads an empty body as "everything". */
	const markAllRead = () => {
		markRead.mutate(undefined, { onSuccess: () => toast.success("Đã đánh dấu đọc tất cả") })
	}

	/**
	 * Read one notification, and only it. It used to be a time bound — "this row and everything
	 * older" — which meant opening the newest thing in the feed silently cleared the rest.
	 */
	const markRowRead = (id: string) => {
		markRead.mutate({ ids: [id] })
	}

	return {
		...feed,
		days,
		category,
		setCategory,
		unreadOnly,
		setUnreadOnly,
		unreadCount: unread,
		unreadByCategory: byCategory,
		isMarking: markRead.isPending,
		markAllRead,
		markRowRead,
	}
}
