"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import ImageViewerModal from "@/components/ui/ImageViewerModal"
import Skeleton from "@/components/ui/Skeleton"
import RefundActions from "./RefundActions"
import RefundEvidenceDialog from "./RefundEvidenceDialog"
import { useMe } from "@/hooks/api/useAccount"
import { useRefund } from "@/hooks/api/useRefunds"
import { REFUND_STATUS_VI } from "@/lib/dictionaries"
import { remainingLabel } from "@/lib/order-state"
import {
	refundCanAddEvidence,
	refundIsSettled,
	refundNextStep,
	refundSideOf,
	refundWaitingOn,
} from "@/lib/refund-actions"
import { CARD_SHELL } from "../../../orders/components/rowShell"
import type { Refund, RefundStatus, Resource } from "@/api/generated/types.gen"

/** Colour by outcome, not by name — a reader scans for "is this still open". */
const STATUS_STYLES: Record<RefundStatus, string> = {
	"awaiting-seller-review": "bg-tertiary-container text-on-tertiary-container",
	returning: "bg-primary/10 text-primary",
	returned: "bg-primary/10 text-primary",
	disputed: "bg-error-container text-on-error-container",
	accepted: "bg-secondary-container text-on-secondary-container",
	rejected: "bg-surface-container-high text-on-surface-variant",
	cancelled: "bg-surface-container-high text-on-surface-variant",
}

const CARD = `${CARD_SHELL} p-6 flex flex-col gap-4`

export default function RefundDetail({ id }: { id: string }) {
	const { data: me } = useMe()
	const { data: refund, isLoading, isError } = useRefund(id)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<Skeleton className="h-6 w-1/2 rounded-lg" />
				<Skeleton className="h-4 w-1/3 rounded-lg" />
				<Skeleton className="h-24 w-full rounded-2xl" />
			</div>
		)
	}

	if (isError || !refund) {
		return (
			<EmptyState
				icon="sync_problem"
				title="Không tải được yêu cầu này"
				description="Có thể đường truyền vừa gián đoạn, hoặc vụ việc này không còn nữa. Thử mở lại từ danh sách yêu cầu."
				action={{ label: "Về danh sách yêu cầu", href: "/account/refunds" }}
			/>
		)
	}

	const { isBuyer } = refundSideOf(refund, me?.id)
	const settled = refundIsSettled(refund.status)
	const left = remainingLabel(refund.deadline_at)

	return (
		<div className="flex flex-col gap-6">
			<div className={CARD}>
				<div className="flex items-start justify-between gap-3">
					<Link
						href={`/account/orders/${refund.order_id}`}
						className="text-title-md text-primary hover:underline"
					>
						Đơn {refund.order_id}
					</Link>
					<span
						className={`text-label-sm uppercase px-2 py-1 rounded-full shrink-0 ${STATUS_STYLES[refund.status]}`}
					>
						{REFUND_STATUS_VI[refund.status]}
					</span>
				</div>

				{/* Whose move it is, in words. The badge answers "where is this"; it does not
				    answer "is this waiting on me". */}
				<p
					className={`text-label-md ${settled ? "text-on-surface-variant" : "text-primary"}`}
				>
					{refundWaitingOn(refund.status, { isBuyer })}
				</p>

				{/* Missing the deadline is itself a move — the seller's silence hands the case
				    to staff, and the inspection window closing refunds the buyer. */}
				{left && !settled && (
					<p className="text-body-sm text-on-surface-variant">
						Hạn phản hồi: còn <span className="text-label-md text-on-surface">{left}</span>
					</p>
				)}
			</div>

			<div className={CARD}>
				<div>
					<h2 className="text-title-md text-on-surface mb-1">Lý do</h2>
					<p className="text-body-md text-on-surface whitespace-pre-wrap">
						{refund.reason}
					</p>
				</div>

				<RefundEvidence refund={refund} isBuyer={isBuyer} />
			</div>

			<NextStepCard refund={refund} isBuyer={isBuyer} settled={settled} />
		</div>
	)
}

/**
 * The buyer's evidence, and the way to add to it.
 *
 * The tiles used to be inert `div`s that drew nothing at all when a resource came back
 * without a signed URL — a heading over a row of blank squares, which is what the case
 * looked like to the person who filed it. They open full size now, and a resource with no
 * URL says so instead of rendering as an empty box.
 */
function RefundEvidence({ refund, isBuyer }: { refund: Refund; isBuyer: boolean }) {
	const [viewing, setViewing] = useState<number | null>(null)
	const [adding, setAdding] = useState(false)
	const canAdd = refundCanAddEvidence(refund, { isBuyer })
	const photos = refund.attachments
	// The viewer steps through the set, so it needs the usable links in the order shown —
	// a photo whose signed link failed is not one of them.
	const photoUrls = photos
		.map((photo) => photo.url)
		.filter((url): url is string => Boolean(url))

	// A seller looking at a case with no photos on it: nothing to show, and nothing they
	// can do here — their own evidence goes on the dispute ticket.
	if (photos.length === 0 && !canAdd) return null

	return (
		<div>
			<div className="flex items-center justify-between gap-3 mb-2">
				<h2 className="text-title-md text-on-surface">
					Bằng chứng
					{photos.length > 0 && (
						<span className="ml-1.5 text-body-sm text-on-surface-variant">
							{photos.length} ảnh
						</span>
					)}
				</h2>
				{canAdd && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setAdding(true)}
						icon={
							<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
								add_photo_alternate
							</span>
						}
					>
						Bổ sung ảnh
					</Button>
				)}
			</div>

			{photos.length === 0 ? (
				<p className="text-body-sm text-on-surface-variant">
					Chưa có ảnh nào. Ảnh bạn thêm là thứ ShopNexus xem khi phải ra quyết định.
				</p>
			) : (
				<div className="flex flex-wrap gap-2">
					{photos.map((photo) => (
						<EvidenceTile
							key={photo.id}
							photo={photo}
							onOpen={(url) => setViewing(photoUrls.indexOf(url))}
						/>
					))}
				</div>
			)}

			<ImageViewerModal
				images={photoUrls}
				index={viewing}
				onIndexChange={setViewing}
				onClose={() => setViewing(null)}
				altText="Ảnh bằng chứng của yêu cầu hoàn tiền"
			/>
			<RefundEvidenceDialog
				refundId={refund.id}
				open={adding}
				onClose={() => setAdding(false)}
			/>
		</div>
	)
}

function EvidenceTile({
	photo,
	onOpen,
}: {
	photo: Resource
	onOpen: (url: string) => void
}) {
	// `url` is a short-lived signed link, and empty means the store could not produce one.
	if (!photo.url) {
		return (
			<div
				className="w-24 h-24 rounded-lg border border-dashed border-outline-variant bg-surface-container flex flex-col items-center justify-center gap-1 text-on-surface-variant"
				title="Không tải được ảnh này"
			>
				<span className="material-symbols-outlined text-[20px]" aria-hidden="true">
					hide_image
				</span>
				<span className="text-label-xs text-center px-1">Không tải được</span>
			</div>
		)
	}

	return (
		<button
			type="button"
			onClick={() => onOpen(photo.url)}
			className="group relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant bg-surface-container cursor-zoom-in transition-colors hover:border-primary"
			aria-label="Xem ảnh bằng chứng"
		>
			<Image src={photo.url} alt="" fill className="object-cover" />
			<span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
				<span className="material-symbols-outlined text-[20px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
					zoom_in
				</span>
			</span>
		</button>
	)
}

/**
 * What happens next, and every way to act on it.
 *
 * This card used to hold the buttons alone, so the two states where a side has no move —
 * a disputed case, a seller reading a case staff took over — rendered a bordered box with
 * nothing in it. Those are exactly the states a reader most needs a sentence for: nothing
 * to press does not mean nothing is happening.
 */
function NextStepCard({
	refund,
	isBuyer,
	settled,
}: {
	refund: Refund
	isBuyer: boolean
	settled: boolean
}) {
	const disputed = refund.status === "disputed"

	return (
		<div className={CARD}>
			<div>
				<h2 className="text-title-md text-on-surface mb-1">
					{settled ? "Kết quả" : "Tiếp theo"}
				</h2>
				<p className="text-body-sm text-on-surface-variant">
					{refundNextStep(refund.status, { isBuyer })}
				</p>
			</div>

			<div className="flex flex-col gap-2">
				<RefundActions refund={refund} isBuyer={isBuyer} />

				{/* The dispute's thread is where the verdict is written, so a case staff hold
				    needs a way into it — for the seller who opened the ticket and for the buyer
				    who never did. */}
				{disputed && (
					<Link href="/inbox?tab=support" className="block">
						<Button variant="outline" fullWidth>
							Xem yêu cầu hỗ trợ
						</Button>
					</Link>
				)}

				<Link href={`/account/orders/${refund.order_id}`} className="block">
					<Button variant="ghost" fullWidth>
						Xem đơn hàng
					</Button>
				</Link>
			</div>
		</div>
	)
}
