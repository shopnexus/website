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
	orderRefId,
	refund: subject,
}: {
	orderRefId: string | null
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
			<section className="bg-primary-container text-on-primary-container rounded-2xl p-5 flex flex-col gap-2">
				<h2 className="font-label-md inline-flex items-center gap-2">
					<span className="material-symbols-outlined text-[18px]">verified</span>
					Đã ra phán quyết
				</h2>
				<p className="font-body-sm">{verdictOutcome(decided)}</p>
				<p className="font-label-sm opacity-80">
					Các yêu cầu hỗ trợ đang mở về đơn hàng này sẽ được đóng kèm ghi chú của bạn.
				</p>
			</section>
		)
	}

	return (
		<section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-4">
			<div className="rounded-xl bg-tertiary-container text-on-tertiary-container p-3 flex gap-2">
				<span className="material-symbols-outlined text-[18px] shrink-0">account_balance</span>
				<div className="flex flex-col gap-1">
					<span className="font-label-md">Không kết luận bằng tay được</span>
					<span className="font-label-sm">
						Khiếu nại hoàn tiền được quyết định bằng cách xử lý khoản tiền: phán quyết bên
						dưới vừa chuyển tiền vừa tự đóng yêu cầu này. Ghi kết quả thủ công sẽ bị hệ
						thống từ chối vì tiền ký quỹ vẫn nằm nguyên chỗ cũ.
					</span>
				</div>
			</div>

			{orderRefId && (
				<div className="font-label-sm text-on-surface-variant">
					Đơn hàng bị khiếu nại:{" "}
					<code className="font-mono bg-surface-container px-2 py-0.5 rounded-md">
						{orderRefId}
					</code>
				</div>
			)}

			{subject ? (
				<div className="font-label-sm text-on-surface-variant flex flex-col gap-1">
					<span>
						Yêu cầu hoàn tiền:{" "}
						<code className="font-mono bg-surface-container px-2 py-0.5 rounded-md">
							{subject.id}
						</code>
					</span>
					{/* Which branch a verdict for the buyer takes is decided by this alone. */}
					<span>
						{subject.returnedAt
							? "Hàng đã được hoàn về — phán quyết cho người mua sẽ trả tiền ngay và đóng đơn."
							: "Hàng chưa được hoàn về — phán quyết cho người mua sẽ mở chặng hoàn hàng trước."}
					</span>
				</div>
			) : (
				<div className="font-label-sm text-on-surface-variant">
					Đơn hàng này hiện không có yêu cầu hoàn tiền nào đang mở, nên không có gì để
					phán quyết.
				</div>
			)}

			<label className="flex flex-col gap-1.5">
				<span className="font-label-sm text-on-surface-variant">
					Lý do phán quyết (gửi kèm cho hai bên)
				</span>
				<textarea
					value={note}
					onChange={(event) => setNote(event.target.value)}
					rows={3}
					placeholder="Căn cứ vào bằng chứng hai bên cung cấp..."
					className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all resize-y"
				/>
			</label>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				<Button
					variant="primary"
					disabled={!idIsUsable || verdict.isPending}
					onClick={() => setConfirming(true)}
				>
					Người mua thắng
				</Button>
				<Button
					variant="outline"
					disabled={!idIsUsable || verdict.isPending}
					onClick={() => setConfirming(false)}
				>
					Người bán thắng
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
