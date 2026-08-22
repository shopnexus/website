import { TRANSPORT_STATUS_VI } from "@/lib/dictionaries"
import { resolveAddressLines } from "@/lib/order-address"
import { buyerNote } from "@/lib/order-state"
import { CARD_SHELL } from "../../components/rowShell"
import type { Order } from "@/api/generated/types.gen"

/**
 * Where the parcel goes, who carries it, and what the buyer asked for — one card, because
 * they are one subject. They used to be three headings stacked in the same box.
 *
 * Async because the address snapshot stores administrative *codes*, which have to be looked
 * up to be read — see resolveAddressLines.
 */
export default async function OrderShipping({ order }: { order: Order }) {
	const lines = await resolveAddressLines(order.address)
	const transport = order.transport
	const cancelled = order.state === "cancelled"
	const note = buyerNote(order)

	return (
		<div className={`${CARD_SHELL} p-5 md:p-6`}>
			<h2 className="text-title-md text-on-surface mb-4">Giao đến</h2>

			<p className="text-label-md text-on-surface">{order.address.full_name}</p>
			<p className="text-body-sm text-on-surface-variant tabular-nums">{order.address.phone}</p>
			<p className="text-body-sm text-on-surface-variant mt-1">
				{lines.length > 0 ? lines.join(", ") : "Không có địa chỉ chi tiết."}
			</p>

			{note && (
				<p className="mt-4 rounded-lg bg-surface-container p-3 text-body-sm text-on-surface whitespace-pre-line">
					{note}
				</p>
			)}

			<dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-outline-variant pt-4 text-body-sm">
				<dt className="text-on-surface-variant">Đơn vị</dt>
				<dd className="text-on-surface text-right">{transport?.option ?? "—"}</dd>
				<dt className="text-on-surface-variant">Mã vận đơn</dt>
				<dd className="text-on-surface text-right tabular-nums break-all">{transport?.id ?? "—"}</dd>
				<dt className="text-on-surface-variant">Trạng thái</dt>
				<dd className={`text-right ${cancelled ? "text-error" : "text-on-surface"}`}>
					{/* A cancelled order's shipment never left `pending`, so printing that verbatim
					    promised a pickup that is not coming. */}
					{!transport
						? "Chưa giao cho đơn vị vận chuyển"
						: cancelled
							? "Đã hủy"
							: TRANSPORT_STATUS_VI[transport.status]}
				</dd>
			</dl>
		</div>
	)
}
