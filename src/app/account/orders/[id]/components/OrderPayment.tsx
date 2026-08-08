import Link from "next/link"
import Button from "@/components/ui/Button"
import OrderActions from "@/components/orders/OrderActions"
import type { Order } from "@/api/generated/types.gen"

const formatPrice = (price: number, currency: string) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(price)

/**
 * What was paid, and what may still be done about it.
 *
 * `order.total` is summed from the live lines, so it is the goods alone; the carriage the
 * buyer also paid sits on the shipment. The two are added here rather than read from one
 * field because there is no field that holds both.
 */
export default function OrderPayment({ order }: { order: Order }) {
	const goods = order.total
	const shipping = order.transport?.fee ?? 0
	const cancelled = order.state === "cancelled"

	return (
		<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
			<h3 className="font-headline-sm font-bold mb-4">Thông tin thanh toán</h3>

			<div className="flex flex-col gap-3 text-body-sm text-on-surface-variant border-b border-outline-variant pb-4 mb-4">
				<div className="flex justify-between">
					<span>Tổng tiền hàng</span>
					<span className="text-on-surface">{formatPrice(goods, order.currency)}</span>
				</div>
				<div className="flex justify-between">
					<span>Phí vận chuyển</span>
					<span className="text-on-surface">{formatPrice(shipping, order.currency)}</span>
				</div>
			</div>

			<div className="flex justify-between items-center">
				{/* "Thành tiền" on a cancelled order reads as a bill still owed. The number is the
				    same; what changed is that the money has already gone back. */}
				<span className="font-label-md text-on-surface">
					{cancelled ? "Đã hoàn lại" : "Thành tiền"}
				</span>
				<span
					className={`font-price-lg text-xl font-bold ${cancelled ? "text-on-surface-variant line-through" : "text-primary"}`}
				>
					{formatPrice(goods + shipping, order.currency)}
				</span>
			</div>

			<div className="flex flex-col gap-2 border-t border-outline-variant pt-6 mt-6">
				<OrderActions order={order} variant="detail" />

				{/* Every problem with an order — a parcel that never came, an item that is not
				    what was described, a payment that went wrong — is a ticket of the matching
				    kind, carrying this order's id. Where the parcel *is* comes from the carrier's
				    webhook and only staff may correct it, so this is what a seller who sees it
				    wrong has instead of a status button. */}
				<Link href={`/support?kind=order-issue&ref_id=${order.id}`} className="block">
					<Button variant="ghost" fullWidth>
						Báo cáo sự cố đơn hàng
					</Button>
				</Link>
			</div>
		</div>
	)
}
