import type { IdentityDocument, IdentityDocumentType, IdentityStatus } from "@/api/generated/types.gen"
import type { VerdictDraft } from "../types"

/** The queue's filters. Opens on the only one that is work. */
export const QUEUE_FILTERS: ReadonlyArray<{ status: IdentityStatus | undefined; label: string }> = [
	{ status: "pending", label: "Chờ duyệt" },
	{ status: "verified", label: "Đã xác thực" },
	{ status: "rejected", label: "Bị từ chối" },
	{ status: undefined, label: "Tất cả" },
]

/** The rail down the left of a card: the state, before anything is read. */
export const STATUS_RAIL: Record<IdentityStatus, string> = {
	pending: "bg-tertiary",
	verified: "bg-primary",
	rejected: "bg-error",
}

export const STATUS_CHIP: Record<IdentityStatus, string> = {
	pending: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
	verified: "bg-secondary-container text-on-secondary-container",
	rejected: "bg-error-container text-on-error-container",
}

/**
 * Which document types carry an expiry, mirroring the server's own list.
 *
 * A national id is issued for life in some markets, so it is not on it. Getting this
 * wrong in either direction is visible: too narrow and the form lets somebody submit a
 * verdict the server refuses, too wide and it demands a date that does not exist.
 */
const EXPIRING: ReadonlyArray<IdentityDocumentType> = ["passport", "driver-license"]

export function needsExpiry(docType: IdentityDocumentType): boolean {
	return EXPIRING.includes(docType)
}

/**
 * Why this verdict cannot be sent, or null.
 *
 * Both rules are the domain's, not this form's: a refusal is what the account is shown
 * and what a second reviewer reads, so it needs a reason; and a document that runs out
 * needs its expiry recorded, because the payout gate reads the date as well as the status
 * — a status alone would let an expired passport pass for ever.
 */
export function verdictProblem(draft: VerdictDraft, docType: IdentityDocumentType): string | null {
	if (draft.status === "rejected" && draft.rejectionReason.trim() === "") {
		return "Nhập lý do từ chối — người dùng sẽ đọc đúng dòng này."
	}
	if (draft.status === "verified" && needsExpiry(docType) && draft.expiresAt === "") {
		return "Nhập ngày hết hạn của giấy tờ. Cổng chi tiền đọc ngày này chứ không chỉ đọc trạng thái."
	}
	if (draft.status === "verified" && draft.expiresAt !== "" && !isValidDate(draft.expiresAt)) {
		return "Ngày hết hạn không hợp lệ."
	}
	return null
}

function isValidDate(value: string): boolean {
	return !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
}

/**
 * The date input's `YYYY-MM-DD` as the instant the API takes, or undefined when it was
 * left empty — which is a legitimate answer for a document type that never expires.
 */
export function toExpiryInstant(value: string): string | undefined {
	if (value === "" || !isValidDate(value)) return undefined
	return new Date(`${value}T00:00:00`).toISOString()
}

/**
 * A verified document whose date has passed.
 *
 * Worth marking on the queue: the status still says verified and the account no longer
 * passes the payout gate, which is otherwise a support ticket nobody can explain.
 */
export function isExpired(document: IdentityDocument, now = Date.now()): boolean {
	if (document.status !== "verified" || document.expires_at === null) return false
	return new Date(document.expires_at).getTime() <= now
}
