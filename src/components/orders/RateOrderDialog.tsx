"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useOrderFeedback, useSubmitFeedback } from "@/hooks/api/useOrders"
import { remainingLabel } from "@/lib/order-state"
import type { OrderId } from "@/api/generated/types.gen"

const MAX_COMMENT = 2000

/**
 * Rating the other party of a finished order.
 *
 * Blind, and that is the whole shape of this screen: one submission per direction, no
 * revision, and the counterparty's rating stays hidden until both have submitted or the
 * window closes. So the dialog says a rating is final *before* it is given, shows only
 * whether the other side has rated — never what they said — and, once submitted, becomes a
 * read-only receipt instead of a form.
 */
export default function RateOrderDialog({
	orderId,
	open,
	onClose,
	initialRating = 0,
}: {
	orderId: OrderId
	open: boolean
	onClose: () => void
	/**
	 * The star already clicked on the invitation, so the form does not ask twice. Read once,
	 * as the initial state: a caller that needs to change it remounts with a new `key`, which
	 * is what RateInviteGate does.
	 */
	initialRating?: number
}) {
	const [rating, setRating] = useState(initialRating)
	const [comment, setComment] = useState("")
	const { data: feedback, isLoading } = useOrderFeedback(open ? orderId : undefined)
	const submitFeedback = useSubmitFeedback()

	const submit = () => {
		submitFeedback.mutate(
			{ orderId, rating, comment: comment.trim() },
			{
				onSuccess: () => {
					toast.success("Cảm ơn bạn đã đánh giá")
					setRating(0)
					setComment("")
				},
			},
		)
	}

	const mine = feedback?.mine ?? null
	const reveal = remainingLabel(feedback?.reveal_at ?? null)

	return (
		<Modal open={open} title="Đánh giá đơn hàng" onClose={onClose}>
			{isLoading ? (
				<div className="py-6 text-center text-on-surface-variant">Đang tải...</div>
			) : mine ? (
				<div className="flex flex-col gap-4">
					<Stars value={mine.rating} />
					{mine.comment && <p className="text-body-md text-on-surface">{mine.comment}</p>}
					<p className="text-body-sm text-on-surface-variant">
						{mine.published_at
							? "Đánh giá của bạn đã được công khai."
							: reveal
								? `Đánh giá sẽ hiển thị sau ${reveal}, hoặc ngay khi cả hai bên cùng đánh giá.`
								: "Đánh giá của bạn đang chờ hiển thị."}
					</p>
					{feedback?.theirs ? (
						<div className="border-t border-outline-variant pt-4 flex flex-col gap-2">
							<h3 className="font-label-md font-bold text-on-surface">Họ đánh giá bạn</h3>
							<Stars value={feedback.theirs.rating} />
							{feedback.theirs.comment && (
								<p className="text-body-md text-on-surface">{feedback.theirs.comment}</p>
							)}
						</div>
					) : (
						<p className="text-body-sm text-on-surface-variant border-t border-outline-variant pt-4">
							{feedback?.theirs_submitted
								? "Bên kia đã đánh giá, nội dung sẽ hiển thị cùng lúc với của bạn."
								: "Bên kia chưa đánh giá."}
						</p>
					)}
					<Button variant="outline" fullWidth onClick={onClose}>
						Đóng
					</Button>
				</div>
			) : (
				<div className="flex flex-col gap-5">
					<p className="text-body-sm text-on-surface-variant">
						Đánh giá gửi đi là cuối cùng và không sửa được. Cả hai bên chỉ nhìn thấy đánh
						giá của nhau sau khi cùng gửi, hoặc khi hết thời gian chờ.
					</p>

					<Stars value={rating} onChange={setRating} />

					<div className="flex flex-col gap-2">
						<label htmlFor="feedback-comment" className="font-label-md font-bold text-on-surface">
							Nhận xét (không bắt buộc)
						</label>
						<textarea
							id="feedback-comment"
							rows={4}
							maxLength={MAX_COMMENT}
							value={comment}
							onChange={(event) => setComment(event.target.value)}
							placeholder="Giao dịch diễn ra thế nào?"
							className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none resize-none transition-all"
						/>
					</div>

					<Button
						variant="primary"
						fullWidth
						onClick={submit}
						disabled={rating === 0 || submitFeedback.isPending}
					>
						{submitFeedback.isPending ? "Đang gửi..." : "Gửi đánh giá"}
					</Button>
				</div>
			)}
		</Modal>
	)
}

/** Read-only without `onChange` — the same row draws the form and the receipt. */
function Stars({ value, onChange }: { value: number; onChange?: (next: number) => void }) {
	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					disabled={!onChange}
					onClick={() => onChange?.(star)}
					aria-label={`${star} sao`}
					className={`material-symbols-outlined text-[32px] ${
						star <= value ? "text-tertiary" : "text-outline-variant"
					} ${onChange ? "cursor-pointer hover:text-tertiary" : "cursor-default"}`}
					style={{ fontVariationSettings: star <= value ? "'FILL' 1" : "'FILL' 0" }}
				>
					star
				</button>
			))}
		</div>
	)
}
