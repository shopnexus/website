import type {
	BankAccount,
	WalletTransaction,
	WalletTransactionKind,
	Withdrawal,
	WithdrawalOutcome,
} from "@/api/generated/types.gen"
import type { WithdrawDraft } from "../types"

/**
 * Whether a movement added to the balance or took from it.
 *
 * A row moves two balances at once — a payout credits `available`, an escrow hold moves
 * money from nowhere into `held` — so "was this good news" is the sum of both deltas
 * rather than the sign of either. An escrow hold that pairs a +held with a −available is
 * neither, and reads as neutral.
 */
export function movementDirection(tx: WalletTransaction): "in" | "out" | "flat" {
	const net = tx.available_delta + tx.held_delta
	if (net > 0) return "in"
	if (net < 0) return "out"
	return "flat"
}

/** The icon for each kind of movement. */
export const KIND_ICONS: Record<WalletTransactionKind, string> = {
	topup: "add_card",
	"escrow-hold": "lock",
	"escrow-release": "lock_open",
	payout: "storefront",
	refund: "undo",
	withdrawal: "account_balance",
	fee: "percent",
	adjustment: "tune",
}

/**
 * The reason written on a movement, or null when there is none worth reading.
 *
 * Only an adjustment has one. Every other kind is explained by its own name and by what it
 * references, so the finance module writes the note there as an internal audit label — and
 * writes it in English: a Vietnamese seller's ledger was printing "escrow hold" under a row
 * already titled "Tạm giữ cho đơn hàng". An adjustment is the exception by design, because
 * it points at no order and no session: its note is the only thing that can ever explain it,
 * so a person writes that one.
 */
export function movementReason(tx: WalletTransaction): string | null {
	if (tx.kind !== "adjustment") return null
	const reason = tx.note.trim()
	return reason === "" ? null : reason
}

/**
 * The order a movement was for, when it was for one.
 *
 * `payment-session` is the other `ref_type` and has no screen a seller can open, so it is
 * left unlinked rather than pointed at a route that does not exist.
 */
export function movementOrderId(tx: WalletTransaction): string | null {
	return tx.ref_type === "order" && tx.ref_id !== "" ? tx.ref_id : null
}

/** Chip styling per outcome, so the four states are told apart without reading them. */
export const OUTCOME_STYLES: Record<WithdrawalOutcome, string> = {
	"awaiting-review": "bg-status-warn text-on-status-warn",
	approved: "bg-status-ok text-on-status-ok",
	rejected: "bg-status-danger text-on-status-danger",
	cancelled: "bg-status-neutral text-on-status-neutral",
}

/**
 * A withdrawal can only be called off before an admin has decided it.
 *
 * Read from `outcome` rather than `status`: the two are separate on purpose — an approved
 * withdrawal can still be `processing` on the rail — and cancelling one that was already
 * approved is money already on its way out.
 */
export function isCancellable(withdrawal: Withdrawal): boolean {
	return withdrawal.outcome === "awaiting-review"
}

/**
 * Why this withdrawal cannot be sent, or null when it can.
 *
 * Checked here as well as by the server: the server owns the verdict, but a seller typing
 * more than they hold should be told at the keystroke rather than by a 422 after they
 * press the button.
 */
export function withdrawalProblem(
	draft: WithdrawDraft,
	available: number,
	banks: ReadonlyArray<BankAccount>,
): string | null {
	if (banks.length === 0) return "Bạn cần thêm tài khoản ngân hàng trước khi rút tiền."
	if (!draft.bankAccountId) return "Chọn tài khoản nhận tiền."
	if (draft.amount <= 0) return "Nhập số tiền muốn rút."
	if (draft.amount > available) return "Số tiền vượt quá số dư khả dụng."
	return null
}

/** Last digits plus the bank, which is how a person recognises their own account. */
export function bankLabel(account: BankAccount): string {
	return `${account.bank_code.toUpperCase()} ···${account.account_number_masked}`
}
