/**
 * The three class strings the filter rail repeats.
 *
 * They were declared twice — once in the panel and once in the area section — and had already
 * drifted: the heading carried both `font-label-md` and `text-label-xs`, two sizes for one
 * label, with the winner decided by the order the rules happen to sit in the stylesheet.
 */

/** A group's name. Small, uppercase and quiet — it labels, the controls do the talking. */
export const HEADING = "mb-2.5 font-label-xs uppercase tracking-wider text-on-surface-variant"

/** A group under the one above it. */
export const SECTION = "border-t border-outline-variant pt-4"

/** A text or number input inside the rail. */
export const FIELD =
	"w-full rounded-lg bg-surface-container px-3 py-2 font-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
