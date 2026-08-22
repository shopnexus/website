import Image from "next/image"
import { CARD_SHELL } from "../../components/rowShell"
import type { Order } from "@/api/generated/types.gen"

/**
 * The unboxing photos the buyer filed when they signed for the parcel.
 *
 * They were on the order all along and shown nowhere. Both sides need them: it is what a
 * later refund is judged on, so a seller reading a claim should see the same frames the
 * buyer captured at the moment of unboxing.
 */
export default function OrderReceipt({ order }: { order: Order }) {
	const photos = order.receipt_attachments ?? []
	if (photos.length === 0) return null

	return (
		<div className={`${CARD_SHELL} p-5 md:p-6`}>
			<h2 className="text-title-md text-on-surface">Ảnh lúc nhận hàng</h2>
			<p className="text-body-sm text-on-surface-variant mt-1">
				Người mua chụp khi mở hàng. Một yêu cầu hoàn tiền sẽ được xét theo những ảnh này.
			</p>

			<ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
				{photos.map((photo, index) => (
					<li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border border-outline-variant bg-surface-container">
						{/* The signed url expires, so a stale one renders as an empty tile rather than
						    a broken image icon. */}
						<Image
							src={photo.url}
							alt={`Ảnh nhận hàng ${index + 1}`}
							fill
							sizes="(max-width: 640px) 50vw, 200px"
							className="object-cover"
						/>
					</li>
				))}
			</ul>
		</div>
	)
}
