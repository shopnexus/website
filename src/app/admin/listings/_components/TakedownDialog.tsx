"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"

/**
 * The reason a listing came down, and whether the seller gets to read it.
 *
 * `notify_seller: false` keeps the wording out of the seller's view — the full reason is
 * in the audit trail either way — which is what an investigation in progress needs. A
 * reason is always required, because a takedown with none is one nobody can review later.
 */
export default function TakedownDialog({
	open,
	listingName,
	pending,
	onConfirm,
	onClose,
}: {
	open: boolean
	listingName: string
	pending: boolean
	onConfirm: (reason: string, notifySeller: boolean) => void
	onClose: () => void
}) {
	const [reason, setReason] = useState("")
	const [notifySeller, setNotifySeller] = useState(true)

	return (
		<Modal open={open} onClose={onClose} title="Gỡ tin đăng">
			<div className="flex flex-col gap-4">
				<p className="font-body-sm text-on-surface-variant">
					Gỡ <span className="font-semibold text-on-surface">{listingName}</span> khỏi sàn.
					Bản chỉnh sửa đang chờ duyệt (nếu có) cũng bị huỷ theo. Việc khoá tài khoản người
					bán là quyết định riêng.
				</p>

				<label className="flex flex-col gap-1.5">
					<span className="font-label-sm text-on-surface-variant">Lý do gỡ</span>
					<textarea
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						rows={3}
						autoFocus
						placeholder="Ví dụ: hàng giả, thuộc danh mục cấm kinh doanh..."
						className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all resize-y"
					/>
				</label>

				<label className="flex items-start gap-2.5 cursor-pointer">
					<input
						type="checkbox"
						checked={notifySeller}
						onChange={(event) => setNotifySeller(event.target.checked)}
						className="mt-0.5 accent-[var(--color-primary)]"
					/>
					<span className="flex flex-col">
						<span className="font-label-md text-on-surface">Cho người bán xem lý do</span>
						<span className="font-label-sm text-on-surface-variant">
							Bỏ chọn nếu đang trong quá trình điều tra. Lý do vẫn được lưu vào nhật ký.
						</span>
					</span>
				</label>

				<div className="flex gap-2 justify-end">
					<Button variant="outline" onClick={onClose} disabled={pending}>
						Huỷ
					</Button>
					<Button
						variant="error"
						disabled={pending || !reason.trim()}
						onClick={() => onConfirm(reason.trim(), notifySeller)}
					>
						{pending ? "Đang gỡ..." : "Gỡ tin đăng"}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
