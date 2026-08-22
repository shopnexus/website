"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import { useRefundVerdict } from "@/hooks/api/useAdminModeration"
import type { Refund } from "@/api/generated/types.gen"
import type { OrderRefund } from "../../_lib/queue.logic"
import { verdictOutcome } from "../../_lib/verdict.logic"
import RefundVerdictDialog from "./RefundVerdictDialog"

/**
 * The decision surface for a `refund-dispute`, which replaces the resolution form rather
 * than sitting beside it: this kind answers 409 `ticket_decided_elsewhere` to a hand
 * resolution, because marking the case settled would leave the escrow where it was.
 *
 * The ticket names the *order* — that is what a refund dispute is filed against, so both
 * parties' complaints about one sale land in one thread — and the live refund now travels
 * with it inside `target`, so the id is read rather than typed in off the conversation.
 */
export default function RefundVerdictPanel({
	refund: subject,
}: {
	refund: OrderRefund | null
}) {
	const [note, setNote] = useState("")
	const [confirming, setConfirming] = useState<boolean | null>(null)
	const [decided, setDecided] = useState<Refund | null>(null)
	const verdict = useRefundVerdict()

	const refundId = subject?.id ?? ""
	const idIsUsable = Boolean(subject)

	const decide = (buyerWins: boolean) => {
		verdict.mutate(
			{
				id: refundId.trim(),
				body: { buyer_wins: buyerWins, note: note.trim() || undefined },
			},
			{
				onSuccess: (refund) => {
					setDecided(refund)
					setConfirming(null)
					toast.success("Đã ra phán quyết cho yêu cầu hoàn tiền.")
				},
			},
		)
	}

	if (decided) {
		return (
			<section className="bg-status-ok text-on-status-ok rounded-2xl p-5 flex flex-col gap-2">
				<h2 className="font-label-md inline-flex items-center gap-2">
					<span className="material-symbols-outlined text-[18px]">verified</span>
					Đã ra phán quyết
				</h2>
				<p className="font-body-sm">{verdictOutcome(decided)}</p>
				<p className="font-label-sm opacity-80">
					Mọi yêu cầu đang mở về đơn này đã được đóng kèm ghi chú của bạn.
				</p>
			</section>
		)
	}

	return (
		<section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-3.5">
			{/* This panel used to open with a bordered warning box — "Không kết luận bằng tay
			    được", then three lines on why a hand resolution is refused because the escrow
			    has not moved. It was the loudest thing on the case, and it warned against an
			    action this screen never offers: for a refund dispute the resolution form is
			    replaced by these two buttons, so there is no manual verdict to talk anybody out
			    of. What a moderator needs is one line saying the buttons are the decision, and
			    it belongs next to the buttons. */}
			<div className="flex flex-col gap-1 font-label-sm text-on-surface-variant">
				<span className="inline-flex items-center gap-1.5">
					Hoàn tiền
					<code className="font-mono bg-surface-container px-2 py-0.5 rounded-md">
						{subject ? subject.id : "—"}
					</code>
				</span>
				{/* Which branch a verdict for the buyer takes is decided by this alone, so it is
				    the one sentence here that changes what happens. */}
				{subject && (
					<span>
						{subject.returnedAt
							? "Hàng đã hoàn về — hoàn tiền sẽ trả ngay và đóng đơn."
							: "Hàng chưa hoàn về — hoàn tiền sẽ mở chặng hoàn hàng trước."}
					</span>
				)}
				{!subject && <span>Không có yêu cầu hoàn tiền nào đang mở.</span>}
			</div>

			<label className="flex flex-col gap-1.5">
				<span className="font-label-sm text-on-surface-variant">
					Lý do — gửi cho cả hai bên
				</span>
				<textarea
					value={note}
					onChange={(event) => setNote(event.target.value)}
					rows={3}
					placeholder="Căn cứ vào bằng chứng hai bên cung cấp..."
					className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all resize-y"
				/>
			</label>

			<p className="font-label-sm text-on-surface-variant">
				Hai nút này vừa chuyển tiền vừa đóng yêu cầu.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				<Button
					variant="primary"
					disabled={!idIsUsable || verdict.isPending}
					onClick={() => setConfirming(true)}
				>
					Hoàn tiền cho người mua
				</Button>
				<Button
					variant="outline"
					disabled={!idIsUsable || verdict.isPending}
					onClick={() => setConfirming(false)}
				>
					Từ chối hoàn tiền
				</Button>
			</div>

			<RefundVerdictDialog
				open={confirming !== null}
				buyerWins={confirming === true}
				returnedAt={subject?.returnedAt ?? null}
				pending={verdict.isPending}
				onConfirm={() => decide(confirming === true)}
				onClose={() => setConfirming(null)}
			/>
		</section>
	)
}
