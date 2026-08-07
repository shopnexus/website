import type {
	BankAccount,
	PaymentSessionStatus,
	Withdrawal,
	WithdrawalOutcome,
} from "@/api/generated/types.gen"
import type { AdjustmentDraft, ResolveDraft, ResolveMode, TaxVerdictDraft } from "../types"

/**
 * The queue's filters.
 *
 * Named after the session status because that is what the route filters on, but labelled
 * in withdrawal terms: a refused cash-out is a `failed` session and one the payee called
 * off is a `cancelled` one, and "thất bại" on a queue of decisions would read as a bug
 * rather than as somebody's answer. No filter at all is the whole history.
 */
export const QUEUE_FILTERS: ReadonlyArray<{
	status: PaymentSessionStatus | undefined
	label: string
}> = [
	{ status: "pending", label: "Chờ duyệt" },
	{ status: "processing", label: "Đang xử lý" },
	{ status: "success", label: "Đã chi" },
	{ status: "failed", label: "Đã từ chối" },
	{ status: "cancelled", label: "Người bán huỷ" },
	{ status: undefined, label: "Tất cả" },
]

/** The rail down the left of a row: the state, readable before anything is read. */
export const OUTCOME_RAIL: Record<WithdrawalOutcome, string> = {
	"awaiting-review": "bg-tertiary",
	approved: "bg-primary",
	rejected: "bg-error",
	cancelled: "bg-outline",
}

/** The same state as a chip, for where the rail is not beside a label. */
export const OUTCOME_CHIP: Record<WithdrawalOutcome, string> = {
	"awaiting-review": "bg-tertiary-fixed text-on-tertiary-fixed-variant",
	approved: "bg-secondary-container text-on-secondary-container",
	rejected: "bg-error-container text-on-error-container",
	cancelled: "bg-surface-container-high text-on-surface-variant",
}

/**
 * Whether this row is still a decision.
 *
 * Read from `outcome`, never from `status`: an approved withdrawal can still be
 * `processing` on the rail, and offering "duyệt" on that one would be offering to pay
 * somebody twice.
 */
export function isAwaitingReview(withdrawal: Withdrawal): boolean {
	return withdrawal.outcome === "awaiting-review"
}

/** Last digits plus the bank — how a person recognises an account. */
export function bankLabel(account: BankAccount): string {
	return `${account.bank_code.toUpperCase()} ···${account.account_number_masked}`
}

/**
 * Why this verdict cannot be sent, or null.
 *
 * The server refuses a reasonless rejection itself; saying so at the keystroke is what
 * stops an admin writing the reference, pressing the button and being handed a 400.
 */
export function resolveProblem(mode: ResolveMode, draft: ResolveDraft): string | null {
	if (mode === "reject" && draft.reason.trim() === "") {
		return "Nhập lý do từ chối — người bán sẽ đọc đúng dòng này."
	}
	if (mode === "approve" && draft.providerRef.trim() === "") {
		return "Nhập mã giao dịch của ngân hàng để còn tra soát được khoản đã chi."
	}
	return null
}

/**
 * Why this adjustment cannot be posted, or null.
 *
 * Both rules are the server's: a movement that moves nothing is refused at the database,
 * and the reason is the entire explanation an audit will ever have.
 */
export function adjustmentProblem(draft: AdjustmentDraft): string | null {
	if (draft.availableDelta === 0 && draft.heldDelta === 0) {
		return "Nhập số tiền cần điều chỉnh — ít nhất một trong hai số dư phải thay đổi."
	}
	if (draft.reason.trim() === "") return "Nhập lý do. Đây là toàn bộ giải trình cho bút toán này."
	return null
}

/** Why this tax verdict cannot be sent, or null. */
export function taxVerdictProblem(draft: TaxVerdictDraft): string | null {
	if (draft.source.trim() === "") {
		return "Nhập căn cứ xác minh — một kết luận không tra lại được là một kết luận không xem lại được."
	}
	return null
}

/**
 * A signed amount as typed.
 *
 * `parseAmount` in `lib/money` drops everything that is not a digit, which is right for a
 * withdrawal and wrong here: the sign is the whole instruction — a correction that takes
 * money back is the same field with a minus in front of it.
 */
export function parseSignedAmount(input: string): number {
	const cleaned = input.replace(/[^\d-]/g, "")
	const negative = cleaned.startsWith("-")
	const digits = cleaned.replace(/-/g, "")
	if (digits === "") return 0
	return negative ? -Number(digits) : Number(digits)
}

/**
 * A fresh idempotency key for one adjustment.
 *
 * Generated once when the form opens and reused by every retry of that same correction:
 * the key is the only thing standing between a flaky connection and a balance credited
 * twice. `randomUUID` is unavailable outside a secure context, which a staff laptop
 * reaching a dev box over its LAN address is — so there is a fallback rather than a
 * crash, and it only has to be unique among this desk's own retries.
 */
export function newIdempotencyKey(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID()
	}
	return `adj-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
