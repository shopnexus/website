"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import { useResolveTicket } from "@/hooks/api/useAdminModeration"
import type { TicketId, TicketResolutionAction } from "@/api/generated/types.gen"
import { RESOLUTION_ACTIONS } from "../../_lib/verdict.logic"

/**
 * The verdict on an ordinary ticket.
 *
 * Recording an action here does not carry it out — a takedown and a suspension are calls
 * to the modules that own them — so every choice says which screen actually does the
 * thing. The note is the record kept beside the verdict; what the requester should read
 * goes in the thread as an ordinary message.
 */
export default function ResolutionForm({ ticketId }: { ticketId: TicketId }) {
	const [action, setAction] = useState<TicketResolutionAction>("none")
	const [note, setNote] = useState("")
	const resolve = useResolveTicket()

	const submit = () => {
		resolve.mutate(
			{ id: ticketId, body: { action_taken: action, note: note.trim() || undefined } },
			{ onSuccess: () => toast.success("Đã ghi nhận kết quả xử lý.") },
		)
	}

	return (
		<section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-4">
			<div>
				<h2 className="font-label-md text-on-surface">Kết luận yêu cầu</h2>
				<p className="font-label-sm text-on-surface-variant mt-1">
					Ghi lại quyết định. Việc gỡ tin đăng hay khoá tài khoản là thao tác riêng ở màn
					tương ứng — ghi ở đây không tự thực hiện.
				</p>
			</div>

			<fieldset className="flex flex-col gap-2">
				<legend className="sr-only">Hành động đã thực hiện</legend>
				{RESOLUTION_ACTIONS.map((option) => (
					<label
						key={option.value}
						className={[
							"flex gap-3 items-start p-3 rounded-xl border cursor-pointer transition-colors",
							action === option.value
								? "border-primary bg-primary/5"
								: "border-outline-variant hover:bg-surface-container-low",
						].join(" ")}
					>
						<input
							type="radio"
							name="action_taken"
							className="mt-1 accent-[var(--color-primary)]"
							checked={action === option.value}
							onChange={() => setAction(option.value)}
						/>
						<span className="flex flex-col gap-0.5 min-w-0">
							<span className="font-label-md text-on-surface">{option.label}</span>
							<span className="font-label-sm text-on-surface-variant">{option.hint}</span>
						</span>
					</label>
				))}
			</fieldset>

			<label className="flex flex-col gap-1.5">
				<span className="font-label-sm text-on-surface-variant">Ghi chú nội bộ (tuỳ chọn)</span>
				<textarea
					value={note}
					onChange={(event) => setNote(event.target.value)}
					rows={3}
					placeholder="Căn cứ của quyết định, lưu lại cùng hồ sơ."
					className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all resize-y"
				/>
			</label>

			<Button
				variant="primary"
				fullWidth
				disabled={resolve.isPending}
				onClick={submit}
				icon={<span className="material-symbols-outlined text-[18px]">gavel</span>}
			>
				{resolve.isPending ? "Đang ghi nhận..." : "Kết luận và đóng yêu cầu"}
			</Button>
		</section>
	)
}
