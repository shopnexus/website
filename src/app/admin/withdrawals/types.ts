import type { CurrencyCode } from "@/api/generated/types.gen"

/** Which half of the decision the dialog is showing. */
export type ResolveMode = "approve" | "reject"

/**
 * What the resolve dialog holds before it is sent. One shape for both verdicts: the
 * bank reference only travels with an approval and the reason is only mandatory on a
 * rejection, but keeping them in one draft means switching verdict does not lose what was
 * already typed.
 */
export interface ResolveDraft {
	/** The bank's or gateway's reference for the outbound transfer. Approval only. */
	providerRef: string
	/** Mandatory on a rejection — the payee is owed the why — and a note on an approval. */
	reason: string
}

/** A hand-written balance movement, before it becomes a ledger row. */
export interface AdjustmentDraft {
	currency: CurrencyCode
	/** Signed, in the smallest unit of `currency`. At least one of the two must move. */
	availableDelta: number
	heldDelta: number
	reason: string
}

/** A verdict on somebody's tax registration. */
export interface TaxVerdictDraft {
	status: "verified" | "rejected"
	/** What the verdict was based on — the registry that answered, the document read. */
	source: string
	note: string
}
