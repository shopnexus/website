import type {
	PaymentSession,
	PaymentSessionKind,
	PaymentSessionStatus,
} from "@/api/generated/types.gen"
import type { SessionTotals } from "../types"

/** What the money was for. A client never picks this — the module that owes it does. */
export const KIND_FILTERS: ReadonlyArray<{ kind: PaymentSessionKind | undefined; label: string }> =
	[
		{ kind: undefined, label: "Tất cả" },
		{ kind: "buyer-checkout", label: "Người mua thanh toán" },
		{ kind: "seller-payout", label: "Chi cho người bán" },
		{ kind: "withdrawal", label: "Rút tiền" },
	]

export const STATUS_FILTERS: ReadonlyArray<{
	status: PaymentSessionStatus | undefined
	label: string
}> = [
	{ status: undefined, label: "Tất cả" },
	{ status: "pending", label: "Chờ thanh toán" },
	{ status: "processing", label: "Đang xử lý" },
	{ status: "success", label: "Thành công" },
	{ status: "failed", label: "Thất bại" },
	{ status: "cancelled", label: "Đã huỷ" },
]

/** How many rows one read brings back. The route has no second page — see the hook. */
export const LIMIT_CHOICES: ReadonlyArray<number> = [25, 50, 100]

export const STATUS_RAIL: Record<PaymentSessionStatus, string> = {
	pending: "bg-tertiary",
	processing: "bg-tertiary",
	success: "bg-primary",
	cancelled: "bg-outline",
	failed: "bg-error",
}

export const STATUS_CHIP: Record<PaymentSessionStatus, string> = {
	pending: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
	processing: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
	success: "bg-secondary-container text-on-secondary-container",
	cancelled: "bg-surface-container-high text-on-surface-variant",
	failed: "bg-error-container text-on-error-container",
}

/**
 * A session past its own deadline that nothing has voided yet.
 *
 * The platform expires these on a job, so seeing one here is either the job running late
 * or the job not running — which is exactly the kind of thing this screen exists to catch.
 */
export function isOverdue(session: PaymentSession, now = Date.now()): boolean {
	if (session.status !== "pending" && session.status !== "processing") return false
	return new Date(session.expired_at).getTime() <= now
}

/**
 * What the rows on screen come to, grouped by currency.
 *
 * Over the rows returned and not over the whole collection: this route answers one page,
 * so a total across everything would be a number nobody could reproduce. The screen says
 * which it is.
 */
export function summarise(sessions: ReadonlyArray<PaymentSession>): SessionTotals[] {
	const byCurrency = new Map<string, SessionTotals>()

	for (const session of sessions) {
		const row = byCurrency.get(session.currency) ?? {
			currency: session.currency,
			count: 0,
			total: 0,
			outstanding: 0,
			settled: 0,
		}
		row.count += 1
		row.total += session.total_amount
		row.outstanding += session.outstanding
		row.settled = row.total - row.outstanding
		byCurrency.set(session.currency, row)
	}

	return [...byCurrency.values()]
}
