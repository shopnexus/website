"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useCounterOffer } from "@/hooks/api/useOffers"
import type { Offer } from "@/api/generated/types.gen"

const formatPrice = (value: number) =>
	new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)

/**
 * Putting different terms on the table.
 *
 * A revision of the same negotiation, not a new offer: the id stays, authorship flips to
 * you, and the 12-hour window restarts. Which is also why the current terms are shown
 * above the field — a counter is answering a number, and typing one with the other out of
 * sight is how people land on the wrong side of their own intent.
 */
export default function CounterOfferDialog({
	offer,
	open,
	onClose,
}: {
	offer: Offer
	open: boolean
	onClose: () => void
}) {
	const [total, setTotal] = useState("")
	const [quantity, setQuantity] = useState(offer.quantity)
	const [reason, setReason] = useState("")
	const counterOffer = useCounterOffer()

	const parsed = Number.parseInt(total.replace(/\D/g, ""), 10)
	const valid = Number.isFinite(parsed) && parsed > 0 && quantity > 0

	const submit = () => {
		if (!valid) return
		counterOffer.mutate(
			{ id: offer.id, body: { total: parsed, quantity, reason: reason.trim() || undefined } },
			{
				onSuccess: () => {
					toast.success("Đã gửi mức giá của bạn")
					setTotal("")
					setReason("")
					onClose()
				},
			},
		)
	}

	return (
		<Modal open={open} title="Trả giá" onClose={onClose}>
			<div className="flex flex-col gap-5">
				<div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
					<span className="text-body-sm text-on-surface-variant">
						{offer.counterparty.name} đang đề nghị
					</span>
					<span className="font-price-md font-bold text-on-surface">
						{formatPrice(offer.total)} × {offer.quantity}
					</span>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="counter-total" className="font-label-md font-bold text-on-surface">
						Mức giá của bạn (tổng)
					</label>
					<input
						id="counter-total"
						inputMode="numeric"
						value={total}
						onChange={(event) => setTotal(event.target.value)}
						placeholder="Nhập số tiền"
						className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none transition-all"
					/>
					{valid && (
						<span className="text-body-sm text-on-surface-variant">{formatPrice(parsed)}</span>
					)}
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="counter-qty" className="font-label-md font-bold text-on-surface">
						Số lượng
					</label>
					<input
						id="counter-qty"
						type="number"
						min={1}
						value={quantity}
						onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
						className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none transition-all"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="counter-reason" className="font-label-md font-bold text-on-surface">
						Lời nhắn (không bắt buộc)
					</label>
					<textarea
						id="counter-reason"
						rows={3}
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Vì sao bạn đề nghị mức này?"
						className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none resize-none transition-all"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Button
						variant="primary"
						fullWidth
						onClick={submit}
						disabled={!valid || counterOffer.isPending}
					>
						{counterOffer.isPending ? "Đang gửi..." : "Gửi mức giá này"}
					</Button>
					<Button variant="ghost" fullWidth onClick={onClose} disabled={counterOffer.isPending}>
						Hủy
					</Button>
				</div>
			</div>
		</Modal>
	)
}
