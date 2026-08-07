/** The four things a seller does with their money, as the page's sections. */
export type WalletTab = "balance" | "withdrawals" | "banks" | "tax"

/** What a withdrawal form is holding before it is sent. */
export interface WithdrawDraft {
	/** Whole units, as typed. Validated against the available balance before sending. */
	amount: number
	bankAccountId: string
}
