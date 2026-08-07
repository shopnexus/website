import { TRANSPORT_STATUS_VI } from "@/lib/dictionaries"
import { resolveAddressLines } from "@/lib/order-address"
import type { Order } from "@/api/generated/types.gen"

/**
 * Where the parcel is going and who is carrying it.
 *
 * Async because the address snapshot stores administrative *codes*, which have to be
 * looked up to be read — see resolveAddressLines.
 */
export default async function OrderShipping({ order }: { order: Order }) {
	const lines = await resolveAddressLines(order.address)
	const transport = order.transport
	const cancelled = order.state === "cancelled"

	return (
		<div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
			<h3 className="font-headline-sm font-bold mb-4">Địa chỉ nhận hàng</h3>
			<div className="flex flex-col gap-1 text-body-sm text-on-surface mb-6">
				<div className="font-bold mb-1">{order.address.full_name}</div>
				<div>{order.address.phone}</div>
				{lines.length > 0 ? (
					<div className="text-on-surface-variant leading-relaxed">{lines.join(", ")}</div>
				) : (
					<div className="text-on-surface-variant italic">Không có địa chỉ chi tiết.</div>
				)}
			</div>

			<h3 className="font-headline-sm font-bold mb-4">Thông tin vận chuyển</h3>
			{transport ? (
				<div className="flex flex-col gap-1 text-body-sm text-on-surface">
					<div>
						Đơn vị: <span className="font-bold">{transport.option}</span>
					</div>
					<div>
						Mã vận đơn: <span className="font-bold">{transport.id}</span>
					</div>
					<div>
						Trạng thái:{" "}
						{/* A cancelled order's shipment says "Chờ lấy hàng" in the row, because nothing
						    ever moved it off `pending` — printing that verbatim promised a pickup that
						    is not coming. */}
						<span className={`font-bold ${cancelled ? "text-error" : ""}`}>
							{cancelled ? "Đã hủy, không giao nữa" : TRANSPORT_STATUS_VI[transport.status]}
						</span>
					</div>
				</div>
			) : (
				<div className="text-body-sm text-on-surface-variant">
					Chưa giao cho đơn vị vận chuyển.
				</div>
			)}
		</div>
	)
}
