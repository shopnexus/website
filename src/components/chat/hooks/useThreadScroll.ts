"use client"

import { useCallback, useEffect, useRef } from "react"

import type { ConversationId, Message } from "@/api/generated/types.gen"

/**
 * Where the thread is looking.
 *
 * Three cases, and they want opposite things. Opening a thread lands at the newest
 * message. A message arriving lands at it too. Loading *older* messages must not move the
 * eye at all — prepending a page pushes everything down, so the offset the page added is
 * subtracted back out. Scrolling to the bottom on every `messages` change made the
 * "older" button useless: it fetched fifty rows and threw the reader back to the end.
 */
export function useThreadScroll(
	messages: readonly Message[],
	conversationId: ConversationId | undefined,
) {
	const listRef = useRef<HTMLDivElement>(null)
	const lastNewestId = useRef<string | undefined>(undefined)
	const lastConversationId = useRef<ConversationId | undefined>(undefined)
	/** Set while an older page is being spliced in, so the newest-message effect stands down. */
	const heightBeforePrepend = useRef<number | null>(null)

	const newestId = messages[messages.length - 1]?.id

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

		// Deferred a frame: the row that changed the height is not laid out yet.
		const frame = requestAnimationFrame(() => {
			list.scrollTop = list.scrollHeight
		})
		return () => cancelAnimationFrame(frame)
	}, [conversationId, newestId, messages])

	/** Wrap the "load older" fetch so the reader keeps their place across it. */
	const preserveOnPrepend = useCallback((fetchOlder: () => void) => {
		heightBeforePrepend.current = listRef.current?.scrollHeight ?? null
		fetchOlder()
	}, [])

	return { listRef, preserveOnPrepend }
}
