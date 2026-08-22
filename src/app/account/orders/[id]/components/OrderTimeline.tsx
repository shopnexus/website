"use client"

import Skeleton from "@/components/ui/Skeleton"
import { TRANSPORT_STATUS_VI } from "@/lib/dictionaries"
import { useOrderHistory } from "@/hooks/api/useOrders"
import { CARD_SHELL } from "../../components/rowShell"
import type { OrderHistoryEntry } from "@/api/generated/types.gen"

/** One line per fact, in the order's own vocabulary rather than the trail's codes. */
const LABELS: Record<string, string> = {
	"order.placed": "Đã đặt và thanh toán",
	"order.confirmed": "Người bán đã xác nhận",
	"order.declined": "Người bán từ chối",
	"order.confirmation_escalated": "Đã nhờ ShopNexus nhắc người bán",
	"order.shipment_advanced": "Vận chuyển",
	"order.received": "Người mua đã nhận hàng",
	"order.cancelled": "Đơn đã hủy",
	"order.completed": "Đơn hoàn tất",
	"order.payout_released": "Đã chuyển tiền cho người bán",
}

/** The icon carries the meaning of the step, so it follows the fact and not the actor. */
const ICONS: Record<string, string> = {
	"order.placed": "receipt_long",
	"order.confirmed": "check_circle",
	"order.declined": "cancel",
	"order.confirmation_escalated": "support_agent",
	"order.shipment_advanced": "local_shipping",
	"order.received": "inventory_2",
	"order.cancelled": "cancel",
	"order.completed": "task_alt",
	"order.payout_released": "payments",
}

const ACTORS: Record<OrderHistoryEntry["actor_kind"], string> = {
	buyer: "Người mua",
	seller: "Người bán",
	carrier: "Đơn vị vận chuyển",
	system: "ShopNexus",
}

/**
 * What has happened to this order.
 *
 * The rest of the page is a snapshot — where the order is now — and could not answer when the
 * seller accepted, when the parcel moved, or why a sale ended. That is a whole question the
 * screen was missing rather than a decoration.
 *
 * Renders nothing at all when the trail is empty: an order settled before the module began
 * recording has no story to tell, and an empty box claiming otherwise is worse than silence.
 */
export default function OrderTimeline({ orderId }: { orderId: string }) {
	const { data: entries = [], isLoading, isError } = useOrderHistory(orderId)

	if (isLoading) {
		return (
			<div className={`${CARD_SHELL} p-5 md:p-6`}>
				<Skeleton className="h-5 w-32 mb-4" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		)
	}
	if (isError || entries.length === 0) return null

	return (
		<div className={`${CARD_SHELL} p-5 md:p-6`}>
			<h2 className="text-title-md text-on-surface mb-4">Diễn biến</h2>
			<ol className="flex flex-col">
				{entries.map((entry, index) => (
					<li key={entry.version} className="flex gap-3">
						{/* The rail is drawn by the row, so it stops at the last one instead of
						    trailing past it. */}
						<div className="flex flex-col items-center shrink-0">
							<span
								className={`grid size-8 place-items-center rounded-full ${
									index === 0
										? "bg-primary text-on-primary"
										: "bg-surface-container-high text-on-surface-variant"
								}`}
							>
								<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
									{ICONS[entry.code] ?? "history"}
								</span>
							</span>
							{index < entries.length - 1 && (
								<span className="w-0.5 flex-1 bg-surface-container-high" aria-hidden="true" />
							)}
						</div>

						<div className={`min-w-0 flex-1 ${index < entries.length - 1 ? "pb-5" : ""}`}>
							<p className="text-label-md text-on-surface">{label(entry)}</p>
							<p className="text-body-xs text-on-surface-variant mt-0.5">
								{ACTORS[entry.actor_kind]} ·{" "}
								{new Date(entry.changed_at).toLocaleString("vi-VN", {
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
							{entry.reason && (
								<blockquote className="mt-2 border-l-2 border-error/40 pl-3 text-body-sm text-on-surface italic">
									{entry.reason}
								</blockquote>
							)}
							{entry.evidence > 0 && (
								<p className="text-body-xs text-on-surface-variant mt-1">
									Kèm {entry.evidence} ảnh
								</p>
							)}
						</div>
					</li>
				))}
			</ol>
		</div>
	)
}

/**
 * A shipment move is named by where the parcel got to — "Đang vận chuyển" already reads as
 * the step, and the icon says it is the parcel, so prefixing it gave "Vận chuyển: Đang vận
 * chuyển". Every other fact is its own label.
 */
function label(entry: OrderHistoryEntry): string {
	if (entry.code === "order.shipment_advanced" && entry.shipment_status) {
		const status = TRANSPORT_STATUS_VI[entry.shipment_status as keyof typeof TRANSPORT_STATUS_VI]
		if (status) return status
	}
	return LABELS[entry.code] ?? entry.code
}
