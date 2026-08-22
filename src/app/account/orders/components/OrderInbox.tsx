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
import type { Order } from "@/api/generated/types.gen"

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

/** One name per tab, so the empty state can point at one by name rather than "phía trên". */
const TAB_LABEL: Record<InboxTab, string> = {
	"pending-payment": "Chờ thanh toán",
	"awaiting-confirmation": "Chờ xác nhận",
	open: "Đang xử lý",
	completed: "Hoàn thành",
	cancelled: "Đã hủy",
	refunds: "Hoàn tiền",
}

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
		latestOrder,
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
	//
	// "Chờ thanh toán" is the buyer's alone: a seller never sees a checkout that has not been
	// paid for, because no order exists until the payment webhook writes one.
	const tabs: InboxTab[] = TABS.filter((tab) => role === "buyer" || tab !== "pending-payment")

	return (
		<div>
			<div className="flex overflow-x-auto border-b border-outline-variant mb-6 gap-6">
				{tabs.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`pb-3 text-label-md transition-colors border-b-2 whitespace-nowrap ${
							activeTab === tab
								? "border-primary text-primary"
								: "border-transparent text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{TAB_LABEL[tab]}
					</button>
				))}
			</div>

			{showingRefunds ? (
				<RefundList role={role} />
			) : isLoading ? (
				<OrdersSkeleton />
			) : isEmpty ? (
				<InboxEmpty
					role={role}
					tab={activeTab}
					latestOrder={latestOrder}
					onGoToTab={setActiveTab}
				/>
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

/** What each tab is missing, in its own words. */
const NOTHING_IN_TAB: Record<InboxTab, string> = {
	"pending-payment": "Không có đơn nào chờ thanh toán",
	"awaiting-confirmation": "Không có đơn nào chờ xác nhận",
	open: "Không có đơn nào đang xử lý",
	completed: "Chưa có đơn nào hoàn thành",
	cancelled: "Không có đơn nào đã huỷ",
	refunds: "Không có yêu cầu hoàn tiền nào",
}

/**
 * The tab has nothing in it — which is two different things, and it used to say only one.
 *
 * "Đang xử lý" is the tab this page opens on, and an account with eleven orders in other
 * states opened it to be told "Chưa có đơn mua nào. Tìm một món bạn cần để mở đơn đầu tiên."
 * The page was telling somebody who buys here regularly that they have never bought anything,
 * and pointing them at the catalogue to fix it.
 *
 * So: the tab's own sentence when there are orders elsewhere, and the "you have not started
 * yet" invitation only when that is true. And rather than "look in one of the other tabs" —
 * which is advice, not an answer — the newest order names the tab it is in and offers to go
 * there. That costs nothing: it is the same single row the question was answered with.
 *
 * `latestOrder` is undefined while in flight, and neither sentence is asserted until it lands.
 */
function InboxEmpty({
	role,
	tab,
	latestOrder,
	onGoToTab,
}: {
	role: "buyer" | "seller"
	tab: InboxTab
	latestOrder: Order | null | undefined
	onGoToTab: (tab: InboxTab) => void
}) {
	if (latestOrder) {
		// The newest order's state *is* a tab id — see OrderTab — and it cannot be the tab being
		// looked at, or that tab would not be empty.
		const where = latestOrder.state as InboxTab
		return (
			<EmptyState
				icon="filter_list_off"
				title={NOTHING_IN_TAB[tab]}
				description={`Đơn gần đây nhất của bạn đang ở mục “${TAB_LABEL[where]}”.`}
				action={
					<Button variant="outline" onClick={() => onGoToTab(where)}>
						Xem mục {TAB_LABEL[where]}
					</Button>
				}
			/>
		)
	}

	// Nothing anywhere, or not known yet. The invitation is the same either way, and while the
	// answer is in flight it is the safer of the two to show: a brand new account is the only
	// one that reaches this screen with nothing loaded.
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
