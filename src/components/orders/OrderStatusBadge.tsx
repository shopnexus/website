import Badge from "@/components/ui/Badge"
import { orderStatusLabel, orderStatusTone, type OrderStatusTone } from "@/lib/order-state"
import type { Order } from "@/api/generated/types.gen"

/**
 * Where an order stands, in one pill.
 *
 * Built on {@link Badge} rather than beside it: the app has one badge system and a second
 * one would drift from it. The mapping is the whole component — the label and the tone are
 * both derived from the order, so no caller can pair "Hoàn thành" with a red fill.
 *
 * This is deliberately *not* used on the order list card. That card says the status as a
 * sentence naming whose move it is ("Cần bạn xác nhận · còn 4 giờ"), which carries strictly
 * more than a pill can; a badge there would repeat it in fewer words.
 */
const toneVariant: Record<OrderStatusTone, "warning" | "secondary" | "success" | "surface" | "error"> = {
	waiting: "warning",
	moving: "secondary",
	success: "success",
	neutral: "surface",
	danger: "error",
}

const toneIcon: Record<OrderStatusTone, string> = {
	waiting: "hourglass_top",
	moving: "local_shipping",
	success: "check_circle",
	neutral: "remove_circle_outline",
	danger: "error",
}

export default function OrderStatusBadge({
	order,
	className = "",
}: {
	order: Order
	className?: string
}) {
	const tone = orderStatusTone(order)

	return (
		<Badge variant={toneVariant[tone]} icon={toneIcon[tone]} className={`uppercase ${className}`}>
			{orderStatusLabel(order)}
		</Badge>
	)
}
