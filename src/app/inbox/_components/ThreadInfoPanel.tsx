"use client"

import Image from "next/image"
import Link from "next/link"

import type {
	AccountId,
	AccountSummary,
	ListingDetail,
	Offer,
	PublicAccount,
	Reputation,
	ReputationRole,
} from "@/api/generated/types.gen"
import Button from "@/components/ui/Button"
import StarRating from "@/components/ui/StarRating"
import { usePublicAccount, useReputation } from "@/hooks/api/useShop"
import { LISTING_CONDITION_VI } from "@/lib/dictionaries"
import { formatMoney } from "@/lib/money"
import { remainingLabel } from "@/lib/order-state"

import { offerForListing } from "../_lib/deal.logic"
import { listingAvailable, listingPlace, listingPrice } from "../_lib/listing.logic"
import InfoRail from "./InfoRail"

interface ThreadInfoPanelProps {
	listing: ListingDetail | undefined
	contact: AccountSummary | undefined
	/** Which reputation the other side is being judged on here — see `useInbox`. */
	role: ReputationRole
	deals: readonly Offer[] | undefined
	accountId: AccountId | undefined
	onNegotiate: () => void
	/** Open state of the sheet this becomes below `lg`, where the column does not fit. */
	isOpen: boolean
	onClose: () => void
}

const SECTION = "text-label-xs uppercase text-outline"

/** "Tham gia 03/2025" — the month is the trust signal; the day is noise. */
function memberSince(iso: string): string {
	return new Date(iso).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })
}

export default function ThreadInfoPanel({
	listing,
	contact,
	role,
	deals,
	accountId,
	onNegotiate,
	isOpen,
	onClose,
}: ThreadInfoPanelProps) {
	// Read once here rather than inside the body, which is rendered for both the column and
	// the sheet.
	const { data: account } = usePublicAccount(contact?.id)
	const { data: reputation } = useReputation(contact?.id, role)

	const body = (
		<InfoBody
			listing={listing}
			contact={contact}
			account={account}
			reputation={reputation}
			deals={deals}
			accountId={accountId}
			onNegotiate={onNegotiate}
		/>
	)

	return (
		<InfoRail title="Thông tin giao dịch" isOpen={isOpen} onClose={onClose}>
			{body}
		</InfoRail>
	)
}

/**
 * What is being traded, at what price, with whom — and the safety note.
 *
 * Everything here is stated rather than actionable. The offer's buttons live on its card
 * in the thread, which is the only place an answer can be written; a second set here would
 * be a second definition of what "accept" means.
 */
function InfoBody({
	listing,
	contact,
	account,
	reputation,
	deals,
	accountId,
	onNegotiate,
}: {
	listing: ListingDetail | undefined
	contact: AccountSummary | undefined
	account: PublicAccount | undefined
	reputation: Reputation | undefined
	deals: readonly Offer[] | undefined
	accountId: AccountId | undefined
	onNegotiate: () => void
}) {
	const offer = offerForListing(deals, listing?.id)
	const left = offer ? remainingLabel(offer.expires_at) : null
	const place = listing ? listingPlace(listing) : null
	const available = listing ? listingAvailable(listing) : 0
	const waitingOnMe = offer ? offer.author_id !== accountId : false

	return (
		<div className="p-4 md:p-5 space-y-5">
			{/* The standing negotiation, above the item it is about: it is the thing with a
			    clock on it. */}
			{offer && (
				<section className="rounded-xl border border-tertiary/25 bg-tertiary/5 p-3.5">
					<div className="flex items-center justify-between gap-2 mb-2">
						<h3 className={SECTION}>
							{offer.status === "accepted" ? "Đã chốt giá" : "Đề nghị giá"}
						</h3>
						{left && (
							<span className="text-label-xs text-tertiary tabular-nums">
								{left === "đã quá hạn" ? "Đã quá hạn" : `Còn ${left}`}
							</span>
						)}
					</div>

					<p className="text-price-lg text-tertiary">
						{formatMoney(offer.total, offer.currency)}
					</p>
					{offer.quantity > 1 && (
						<p className="mt-1 text-label-xs text-on-surface-variant tabular-nums">
							cho {offer.quantity} sản phẩm
						</p>
					)}

					{offer.reason && (
						<p className="mt-2.5 whitespace-pre-wrap break-words border-l-2 border-tertiary/30 pl-2.5 text-body-xs italic text-on-surface-variant">
							{offer.reason}
						</p>
					)}

					<p className="mt-2.5 text-label-sm text-on-surface">
						{offer.status === "accepted"
							? "Hai bên đã thống nhất — thanh toán để tạo đơn."
							: waitingOnMe
								? "Đang chờ bạn trả lời."
								: `Đang chờ ${contact?.name ?? "bên kia"} trả lời.`}
					</p>
					<p className="mt-1 text-label-xs text-on-surface-variant">
						Trả lời ngay trên thẻ đề nghị trong hội thoại.
					</p>
				</section>
			)}

			<section>
				<h3 className={`${SECTION} mb-3 block`}>Sản phẩm</h3>

				{listing ? (
					<>
						<Link
							href={`/product/${listing.slug}`}
							className="rounded-xl overflow-hidden bg-surface-container-low group block border border-outline-variant shadow-sm transition-all hover:shadow-md hover:border-primary/30"
						>
							<div className="aspect-[4/3] overflow-hidden relative bg-surface-container flex items-center justify-center">
								{listing.images[0]?.url ? (
									<Image
										src={listing.images[0].url}
										alt={listing.name}
										fill
										sizes="320px"
										className="object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
									/>
								) : (
									<span className="material-symbols-outlined text-outline">image</span>
								)}
							</div>
							<div className="p-3">
								<span className="mb-2 line-clamp-2 block text-title-sm text-on-surface transition-colors group-hover:text-primary">
									{listing.name}
								</span>
								<div className="flex justify-between items-center gap-2">
									<span className="text-price-md text-on-surface">
										{formatMoney(listingPrice(listing), listing.currency)}
									</span>
									<span className="shrink-0 rounded-full border border-outline-variant bg-surface-container-high px-2 py-0.5 text-label-xs text-on-surface-variant">
										{listing.price_mode === "negotiable" ? "Thương lượng được" : "Giá cố định"}
									</span>
								</div>
							</div>
						</Link>

						<dl className="mt-3 space-y-1.5 text-body-xs">
							<Fact label="Tình trạng" value={LISTING_CONDITION_VI[listing.condition]} />
							{place && <Fact label="Nơi giao" value={place} />}
							<Fact
								label="Còn lại"
								value={available > 0 ? `${available} sản phẩm` : "Hết hàng"}
								warn={available === 0}
							/>
							<Fact label="Đã bán" value={`${listing.sold}`} />
							{listing.review_count > 0 && (
								<div className="flex items-baseline justify-between gap-2">
									<dt className="text-on-surface-variant">Đánh giá</dt>
									<dd className="flex items-center gap-1.5">
										<StarRating rating={listing.rating} size={12} />
										<span className="text-label-sm text-on-surface tabular-nums">
											{listing.rating.toFixed(1)} ({listing.review_count})
										</span>
									</dd>
								</div>
							)}
							{listing.favorite_count > 0 && (
								<Fact label="Đã lưu" value={`${listing.favorite_count} người`} />
							)}
						</dl>
					</>
				) : (
					<p className="rounded-xl border border-outline-variant bg-surface-container-low p-4 text-center text-body-xs text-on-surface-variant">
						Hội thoại này chưa gắn sản phẩm nào. Mở một sản phẩm và nhấn nhắn tin để gắn nó vào đây.
					</p>
				)}
			</section>

			<section>
				<h3 className={`${SECTION} mb-3 block`}>Người giao dịch</h3>

				<Link
					href={contact ? `/shop/${contact.id}` : "#"}
					aria-disabled={!contact}
					className="block bg-surface-container-low p-3 rounded-xl border border-outline-variant hover:border-primary/30 transition-colors"
				>
					<div className="flex items-center gap-2.5">
						<div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container text-title-sm">
							{contact?.avatar?.url ? (
								<Image src={contact.avatar.url} alt="" fill className="object-cover" sizes="40px" />
							) : (
								(contact?.name.charAt(0) ?? "U")
							)}
						</div>
						<div className="min-w-0 flex-1">
							<p className="flex items-center gap-1 truncate text-label-md text-on-surface">
								{contact?.name || "Người dùng"}
								{account?.identity_verified && (
									<span
										className="material-symbols-outlined text-primary text-[14px] shrink-0"
										title="Đã xác minh danh tính"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										verified
									</span>
								)}
							</p>
							<p className="text-label-xs text-on-surface-variant">
								{account ? `Tham gia ${memberSince(account.created_at)}` : "Xem trang cá nhân"}
							</p>
						</div>
						<span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
					</div>

					{/* The numbers that decide whether to send money to a stranger. Absent until
					    the reputation read lands, and absent for an account with no history —
					    a row of zeroes reads as a bad record rather than a new one. */}
					{reputation && (reputation.rating_count > 0 || reputation.completed_orders > 0) && (
						<div className="mt-3 flex items-center justify-between gap-2 border-t border-outline-variant pt-3 text-body-xs">
							{reputation.rating_count > 0 ? (
								<span className="flex items-center gap-1.5">
									<StarRating rating={reputation.rating_average} size={12} />
									<span className="text-label-sm text-on-surface tabular-nums">
										{reputation.rating_average.toFixed(1)}
									</span>
									<span className="text-on-surface-variant tabular-nums">
										({reputation.rating_count})
									</span>
								</span>
							) : (
								<span className="text-on-surface-variant">Chưa có đánh giá</span>
							)}
							<span className="text-on-surface-variant tabular-nums">
								{reputation.completed_orders} đơn hoàn tất
							</span>
						</div>
					)}
				</Link>
			</section>

			{/* Only where there is something to negotiate over — and only when the listing
			    invites it, since a fixed-price one refuses an offer. While an offer stands,
			    the answer to it is the card in the thread. */}
			{listing?.price_mode === "negotiable" && !offer && (
				<Button
					variant="primary"
					fullWidth
					size="sm"
					className="rounded-lg py-2 text-label-md shadow-sm"
					onClick={onNegotiate}
				>
					Đề nghị giá
				</Button>
			)}

			<section className="pt-4 border-t border-outline-variant">
				<h3 className={`${SECTION} mb-2.5 block`}>Mẹo an toàn</h3>
				<div className="bg-primary-container/10 p-3 rounded-xl border border-primary/10">
					<p className="text-body-xs text-on-surface-variant">
						Thanh toán qua ShopNexus để tiền được giữ lại tới khi bạn nhận hàng. Chuyển khoản trực
						tiếp không được bảo vệ.
					</p>
					<Link
						href="/help/safety"
						className="mt-1.5 inline-block text-label-sm text-primary hover:underline"
					>
						Xem thêm →
					</Link>
				</div>
			</section>
		</div>
	)
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
	return (
		<div className="flex items-baseline justify-between gap-2">
			<dt className="text-on-surface-variant">{label}</dt>
			<dd className={`text-label-sm tabular-nums ${warn ? "text-error" : "text-on-surface"}`}>
				{value}
			</dd>
		</div>
	)
}
