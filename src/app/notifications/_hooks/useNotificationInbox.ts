"use client"

import { useMemo, useState } from "react"
import { toast } from "react-hot-toast"

import { useMarkNotificationsRead, useNotificationsFeed, useUnreadCount } from "@/hooks/api/useNotifications"

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

	const { data: unreadCount = 0 } = useUnreadCount()
	const markRead = useMarkNotificationsRead()

	const days = useMemo(() => groupNotifications(feed.notifications), [feed.notifications])

	/** The whole feed: the server reads an omitted `before` as "everything". */
	const markAllRead = () => {
		markRead.mutate(undefined, { onSuccess: () => toast.success("Đã đánh dấu đọc tất cả") })
	}

	/**
	 * Read up to and including one row. The feed is newest-first, so this clears that
	 * notification and everything older while anything newer stays unread — which is what
	 * a bound expressed as an instant means, and why the copy says so.
	 */
	const markReadUpTo = (createdAt: string) => {
		markRead.mutate(createdAt)
	}

	return {
		...feed,
		days,
		category,
		setCategory,
		unreadOnly,
		setUnreadOnly,
		unreadCount,
		isMarking: markRead.isPending,
		markAllRead,
		markReadUpTo,
	}
}
