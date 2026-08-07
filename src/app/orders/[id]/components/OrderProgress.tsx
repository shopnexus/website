import OrderStatusBadge from "@/components/orders/OrderStatusBadge"
import type { Order, TransportStatus } from "@/api/generated/types.gen"

/**
 * The tracker's four stops, and which transport statuses have passed each one.
 *
 * Driven by `order.transport.status` rather than drawn at a fixed three-quarters: a
 * shipment that failed or was returned must not render as "almost delivered".
 */
const STEPS: Array<{ label: string; icon: string; reachedBy: TransportStatus[] }> = [
	{ label: "Đã đặt đơn", icon: "receipt_long", reachedBy: [] },
	{ label: "Đã lấy hàng", icon: "inventory_2", reachedBy: ["picked-up", "in-transit", "delivered"] },
	{ label: "Đang giao", icon: "local_shipping", reachedBy: ["in-transit", "delivered"] },
	{ label: "Nhận hàng", icon: "home", reachedBy: ["delivered"] },
]

/**
 * Where the order is.
 *
 * An order that ended gets an outcome panel, not a delivery tracker. The tracker was drawn
 * unconditionally, so a sale the seller had refused rendered four steps of a journey with
 * the first one lit — the loudest element on the page promising a parcel that was never
 * going to move, while the refusal itself appeared nowhere.
 */
export default function OrderProgress({ order }: { order: Order }) {
	if (order.state === "cancelled") return <Cancelled order={order} />

	return (
		<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
			<div className="flex justify-between items-center mb-6 border-b border-outline-variant border-dashed pb-4">
				<h2 className="font-headline-sm font-bold">Trạng thái đơn hàng</h2>
				{/* The outcome first, then the parcel: an order that ended says so whatever the
				    carrier last reported. Coloured by what the status means — this was
				    `text-primary` at every one of the ten values the label can take, so a
				    failed delivery was drawn exactly like a successful one. */}
				<OrderStatusBadge order={order} />
			</div>

			{order.state === "awaiting-confirmation" ? (
				<AwaitingSeller />
			) : (
				<Tracker status={order.transport?.status ?? null} />
			)}
		</div>
	)
}

function Tracker({ status }: { status: TransportStatus | null }) {
	// Step 0 is always reached — the order exists. The rest follow the shipment.
	const reached = STEPS.map((step, idx) => idx === 0 || (status ? step.reachedBy.includes(status) : false))
	const progress = (reached.filter(Boolean).length - 1) / (STEPS.length - 1)

	return (
		<div className="relative pt-2 pb-8 px-4 sm:px-12">
			<div className="absolute top-5 left-4 sm:left-12 right-4 sm:right-12 h-1 bg-surface-container-high rounded">
				<div className="h-full bg-primary rounded transition-all" style={{ width: `${progress * 100}%` }} />
			</div>
			<div className="relative flex justify-between">
				{STEPS.map((step, idx) => (
					<div key={step.label} className="flex flex-col items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 mb-2 border-[3px] border-surface ${
								reached[idx] ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
							}`}
						>
							<span className="material-symbols-outlined text-[16px]">{step.icon}</span>
						</div>
						<span
							className={`text-[10px] sm:text-xs text-center ${
								reached[idx] ? "font-bold text-primary" : "font-medium text-on-surface-variant"
							}`}
						>
							{step.label}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

/** Nothing has been handed to a carrier yet, so there is no journey to draw. */
function AwaitingSeller() {
	return (
		<div className="flex items-start gap-3 p-4 rounded-xl bg-tertiary-container/40">
			<span className="material-symbols-outlined text-on-tertiary-container">hourglass_top</span>
			<p className="text-body-sm text-on-surface">
				Người bán đang xem xét đơn này. Chưa có gì được giao cho đơn vị vận chuyển, và
				ShopNexus đang giữ toàn bộ số tiền bạn đã trả.
			</p>
		</div>
	)
}

/**
 * How the sale ended, and where the money went.
 *
 * `decline_reason` is set only when the seller refused outright — that is the difference
 * between "this did not happen" and "the seller ended it, and here is why". It is required
 * by the contract and kept on the order precisely so the buyer can read it, and the page
 * was throwing it away.
 */
function Cancelled({ order }: { order: Order }) {
	const declined = Boolean(order.decline_reason)

	return (
		<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
			<div className="flex justify-between items-center mb-4 border-b border-outline-variant border-dashed pb-4">
				<h2 className="font-headline-sm font-bold">Trạng thái đơn hàng</h2>
				{/* The same badge, not a second hardcoded copy: this span read "Đã hủy" whatever
				    the order said, so the one status with two render paths was also the one
				    that could disagree with itself. The panel below stays red — the refusal
				    and its reason are the alarming part, not the outcome label. */}
				<OrderStatusBadge order={order} />
			</div>

			<div className="flex items-start gap-3">
				<span className="material-symbols-outlined text-error">cancel</span>
				<div className="flex flex-col gap-3 min-w-0">
					<p className="font-label-md text-on-surface">
						{declined ? "Người bán đã từ chối đơn hàng này" : "Đơn hàng đã được hủy"}
					</p>

					{order.decline_reason && (
						<blockquote className="border-l-4 border-error/40 pl-3 py-1 text-body-md text-on-surface italic">
							“{order.decline_reason}”
						</blockquote>
					)}

					{/* The parcel never left, so the buyer is made whole including carriage — a
					    fact worth stating, because "đã hủy" alone leaves them wondering about
					    money that has already gone back. */}
					<p className="text-body-sm text-on-surface-variant">
						Toàn bộ số tiền, bao gồm cả phí vận chuyển, đã được hoàn lại vì kiện hàng chưa
						rời kho.
					</p>

					{order.cancelled_at && (
						<p className="text-body-sm text-on-surface-variant">
							Hủy lúc {new Date(order.cancelled_at).toLocaleString("vi-VN")}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
