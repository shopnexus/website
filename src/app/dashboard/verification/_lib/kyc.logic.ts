import type { IdentityDocument, IdentityDocumentType } from "@/api/generated/types.gen"

/**
 * Which scans a document type needs.
 *
 * A passport's data page is the whole document — there is nothing on the reverse — so
 * asking for a back scan of one would leave the seller looking for a page that does not
 * exist. Every type needs a selfie: without it the document is verified but nothing ties
 * it to the person holding the account.
 */
export function needsBackScan(docType: IdentityDocumentType): boolean {
	return docType !== "passport"
}

/**
 * Whether a new submission is worth offering.
 *
 * A document already awaiting a verdict is not resubmitted — the vendor or the moderator
 * is holding it — and a verified one is done. A rejection is the case where submitting
 * again is exactly the remedy.
 */
export function canSubmitAnother(history: ReadonlyArray<IdentityDocument>): boolean {
	return !history.some((doc) => doc.status === "pending" || doc.status === "verified")
}

/** The document that decides the account's state, which is the most recent one. */
export function latestDocument(
	history: ReadonlyArray<IdentityDocument>,
): IdentityDocument | undefined {
	return [...history].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	)[0]
}
