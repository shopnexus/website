import { createWebSocketTicket } from "@/api/generated/sdk.gen"
import { REALTIME_CODES, type RealtimeEvent } from "@/api/generated/ws-events"

/**
 * The realtime socket.
 *
 * Receive-only: the client changes state over REST and learns about other people's
 * changes here. Nothing is ever sent, so there is no send queue and no state machine.
 *
 * Delivery is at-most-once and the server replays nothing, so a reconnect must assume
 * events were missed — which is why `onOpen` fires on every connect, not just the first.
 * The caller uses it to invalidate what the socket feeds.
 */

export type RealtimeStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed"

export interface RealtimeClientOptions {
	/** Called for every event. Runs on the socket's message handler — keep it cheap. */
	onEvent: (event: RealtimeEvent) => void
	/**
	 * Called after every successful connect, including reconnects. This is where the gap
	 * left by a disconnect gets repaired.
	 */
	onOpen?: () => void
	onStatusChange?: (status: RealtimeStatus) => void
}

export interface RealtimeClient {
	/** Idempotent: calling it while already connected does nothing. */
	connect: () => void
	/** Stops reconnecting and closes. The client cannot be reused afterwards. */
	close: () => void
	status: () => RealtimeStatus
}

/** Backoff schedule in ms, capped — a flapping server must not be hammered. */
const BACKOFF_MS = [500, 1_000, 2_000, 5_000, 10_000, 30_000] as const

/** Full jitter: without it every tab in every browser retries in lockstep. */
function delayFor(attempt: number): number {
	const base = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]
	return Math.random() * base
}

function isRealtimeEvent(value: unknown): value is RealtimeEvent {
	if (typeof value !== "object" || value === null) return false
	const candidate = value as { code?: unknown }
	return (
		typeof candidate.code === "string" &&
		(REALTIME_CODES as readonly string[]).includes(candidate.code)
	)
}

/**
 * Builds the realtime client. Framework-agnostic — no React, no cache wiring — so the
 * provider that wraps it (and decides what a reconnect invalidates) can live elsewhere.
 */
export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
	const url = process.env.NEXT_PUBLIC_WS_URL
	if (!url) {
		throw new Error("NEXT_PUBLIC_WS_URL is not set")
	}

	let socket: WebSocket | null = null
	let status: RealtimeStatus = "idle"
	let attempt = 0
	let retryTimer: ReturnType<typeof setTimeout> | undefined
	let stopped = false
	// Guards against two connect() calls racing a ticket request. A ticket is
	// single-use, so a duplicate connect would burn one and open a second socket.
	let connecting = false

	function setStatus(next: RealtimeStatus): void {
		if (status === next) return
		status = next
		options.onStatusChange?.(next)
	}

	function scheduleRetry(): void {
		if (stopped) return
		setStatus("reconnecting")
		clearTimeout(retryTimer)
		retryTimer = setTimeout(() => void open(), delayFor(attempt))
		attempt += 1
	}

	async function open(): Promise<void> {
		if (stopped || connecting || socket) return
		connecting = true
		setStatus(status === "idle" ? "connecting" : status)

		let ticket: string
		try {
			// Every reconnect needs a fresh ticket: they are single-use by design, so the
			// one that opened the previous socket is already spent.
			const { data } = await createWebSocketTicket({ throwOnError: true })
			ticket = data.data.ticket
		} catch {
			connecting = false
			// A failure here is usually an expired session, and the API layer's 401 refresh
			// has already had its chance. Retrying is still right: the token may refresh on
			// the next attempt, and giving up would need a manual reload to recover.
			scheduleRetry()
			return
		}

		if (stopped) {
			connecting = false
			return
		}

		const ws = new WebSocket(`${url}?ticket=${encodeURIComponent(ticket)}`)
		socket = ws
		connecting = false

		ws.onopen = () => {
			attempt = 0
			setStatus("open")
			options.onOpen?.()
		}

		ws.onmessage = (message) => {
			if (typeof message.data !== "string") return
			let parsed: unknown
			try {
				parsed = JSON.parse(message.data)
			} catch {
				return
			}
			// An unknown code is a server ahead of this bundle, not an error: ignoring it
			// is how a deploy rolls out without breaking open tabs.
			if (isRealtimeEvent(parsed)) {
				options.onEvent(parsed)
			}
		}

		ws.onclose = () => {
			socket = null
			if (stopped) {
				setStatus("closed")
				return
			}
			scheduleRetry()
		}

		// onerror is always followed by onclose, so reconnection is handled there and this
		// only exists to stop the browser logging an unhandled error event.
		ws.onerror = () => {}
	}

	function onOnline(): void {
		// Reconnect immediately rather than waiting out a backoff that may have minutes
		// left on it — coming back online is exactly the moment to retry.
		if (stopped || socket) return
		attempt = 0
		clearTimeout(retryTimer)
		void open()
	}

	return {
		connect: () => {
			if (stopped) return
			window.addEventListener("online", onOnline)
			void open()
		},
		close: () => {
			stopped = true
			clearTimeout(retryTimer)
			window.removeEventListener("online", onOnline)
			socket?.close()
			socket = null
			setStatus("closed")
		},
		status: () => status,
	}
}
