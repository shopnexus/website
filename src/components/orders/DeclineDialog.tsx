"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useDeclineOrder } from "@/hooks/api/useOrders"
import type { OrderId } from "@/api/generated/types.gen"

/**
 * The seller refusing a paid sale.
 *
 * The reason is required and it is kept on the order — the buyer reads it as
 * `decline_reason` — so it is asked for in a box rather than a browser prompt, and never
 * defaulted: "Đã hủy" with no cause tells the buyer nothing about goods they paid for.
 */
export default function DeclineDialog({
	orderId,
	open,
	onClose,
}: {
	orderId: OrderId
	open: boolean
	onClose: () => void
}) {
	const [reason, setReason] = useState("")
	const decline = useDeclineOrder()

	const submit = () => {
		decline.mutate(
			{ orderId, reason: reason.trim() },
			{
				onSuccess: () => {
					toast.success("Đã từ chối đơn hàng")
					setReason("")
					onClose()
				},
			},
		)
	}

	return (
		<Modal open={open} title="Từ chối đơn hàng" onClose={onClose}>
			<div className="flex flex-col gap-5">
				<p className="text-body-sm text-on-surface-variant">
					Người mua được hoàn lại toàn bộ, kể cả phí vận chuyển, và hàng được trả về kho của
					bạn. Lý do bạn viết ở đây sẽ hiển thị cho người mua.
				</p>

				<textarea
					rows={3}
					maxLength={500}
					value={reason}
					onChange={(event) => setReason(event.target.value)}
					placeholder="Hết hàng, sai giá, không giao được tới khu vực này..."
					className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none resize-none transition-all"
				/>

				<div className="flex flex-col gap-2">
					<Button
						variant="error"
						fullWidth
						onClick={submit}
						disabled={reason.trim().length === 0 || decline.isPending}
					>
						{decline.isPending ? "Đang gửi..." : "Từ chối đơn"}
					</Button>
					<Button variant="ghost" fullWidth onClick={onClose} disabled={decline.isPending}>
						Quay lại
					</Button>
				</div>
			</div>
		</Modal>
	)
}
