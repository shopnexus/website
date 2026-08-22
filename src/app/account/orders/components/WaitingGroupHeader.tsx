/**
 * A group's label.
 *
 * Only the two groups that are blocked on the reader are coloured — a heading where every
 * heading is bold is a heading that emphasises nothing.
 *
 * Takes a title rather than a `WaitingSide` because one group on this screen is not a
 * waiting side at all: an unpaid checkout has no order behind it to have a side.
 */
export default function WaitingGroupHeader({
	title,
	tone = "muted",
}: {
	title: string
	tone?: "muted" | "primary" | "tertiary"
}) {
	const text =
		tone === "primary" ? "text-primary" : tone === "tertiary" ? "text-tertiary" : "text-on-surface-variant"
	const rule =
		tone === "primary" ? "bg-primary/30" : tone === "tertiary" ? "bg-tertiary/30" : "bg-outline-variant/50"

	return (
		<div className="flex items-center gap-3 pt-2">
			<h2
				className={`text-label-sm uppercase ${text}`}
			>
				{title}
			</h2>
			<div className={`flex-1 h-px ${rule}`} />
		</div>
	)
}
