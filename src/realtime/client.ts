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

/**
 * How long a connection must last before its backoff resets. Longer than the longest
 * backoff step, so a server that drops sockets immediately cannot be retried in a hot loop.
 */
const STABLE_AFTER_MS = 60_000

/**
 * How long without a message before an `OPEN` socket is treated as possibly dead on the
 * next revive. Twice the server's 30s ping interval, so a healthy but quiet socket is not
 * torn down on a tab switch.
 */
const stallAfterMs = 60_000

/**
 * Jittered backoff with a floor. Full jitter alone can draw a near-zero delay several
 * times in a row; the floor bounds the worst case while still breaking up lockstep retries
 * across tabs.
 */
function delayFor(attempt: number): number {
	const base = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]
	return base / 4 + Math.random() * base * 0.75
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
/**
 * Where the socket lives.
 *
 * `NEXT_PUBLIC_WS_URL` wins when set, because a real deployment often serves the socket
 * from a different host than the page. When it is absent we derive it from the current
 * origin rather than throwing: `NEXT_PUBLIC_*` is inlined at build time, so a missing
 * value is a build-configuration mistake that would otherwise surface as a blank page for
 * every signed-in user. Losing realtime has to degrade to polling-free staleness, never to
 * taking down the app shell.
 */
function resolveURL(): string | undefined {
	const configured = process.env.NEXT_PUBLIC_WS_URL
	if (configured) return configured
	if (typeof window === "undefined") return undefined
	const scheme = window.location.protocol === "https:" ? "wss:" : "ws:"
	return `${scheme}//${window.location.host}/api/v1/ws`
}

export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
	const url = resolveURL()

	let socket: WebSocket | null = null
	let status: RealtimeStatus = "idle"
	let attempt = 0
	let retryTimer: ReturnType<typeof setTimeout> | undefined
	let stableTimer: ReturnType<typeof setTimeout> | undefined
	let stopped = false
	/**
	 * When we last had proof the socket was alive.
	 *
	 * Only opens and messages count: the browser answers the server's pings itself and
	 * exposes no event for them, so JS cannot observe a pong. A quiet account therefore
	 * looks stale after a while, and `revive` reconnecting it is the right outcome anyway —
	 * that is exactly when a fresh invalidate is wanted.
	 */
	let lastSeen = 0
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
		if (!url) {
			// No origin to derive from and nothing configured: on the server there is no
			// socket to open, and retrying would spin. Report it and stay idle.
			setStatus("closed")
			return
		}
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
			lastSeen = Date.now()
			setStatus("open")
			// Backoff is reset only once the connection has *lasted*, not the instant it
			// opens. A server that closes just after the upgrade — a bad deploy, a short
			// ingress idle timeout, a suspended account — would otherwise reconnect at
			// index 0 for ever: a ticket mint, an upgrade and a full invalidate of every
			// fed query several times a second, from every open tab.
			clearTimeout(stableTimer)
			stableTimer = setTimeout(() => {
				attempt = 0
			}, STABLE_AFTER_MS)
			options.onOpen?.()
		}

		ws.onmessage = (message) => {
			lastSeen = Date.now()
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
			clearTimeout(stableTimer)
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

	/**
	 * Force a reconnect after the network or the tab came back.
	 *
	 * The hard case is a socket that is still `OPEN` but dead: a slept laptop or a tunnel
	 * black-holes TCP with no FIN, so the browser reports `OPEN` until the OS gives up —
	 * minutes. `onclose` therefore never fires, so `onOpen` never fires, so nothing
	 * re-invalidates. With the polls gone that leaves every badge frozen with no error
	 * shown, which is worse than the churn of an occasional redundant reconnect.
	 *
	 * So: bail only when a socket is provably alive. Anything else gets torn down, and
	 * `onclose` drives the reconnect.
	 */
	function revive(): void {
		if (stopped) return

		if (socket) {
			if (socket.readyState === WebSocket.OPEN && Date.now() - lastSeen < stallAfterMs) {
				return // heard from it recently enough to trust it
			}
			// CONNECTING with no handshake timeout, or OPEN but silent past the server's
			// ping interval. Close it and let onclose reconnect.
			attempt = 0
			socket.close()
			return
		}

		attempt = 0
		clearTimeout(retryTimer)
		void open()
	}

	// Tab visibility as well as `online`: a slept laptop often reports no network
	// transition at all, so returning to the tab is the other moment worth re-checking.
	function onVisible(): void {
		if (document.visibilityState === "visible") revive()
	}

	return {
		connect: () => {
			if (stopped) return
			window.addEventListener("online", revive)
			document.addEventListener("visibilitychange", onVisible)
			void open()
		},
		close: () => {
			stopped = true
			clearTimeout(retryTimer)
			clearTimeout(stableTimer)
			window.removeEventListener("online", revive)
			document.removeEventListener("visibilitychange", onVisible)
			socket?.close()
			socket = null
			setStatus("closed")
		},
		status: () => status,
	}
}
