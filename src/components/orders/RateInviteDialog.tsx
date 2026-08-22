"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"

const LABELS = ["Rất tệ", "Không hài lòng", "Tạm được", "Hài lòng", "Tuyệt vời"]

/**
 * The invitation to rate, opened the moment an order finishes.
 *
 * Not a smaller copy of the rating form — a question: how was this seller. The star row
 * *is* the button, so one click both accepts the invitation and answers it, and the form
 * opens with that score already filled in. A dialog with a "Đánh giá ngay" button that then
 * asks for stars charges twice for the same decision.
 *
 * The blind window is stated here rather than only inside the form, because it is the fact
 * that makes people willing to score honestly: the seller sees nothing until they have also
 * rated, or until the window closes.
 */
export default function RateInviteDialog({
	open,
	sellerName,
	onPick,
	onDismiss,
}: {
	open: boolean
	sellerName: string
	/** The star clicked, carried into the form. */
	onPick: (rating: number) => void
	onDismiss: () => void
}) {
	const [hovered, setHovered] = useState(0)

	return (
		<Modal open={open} title="Đánh giá đơn hàng" onClose={onDismiss} closeOnScrim>
			<div className="flex flex-col gap-5">
				<div className="flex flex-col gap-2">
					<h3 className="text-title-md text-on-surface">Giao dịch với {sellerName} thế nào?</h3>
					<p className="text-body-sm text-on-surface-variant">
						Đơn đã hoàn tất. Đánh giá là kín: người bán chỉ thấy điểm của bạn khi họ cũng
						đánh giá, hoặc sau 14 ngày.
					</p>
				</div>

				<div className="flex flex-col items-center gap-1.5 py-2">
					<div
						className="flex items-center gap-1"
						role="group"
						aria-label="Chọn số sao để đánh giá"
						onMouseLeave={() => setHovered(0)}
					>
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								onMouseEnter={() => setHovered(star)}
								onFocus={() => setHovered(star)}
								onBlur={() => setHovered(0)}
								onClick={() => onPick(star)}
								aria-label={`${star} sao — ${LABELS[star - 1]}`}
								className={`material-symbols-outlined cursor-pointer rounded-full p-1 text-[40px] leading-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
									star <= hovered ? "text-tertiary" : "text-outline-variant"
								}`}
								style={{ fontVariationSettings: star <= hovered ? "'FILL' 1" : "'FILL' 0" }}
							>
								star
							</button>
						))}
					</div>
					<p aria-live="polite" className="font-label-md text-on-surface-variant">
						{hovered > 0 ? LABELS[hovered - 1] : "Chọn số sao để bắt đầu"}
					</p>
				</div>

				<Button variant="ghost" fullWidth onClick={onDismiss}>
					Để sau
				</Button>
			</div>
		</Modal>
	)
}
