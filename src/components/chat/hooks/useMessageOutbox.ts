"use client"

import { useCallback, useRef, useState } from "react"

import type { MessageReplyRef, SendMessageRequest } from "@/api/generated/types.gen"

import type { PendingAttachment } from "../types"

export interface OutboxEntry {
	/** Local, because the message has no server id until it lands. */
	key: string
	body: string
	attachments: readonly PendingAttachment[]
	status: "sending" | "failed"
	/** When it was written, so the bubble carries the same clock as a sent one. */
	createdAt: string
	/** What it answers, held here so a retry sends the same reply rather than a bare message. */
	replyTo?: MessageReplyRef
}

/**
 * Messages written but not yet acknowledged by the server.
 *
 * A send used to clear the box and then hope: `onSend(body)` was followed immediately by
 * `setText("")`, so a request that failed took the typed words with it and left only a
 * toast. Holding them here instead means a failure is a bubble the sender can retry or
 * discard, and the words are never somewhere they cannot be recovered from.
 *
 * It is deliberately *not* an optimistic write into the message cache. A rollback on error
 * would delete exactly the thing the sender needs back, and a temporary row in a cursor
 * stream has no honest position in it. The outbox is its own short list, rendered after the
 * loaded page — which is where a message being sent actually belongs.
 *
 * An entry is dropped only once `mutateAsync` resolves, and that is after the mutation's
 * own invalidation has refetched the thread: removing it any earlier makes the bubble blink
 * out and back in as the real one arrives.
 */
export function useMessageOutbox(send: (body: SendMessageRequest) => Promise<unknown>) {
	const [entries, setEntries] = useState<OutboxEntry[]>([])
	const nextKey = useRef(0)

	const dispatch = useCallback(
		async (entry: OutboxEntry) => {
			setEntries((current) =>
				current.some((item) => item.key === entry.key)
					? current.map((item) => (item.key === entry.key ? { ...item, status: "sending" } : item))
					: [...current, entry],
			)

			try {
				await send({
					body: entry.body || undefined,
					attachments:
						entry.attachments.length > 0
							? entry.attachments.map((item) => item.id)
							: undefined,
					reply_to: entry.replyTo,
				})
				setEntries((current) => current.filter((item) => item.key !== entry.key))
			} catch {
				// The global handler raises the toast; the bubble is what offers the retry.
				setEntries((current) =>
					current.map((item) => (item.key === entry.key ? { ...item, status: "failed" } : item)),
				)
			}
		},
		[send],
	)

	const enqueue = useCallback(
		(body: string, attachments: readonly PendingAttachment[], replyTo?: MessageReplyRef) => {
			if (!body && attachments.length === 0) return
			nextKey.current += 1
			void dispatch({
				key: `outbox-${nextKey.current}`,
				body,
				attachments,
				status: "sending",
				createdAt: new Date().toISOString(),
				replyTo,
			})
		},
		[dispatch],
	)

	/**
	 * Takes the entry rather than its key: reading it out of state would mean a side effect
	 * inside a state updater, which React is free to run twice — and twice here is the
	 * message sent twice.
	 */
	const retry = useCallback(
		(entry: OutboxEntry) => {
			void dispatch(entry)
		},
		[dispatch],
	)

	const discard = useCallback((key: string) => {
		setEntries((current) => current.filter((item) => item.key !== key))
	}, [])

	return { entries, enqueue, retry, discard }
}
