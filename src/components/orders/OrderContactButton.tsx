"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import { useMe } from "@/hooks/api/useAccount"
import { useStartConversation } from "@/hooks/api/useChat"
import { sideOf } from "@/lib/order-state"
import type { Order } from "@/api/generated/types.gen"

/**
 * Open the thread with the other party of an order.
 *
 * The counterparty is derived rather than fixed to the seller: the same order rows are
 * rendered for both sides, and a "Liên hệ Shop" that opens a thread with yourself is what
 * a hard-coded `order.seller` produces on the selling side. Chat already keeps one thread
 * per pair of accounts, so this creates nothing that was not already there.
 */
export default function OrderContactButton({
	order,
	variant = "outline",
	size = "md",
	fullWidth = false,
	className = "",
}: {
	order: Order
	variant?: "outline" | "ghost"
	size?: "sm" | "md"
	fullWidth?: boolean
	className?: string
}) {
	const router = useRouter()
	const { data: me } = useMe()
	const startConversation = useStartConversation()

	const { isSeller } = sideOf(order, me?.id)
	const other = isSeller ? order.buyer : order.seller

	return (
		<Button
			variant={variant}
			size={size}
			fullWidth={fullWidth}
			className={className}
			icon={<span className="material-symbols-outlined">chat</span>}
			disabled={startConversation.isPending}
			onClick={() =>
				startConversation.mutate(
					{ account_id: other.id },
					{
						onSuccess: (conversation) => router.push(`/inbox?c=${conversation.id}`),
						onError: () => toast.error("Không thể mở cuộc trò chuyện"),
					},
				)
			}
		>
			{startConversation.isPending ? "Đang mở..." : `Nhắn ${other.name}`}
		</Button>
	)
}
