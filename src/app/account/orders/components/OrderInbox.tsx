"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import OrderCard from "./OrderCard"
import CancelledCheckoutCard from "./CancelledCheckoutCard"
import PendingCheckoutCard from "./PendingCheckoutCard"
import RefundList from "../../refunds/components/RefundList"
import { useOrderInbox, type OrderTab } from "../hooks/useOrderInbox"
import { waitingSideOf } from "@/lib/order-waiting"

/** The order tabs plus the refund cases raised on this side of the sale. */
type InboxTab = OrderTab | "refunds"

const TABS: InboxTab[] = [
	"pending-payment",
	"awaiting-confirmation",
	"open",
	"completed",
	"cancelled",
	"refunds",
]

/** "Đang xử lý" is the default: it is the longest stretch of an order's life. */
const DEFAULT_TAB: InboxTab = "open"

/**
 * The unified order inbox that switches tabs by state.
 */
export default function OrderInbox({ role }: { role: "buyer" | "seller" }) {
	const searchParams = useSearchParams()
	const router = useRouter()

	// The tab lives in the URL so a flow can land on one: paying redirects to
	// `?tab=awaiting-confirmation`, and the back button walks tabs like any other history.
	const requested = searchParams.get("tab") as InboxTab | null
	const activeTab: InboxTab =
		requested && TABS.includes(requested) ? requested : DEFAULT_TAB

	const setActiveTab = useCallback(
		(tab: InboxTab) => {
			const next = new URLSearchParams(searchParams)
			if (tab === DEFAULT_TAB) next.delete("tab")
			else next.set("tab", tab)
			const query = next.toString()
			router.replace(query ? `?${query}` : "?", { scroll: false })
		},
		[router, searchParams],
	)

	// A refund is a state an order can be in, so it is a tab here rather than its own screen —
	// it is always read against the order it came from. The order queries keep their last tab
	// while refunds are showing; react-query holds that page, so switching back is instant.
	const showingRefunds = activeTab === "refunds"
	const orderTab: OrderTab = showingRefunds ? "open" : activeTab

	const {
		me,
		orders,
		pendingCheckouts,
		cancelledCheckouts,
		listingsById,
		isLoading,
		isEmpty,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useOrderInbox(role, orderTab)

	// Xếp theo vòng đời của một đơn hàng. Không có tab "Tất cả": mỗi tab là một trạng thái,
	// nên không tab nào trộn đơn đã xong với đơn đang chạy.
	const tabs: { id: InboxTab; label: string }[] = []
	if (role === "buyer") {
		tabs.push({ id: "pending-payment", label: "Chờ thanh toán" })
	}
	tabs.push(
		{ id: "awaiting-confirmation", label: "Chờ xác nhận" },
		{ id: "open", label: "Đang xử lý" },
		{ id: "completed", label: "Hoàn thành" },
		{ id: "cancelled", label: "Đã hủy" },
		{ id: "refunds", label: "Hoàn tiền" }
	)

	return (
		<div>
			<div className="flex overflow-x-auto border-b border-outline-variant mb-6 gap-6">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`pb-3 text-label-md transition-colors border-b-2 whitespace-nowrap ${
							activeTab === tab.id
								? "border-primary text-primary"
								: "border-transparent text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{showingRefunds ? (
				<RefundList role={role} />
			) : isLoading ? (
				<OrdersSkeleton />
			) : isEmpty ? (
				<InboxEmpty role={role} />
			) : (
				<div className="flex flex-col gap-3">
					{pendingCheckouts.length > 0 && (
						<section className="flex flex-col gap-3">
							{pendingCheckouts.map((checkout) => (
								<PendingCheckoutCard
									key={checkout.sessionId}
									checkout={checkout}
									listingsById={listingsById}
								/>
							))}
						</section>
					)}

					{cancelledCheckouts.length > 0 && (
						<section className="flex flex-col gap-3">
							{cancelledCheckouts.map((checkout) => (
								<CancelledCheckoutCard
									key={checkout.sessionId}
									checkout={checkout}
									listingsById={listingsById}
								/>
							))}
						</section>
					)}

					{orders.length > 0 && (
						<section className="flex flex-col gap-3">
							{orders.map((row) => (
								<OrderCard
									key={row.id}
									order={row}
									side={waitingSideOf(row, me)}
									me={me}
									listingsById={listingsById}
								/>
							))}
						</section>
					)}

					{hasNextPage && (
						<div className="flex justify-center pt-4">
							<Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
								{isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

function OrdersSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{[0, 1, 2].map((row) => (
				<div key={row} className="flex gap-4 p-4 rounded-2xl border border-outline-variant">
					<Skeleton className="w-16 h-16 rounded-xl shrink-0" />
					<div className="flex-1 flex flex-col gap-2">
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-1/2" />
						<Skeleton className="h-3 w-1/3" />
					</div>
				</div>
			))}
		</div>
	)
}

/**
 * The tab has nothing in it.
 *
 * Says which side is empty and where the next order comes from — a buyer's inbox fills
 * from the catalogue, a seller's from a listing someone can find.
 */
function InboxEmpty({ role }: { role: "buyer" | "seller" }) {
	return role === "buyer" ? (
		<EmptyState
			icon="receipt_long"
			title="Chưa có đơn mua nào"
			description="Đơn bạn đặt sẽ hiện ở đây cùng trạng thái giao hàng. Tìm một món bạn cần để mở đơn đầu tiên."
			action={{ label: "Khám phá sản phẩm", href: "/search" }}
		/>
	) : (
		<EmptyState
			icon="storefront"
			title="Chưa có đơn bán nào"
			description="Khi có người mua hàng của bạn, đơn sẽ hiện ở đây để bạn xác nhận và gửi đi. Đăng thêm sản phẩm để người mua tìm thấy bạn."
			action={{ label: "Đăng sản phẩm", href: "/sell" }}
		/>
	)
}
