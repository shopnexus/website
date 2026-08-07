import { waitingGroupTitle, type WaitingSide } from "@/lib/order-waiting"

/**
 * A group's label. Only `CẦN BẠN` is coloured — a heading where every heading is bold is
 * a heading that emphasises nothing.
 */
export default function WaitingGroupHeader({
	side,
	count,
}: {
	side: WaitingSide
	count: number
}) {
	const needsYou = side === "you"

	return (
		<div className="flex items-center gap-3 pt-2">
			<h2
				className={`font-label-md text-xs font-bold uppercase tracking-[0.08em] ${
					needsYou ? "text-primary" : "text-on-surface-variant"
				}`}
			>
				{waitingGroupTitle(side, count)}
			</h2>
			<div className={`flex-1 h-px ${needsYou ? "bg-primary/30" : "bg-outline-variant/50"}`} />
		</div>
	)
}
