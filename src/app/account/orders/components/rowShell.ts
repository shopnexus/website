/**
 * One shell for every row and card on Đơn mua, Đơn bán and Hoàn tiền.
 *
 * The three screens had three shells — two border colours, two radii and two surfaces —
 * so the same order row read as a different product depending on which sidebar item you
 * pressed. Shared from here so a change lands on all three at once.
 */
export const CARD_SHELL = "rounded-2xl border border-outline-variant bg-surface-container-lowest"

/**
 * A row in one of those lists.
 *
 * `accent` is the one loud thing on the screen: a left edge on the rows blocked on the
 * reader. `dim` fades the rows that are finished and waiting on no one.
 */
export function rowShell({
	accent = null,
	dim = false,
}: { accent?: "primary" | "tertiary" | null; dim?: boolean } = {}) {
	return [
		CARD_SHELL,
		"transition-colors",
		accent === "primary"
			? "border-l-4 border-l-primary"
			: accent === "tertiary"
				? "border-l-4 border-l-tertiary"
				: "hover:border-outline-variant",
		dim ? "opacity-70 hover:opacity-100" : "",
	]
		.filter(Boolean)
		.join(" ")
}
