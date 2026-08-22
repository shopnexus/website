import Link from "next/link"
import Button from "@/components/ui/Button"
import OrderActions from "@/components/orders/OrderActions"
import { CARD_SHELL } from "../../components/rowShell"
import type { Order } from "@/api/generated/types.gen"

const formatPrice = (price: number, currency: string) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price)

/**
 * What was paid, and what may still be done about it. Sticky, because it holds the total and
 * the actions — the two things a buyer scrolls back up for.
 *
 * `order.total` is the goods alone; the carriage sits on the shipment, so the two are added
 * here rather than read from one field that does not exist.
 */
export default function OrderPayment({ order }: { order: Order }) {
	const goods = order.total
	const shipping = order.transport?.fee ?? 0
	const cancelled = order.state === "cancelled"

	return (
		<div className={`${CARD_SHELL} p-5 md:p-6 lg:sticky lg:top-24`}>
			<dl className="grid grid-cols-[1fr_auto] gap-y-2 text-body-sm">
				<dt className="text-on-surface-variant">Tiền hàng</dt>
				<dd className="text-on-surface tabular-nums text-right">
					{formatPrice(goods, order.currency)}
				</dd>
				<dt className="text-on-surface-variant">Phí giao hàng</dt>
				<dd className="text-on-surface tabular-nums text-right">
					{formatPrice(shipping, order.currency)}
				</dd>
			</dl>

			<div className="mt-4 flex items-baseline justify-between border-t border-outline-variant pt-4">
				{/* "Thành tiền" on a cancelled order reads as a bill still owed; the number is the
				    same, but the money has already gone back. */}
				<span className="text-label-md text-on-surface">
					{cancelled ? "Đã hoàn lại" : "Thành tiền"}
				</span>
				<span
					className={`text-price-lg ${cancelled ? "text-on-surface-variant line-through" : "text-primary"}`}
				>
					{formatPrice(goods + shipping, order.currency)}
				</span>
			</div>

			<div className="mt-5 flex flex-col gap-2">
				<OrderActions order={order} variant="detail" />
				{/* Where the parcel is comes from the carrier and only staff may correct it, so a
				    ticket is what somebody who sees it wrong has instead of a status button. */}
				<Link href={`/inbox?kind=order-issue&ref_id=${order.id}`}>
					<Button variant="ghost" fullWidth>
						Báo cáo sự cố
					</Button>
				</Link>
			</div>
		</div>
	)
}
