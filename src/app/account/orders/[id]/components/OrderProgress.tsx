import { Fragment } from "react"
import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import { CARD_SHELL } from "../../components/rowShell"
import type { Order, TransportStatus } from "@/api/generated/types.gen"

/**
 * The tracker's four stops, and which transport statuses have passed each one. Driven by
 * `order.transport.status`, so a shipment that failed does not render as almost-delivered.
 */
const STEPS: Array<{ label: string; icon: string; reachedBy: TransportStatus[] }> = [
	{ label: "Đặt đơn", icon: "receipt_long", reachedBy: [] },
	{ label: "Lấy hàng", icon: "inventory_2", reachedBy: ["picked-up", "in-transit", "delivered"] },
	{ label: "Đang giao", icon: "local_shipping", reachedBy: ["in-transit", "delivered"] },
	{ label: "Đã nhận", icon: "home", reachedBy: ["delivered"] },
]

/**
 * Where the order is, as one strip rather than a card with its own heading — the badge and
 * the stops already say what it is. An order that ended gets its outcome instead: a tracker
 * on a refused sale promises a parcel that is not coming.
 */
export default function OrderProgress({ order }: { order: Order }) {
	if (order.state === "cancelled") return <Cancelled order={order} />

	return (
		<div className={`${CARD_SHELL} p-5 md:p-6`}>
			<div className="flex flex-wrap items-center justify-between gap-3 mb-6">
				<OrderStatusBadge order={order} />
				{order.transport && (
					<span className="text-body-xs text-on-surface-variant tabular-nums">
						{order.transport.option} · {order.transport.id}
					</span>
				)}
			</div>

			{order.state === "awaiting-confirmation" ? (
				<p className="flex items-center gap-2 text-body-sm text-on-surface">
					<span className="material-symbols-outlined text-[20px] text-on-tertiary-container" aria-hidden="true">
						hourglass_top
					</span>
					Người bán đang xem xét. Tiền vẫn được giữ hộ.
				</p>
			) : (
				<Tracker status={order.transport?.status ?? null} />
			)}
		</div>
	)
}

function Tracker({ status }: { status: TransportStatus | null }) {
	// Step 0 is always reached — the order exists. The rest follow the shipment.
	const reached = STEPS.map((s, i) => i === 0 || (status ? s.reachedBy.includes(status) : false))

	return (
		<ol className="flex items-start max-w-xl">
			{STEPS.map((step, i) => (
				<Fragment key={step.label}>
					{/* The connector belongs between two stops, so it is a flex child rather than an
					    absolutely positioned bar — that one overshot the first and last icon. */}
					{i > 0 && (
						<li
							aria-hidden="true"
							className={`h-0.5 flex-1 mt-4 rounded ${
								reached[i] ? "bg-primary" : "bg-surface-container-high"
							}`}
						/>
					)}
					<li className="flex flex-col items-center gap-1.5 shrink-0">
						<span
							className={`grid size-8 place-items-center rounded-full ${
								reached[i] ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
							}`}
						>
							<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
								{step.icon}
							</span>
						</span>
						<span
							className={`text-label-xs text-center ${
								reached[i] ? "text-primary" : "text-on-surface-variant"
							}`}
						>
							{step.label}
						</span>
					</li>
				</Fragment>
			))}
		</ol>
	)
}

/**
 * How the sale ended. `decline_reason` is the difference between "this did not happen" and
 * "the seller ended it, and here is why" — it is kept on the order so the buyer can read it.
 */
function Cancelled({ order }: { order: Order }) {
	const declined = Boolean(order.decline_reason)

	return (
		<div className={`${CARD_SHELL} p-5 md:p-6`}>
			<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
				<OrderStatusBadge order={order} />
				{order.cancelled_at && (
					<span className="text-body-xs text-on-surface-variant">
						{new Date(order.cancelled_at).toLocaleDateString("vi-VN")}
					</span>
				)}
			</div>

			<p className="flex items-center gap-2 text-label-md text-on-surface">
				<span className="material-symbols-outlined text-[20px] text-error" aria-hidden="true">
					cancel
				</span>
				{declined ? "Người bán đã từ chối đơn này" : "Đơn đã hủy"}
			</p>

			{order.decline_reason && (
				<blockquote className="mt-3 border-l-2 border-error/40 pl-3 text-body-sm text-on-surface italic">
					{order.decline_reason}
				</blockquote>
			)}

			<p className="mt-3 text-body-sm text-on-surface-variant">
				Đã hoàn lại toàn bộ, gồm cả phí giao hàng.
			</p>
		</div>
	)
}
