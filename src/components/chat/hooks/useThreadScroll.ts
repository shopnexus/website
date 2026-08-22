"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { ConversationId, Message } from "@/api/generated/types.gen"

/** How close to the end still counts as reading the end. One short bubble's worth. */
const PINNED_SLACK_PX = 80

/**
 * Where the thread is looking.
 *
 * Four cases, and they want opposite things. Opening a thread lands at the newest message.
 * Loading *older* messages must not move the eye at all — prepending a page pushes
 * everything down, so the offset the page added is subtracted back out. A message arriving
 * lands at it **only while the reader is at the end**: scrolling to the bottom on every
 * arrival yanked anyone reading back history down to the newest bubble, which is the one
 * thing a reader looking at the past has not asked for. And when they are not at the end,
 * the arrival is counted instead, so the thread can offer the jump rather than take it.
 *
 * "Lands at the newest" also has to survive the layout settling. Scrolling once after the
 * rows render is not enough: an offer card renders a short skeleton and then fetches its own
 * terms, a photo reserves its box only once it has decoded, and either one growing after the
 * fact leaves the view a screen above the bottom it was just taken to. So the end is *held*
 * while the reader is at it — a `ResizeObserver` on the content, not a second guess at how
 * long the slowest child takes.
 */
export function useThreadScroll(
	messages: readonly Message[],
	conversationId: ConversationId | undefined,
) {
	const listRef = useRef<HTMLDivElement>(null)
	/** The scrolling box's contents, whose height is what grows late. */
	const contentRef = useRef<HTMLDivElement>(null)
	const lastNewestId = useRef<string | undefined>(undefined)
	const lastConversationId = useRef<ConversationId | undefined>(undefined)
	/** Set while an older page is being spliced in, so the newest-message effect stands down. */
	const heightBeforePrepend = useRef<number | null>(null)

	/** Whether the reader is at the end. True to begin with: opening lands there. */
	const [isPinned, setPinned] = useState(true)
	// Mirrored, because the resize observer below must read the current value without being
	// torn down and rebuilt every time it changes.
	const pinnedRef = useRef(true)
	/** The newest message the reader has actually been shown the bottom of. */
	const [newestSeenId, setNewestSeenId] = useState<string | undefined>(undefined)

	const newestId = messages[messages.length - 1]?.id

	const scrollToEnd = useCallback((smooth = false) => {
		const list = listRef.current
		if (!list) return
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
		list.scrollTo({ top: list.scrollHeight, behavior: smooth && !reduced ? "smooth" : "auto" })
	}, [])

	/** Reading the end is what marks everything up to it seen. */
	const onScroll = useCallback(() => {
		const list = listRef.current
		if (!list) return
		const pinned = list.scrollHeight - list.scrollTop - list.clientHeight <= PINNED_SLACK_PX
		pinnedRef.current = pinned
		setPinned(pinned)
		if (pinned) setNewestSeenId(messages[messages.length - 1]?.id)
	}, [messages])

	useEffect(() => {
		const list = listRef.current
		if (!list) return

		if (heightBeforePrepend.current !== null) {
			const previousHeight = heightBeforePrepend.current
			heightBeforePrepend.current = null
			list.scrollTop += list.scrollHeight - previousHeight
			lastNewestId.current = newestId
			return
		}

		const threadChanged = lastConversationId.current !== conversationId
		const arrived = lastNewestId.current !== newestId
		lastConversationId.current = conversationId
		lastNewestId.current = newestId
		if (!threadChanged && !arrived) return

		// A thread just opened is always taken to the end; an arrival only while the reader
		// is already there.
		if (!threadChanged && !isPinned) return

		// Deferred a frame: the row that changed the height is not laid out yet.
		const frame = requestAnimationFrame(() => {
			scrollToEnd()
			pinnedRef.current = true
			setPinned(true)
			setNewestSeenId(newestId)
		})
		return () => cancelAnimationFrame(frame)
	}, [conversationId, newestId, messages, isPinned, scrollToEnd])

	/**
	 * Holding the end against a late layout change: an offer card that has just fetched its
	 * terms, a photo that has decoded, a font that has swapped. Only while the reader is at
	 * the end — prepending older history also grows the content, and that case has already
	 * restored the scroll offset by hand.
	 */
	useEffect(() => {
		const content = contentRef.current
		if (!content || typeof ResizeObserver === "undefined") return

		const observer = new ResizeObserver(() => {
			if (pinnedRef.current) scrollToEnd()
		})
		observer.observe(content)
		return () => observer.disconnect()
	}, [scrollToEnd])

	/**
	 * How many have arrived below the fold. Counted from the last message the reader saw
	 * rather than by adding one per render: a burst arrives as a single change, and an older
	 * page prepended at the top would inflate any count based on length.
	 */
	const unseenCount = useMemo(() => {
		if (!newestSeenId) return 0
		const at = messages.findIndex((message) => message.id === newestSeenId)
		return at === -1 ? 0 : messages.length - 1 - at
	}, [messages, newestSeenId])

	const jumpToEnd = useCallback(() => {
		scrollToEnd(true)
		pinnedRef.current = true
		setPinned(true)
		setNewestSeenId(messages[messages.length - 1]?.id)
	}, [messages, scrollToEnd])

	/** Wrap the "load older" fetch so the reader keeps their place across it. */
	const preserveOnPrepend = useCallback((fetchOlder: () => void) => {
		heightBeforePrepend.current = listRef.current?.scrollHeight ?? null
		fetchOlder()
	}, [])

	return { listRef, contentRef, onScroll, preserveOnPrepend, isPinned, unseenCount, jumpToEnd }
}
