"use client"

import Image from "next/image"
import Link from "next/link"

import type { AccountSummary, ListingDetail } from "@/api/generated/types.gen"
import Button from "@/components/ui/Button"
import { formatMoney } from "@/lib/money"

import { listingPrice } from "../_lib/listing.logic"

/** The right rail: what is being traded, with whom, and the safety note. */
export default function ThreadInfoPanel({
	listing,
	contact,
	onNegotiate,
}: {
	listing: ListingDetail | undefined
	contact: AccountSummary | undefined
	onNegotiate: () => void
}) {
	return (
		<aside className="hidden lg:flex w-[280px] xl:w-[300px] 2xl:w-[320px] flex-col bg-surface-container-lowest border-l border-outline-variant/30 overflow-y-auto no-scrollbar shrink-0">
			<div className="p-4 md:p-5">
				<h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-4">
					Chi tiết sản phẩm
				</h3>

				{listing ? (
					<Link
						href={`/product/${listing.slug}`}
						className="rounded-xl overflow-hidden bg-surface-container-low mb-5 group block border border-outline-variant/20 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
					>
						<div className="aspect-[4/3] overflow-hidden relative bg-surface-container flex items-center justify-center">
							{listing.images[0]?.url ? (
								<Image
									src={listing.images[0].url}
									alt={listing.name}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							) : (
								<span className="material-symbols-outlined text-outline">image</span>
							)}
						</div>
						<div className="p-3">
							<span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors block mb-2 line-clamp-2">
								{listing.name}
							</span>
							<div className="flex justify-between items-center">
								<span className="text-primary font-bold text-base">
									{formatMoney(listingPrice(listing), listing.currency)}
								</span>
								<span className="text-[10px] text-on-surface-variant font-medium px-2 py-0.5 bg-surface-container-high rounded-full border border-outline-variant/20">
									{listing.price_mode === "negotiable" ? "Có thể thương lượng" : "Giá cố định"}
								</span>
							</div>
						</div>
					</Link>
				) : (
					<div className="p-4 text-center bg-surface-container-low rounded-xl border border-outline-variant/20 mb-5 text-on-surface-variant text-xs">
						Không có sản phẩm đính kèm.
					</div>
				)}

				<div className="space-y-5">
					<div>
						<h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
							Người giao dịch
						</h3>
						<Link
							href={contact ? `/shop/${contact.id}` : "#"}
							aria-disabled={!contact}
							className="flex items-center gap-2.5 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors"
						>
							<div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 bg-surface-container flex items-center justify-center font-bold">
								{contact?.avatar?.url ? (
									<Image src={contact.avatar.url} alt={contact.name} fill className="object-cover" />
								) : (
									(contact?.name.charAt(0) ?? "U")
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-bold text-on-surface text-xs truncate">
									{contact?.name || "Người dùng"}
								</p>
								<p className="text-[10px] text-on-surface-variant">Xem trang người bán</p>
							</div>
							<span className="material-symbols-outlined text-outline text-[16px]">
								chevron_right
							</span>
						</Link>
					</div>

					{/* Only where there is something to negotiate over — and only when the
					    listing invites it, since a fixed-price one refuses an offer. */}
					{listing?.price_mode === "negotiable" && (
						<Button
							variant="primary"
							fullWidth
							size="sm"
							className="rounded-lg shadow-sm font-bold py-2 text-xs"
							onClick={onNegotiate}
						>
							Đề nghị giá
						</Button>
					)}

					<div className="pt-5 border-t border-outline-variant/30">
						<h3 className="font-headline text-[11px] font-bold uppercase tracking-wider text-outline mb-3">
							Mẹo an toàn
						</h3>
						<div className="bg-primary-container/10 p-3.5 rounded-xl border border-primary/10">
							<p className="text-[11px] leading-relaxed text-on-surface-variant">
								ShopNexus khuyến nghị thanh toán qua hệ thống để được bảo vệ quyền lợi 100%. Không
								nên chuyển khoản trực tiếp trước khi nhận hàng.
							</p>
							<Link
								href="/help/safety"
								className="text-primary text-[11px] font-bold mt-1.5 inline-block hover:underline"
							>
								Xem thêm →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</aside>
	)
}
