/** What the verdict dialog holds before it is sent. */
export interface VerdictDraft {
	status: "verified" | "rejected"
	/**
	 * `YYYY-MM-DD` as a date input gives it. Converted to an instant only on the way out,
	 * because the wire format is a date-time and a half-typed date is not one.
	 */
	expiresAt: string
	rejectionReason: string
}
