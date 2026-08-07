"use client"

import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useCancelPaymentSession } from "@/hooks/api/useFinance"
import type { PaymentSessionId } from "@/api/generated/types.gen"

/**
 * Dropping an unpaid checkout for good.
 *
 * A dialog rather than a bare button because the session is the only thing holding the
 * purchase together: cancelling it releases the reserved lines and there is no route back
 * — the buyer starts again from the product page, at whatever the price is by then.
 *
 * Nothing is refunded here and the copy says so. A session that took money is not
 * cancellable at all; the server refuses it, and the buyer's exit from a paid order is a
 * refund request against the order it produced.
 */
export default function CancelCheckoutDialog({
	sessionId,
	open,
	onClose,
	onCancelled,
}: {
	sessionId: PaymentSessionId
	open: boolean
	onClose: () => void
	onCancelled?: () => void
}) {
	const cancel = useCancelPaymentSession()

	const submit = () => {
		cancel.mutate(sessionId, {
			onSuccess: () => {
				toast.success("Đã huỷ đơn chờ thanh toán")
				onClose()
				onCancelled?.()
			},
		})
	}

	return (
		<Modal open={open} title="Huỷ đơn chờ thanh toán?" onClose={onClose}>
			<div className="flex flex-col gap-5">
				<p className="text-body-sm text-on-surface-variant">
					Đơn này sẽ bị huỷ hẳn và không thể thanh toán lại. Bạn chưa trả tiền nên không có
					gì được hoàn — nếu muốn mua lại, hãy đặt lại từ trang sản phẩm.
				</p>

				<div className="flex flex-col gap-2">
					<Button
						variant="primary"
						fullWidth
						onClick={submit}
						disabled={cancel.isPending}
						className="bg-error text-on-error hover:bg-error/90"
					>
						{cancel.isPending ? "Đang huỷ..." : "Huỷ đơn"}
					</Button>
					<Button variant="ghost" fullWidth onClick={onClose} disabled={cancel.isPending}>
						Giữ lại
					</Button>
				</div>
			</div>
		</Modal>
	)
}
