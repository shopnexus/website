"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-hot-toast"
import ListingHistory from "@/components/listings/ListingHistory"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { LISTING_CONDITION_VI, LISTING_STATUS_VI, PRICE_MODE_VI } from "@/lib/dictionaries"
import { formatMoney } from "@/lib/money"
import { useApproveListing, useTakedownListing } from "@/hooks/api/useAdminModeration"
import type { ListingId } from "@/api/generated/types.gen"
import { useListingReview } from "../_hooks/useListingReview"
import { LISTING_STATUS_STYLES } from "../_lib/queue.logic"
import PendingEditDiff from "./PendingEditDiff"
import TakedownDialog from "./TakedownDialog"

/**
 * Everything the verdict rests on, in the order a moderator reads it: the pictures, what
 * the seller claims, and — when there is one — the edit they are asking to publish.
 *
 * Approving is one button for two different acts: a first publication and a held edit
 * being written through. The listing's own status is what says which, so the button says
 * so too rather than making the moderator infer it.
 */
export default function ListingReviewPanel({ listingId }: { listingId: ListingId }) {
	const { detail, isLoading, diff } = useListingReview(listingId)
	const [takingDown, setTakingDown] = useState(false)
	const approve = useApproveListing()
	const takedown = useTakedownListing()

	if (isLoading || !detail) {
		return (
			<div className="flex flex-col gap-3">
				<Skeleton className="h-48 w-full rounded-2xl" />
				<Skeleton className="h-24 w-full rounded-2xl" />
			</div>
		)
	}

	const awaitingDecision = detail.status === "pending" || detail.pending_edit !== null
	const approveLabel = detail.pending_edit ? "Duyệt chỉnh sửa" : "Duyệt và cho đăng bán"

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-2 mb-1">
						<Badge variant="surface" className={LISTING_STATUS_STYLES[detail.status]}>
							{LISTING_STATUS_VI[detail.status]}
						</Badge>
						<span className="font-label-sm text-on-surface-variant">
							{LISTING_CONDITION_VI[detail.condition]} · {PRICE_MODE_VI[detail.price_mode]}
						</span>
					</div>
					<h2 className="font-headline-sm font-bold text-on-surface break-words">
						{detail.name}
					</h2>
					<div className="font-label-sm text-on-surface-variant mt-1">
						{detail.seller.name} · {detail.category.name} ·{" "}
						{new Date(detail.created_at).toLocaleDateString("vi-VN")}
					</div>
				</div>
				<Link
					href={`/product/${detail.slug}`}
					target="_blank"
					className="inline-flex items-center gap-1 font-label-md text-primary hover:underline shrink-0"
				>
					Mở trang sản phẩm
					<span className="material-symbols-outlined text-[16px]">open_in_new</span>
				</Link>
			</div>

			{detail.images.length > 0 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{detail.images.map((image) => (
						<div
							key={image.id}
							className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-surface-container"
						>
							{image.url && (
								<Image
									src={image.url}
									alt=""
									fill
									className="object-cover"
									sizes="128px"
								/>
							)}
						</div>
					))}
				</div>
			)}

			<p className="font-body-sm text-on-surface whitespace-pre-wrap break-words">
				{detail.description}
			</p>

			<div className="flex flex-wrap gap-2">
				{detail.variants.map((variant) => (
					<span
						key={variant.id}
						className="rounded-xl border border-outline-variant px-3 py-1.5 font-label-sm text-on-surface-variant"
					>
						{formatMoney(variant.price, detail.currency)} · còn {variant.stock.available}
					</span>
				))}
			</div>

			{detail.takedown_reason && (
				<div className="rounded-xl bg-error-container text-on-error-container p-3 font-body-sm">
					Lý do đã gỡ: {detail.takedown_reason}
				</div>
			)}

			{diff.length > 0 && <PendingEditDiff rows={diff} />}

			<div className="flex flex-wrap gap-2 pt-1">
				<Button
					variant="primary"
					disabled={!awaitingDecision || approve.isPending}
					onClick={() =>
						approve.mutate(
							{ id: detail.id },
							{ onSuccess: () => toast.success("Tin đăng đã được duyệt.") },
						)
					}
					icon={<span className="material-symbols-outlined text-[18px]">check</span>}
				>
					{approve.isPending ? "Đang duyệt..." : approveLabel}
				</Button>

				<Button
					variant="error"
					disabled={detail.status === "hidden" || detail.status === "draft"}
					onClick={() => setTakingDown(true)}
					icon={<span className="material-symbols-outlined text-[18px]">block</span>}
				>
					Gỡ tin đăng
				</Button>

				{!awaitingDecision && (
					<span className="font-label-sm text-on-surface-variant self-center">
						Tin đăng này không còn chờ quyết định nào.
					</span>
				)}
			</div>

			{/* Under the verdict rather than above it: the decision rests on the pictures and
			    the words, and the trail is what a moderator checks when those alone do not
			    settle it — a seller who edits back to what was refused, an approval somebody
			    else already made. */}
			<ListingHistory listingId={detail.id} />

			<TakedownDialog
				open={takingDown}
				listingName={detail.name}
				pending={takedown.isPending}
				onConfirm={(reason, notifySeller) =>
					takedown.mutate(
						{ id: detail.id, body: { reason, notify_seller: notifySeller } },
						{
							onSuccess: () => {
								setTakingDown(false)
								toast.success("Đã gỡ tin đăng khỏi sàn.")
							},
						},
					)
				}
				onClose={() => setTakingDown(false)}
			/>
		</div>
	)
}
