"use client"

import { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import OrderCard from "./OrderCard"
import PendingCheckoutCard from "./PendingCheckoutCard"
import { useOrderInbox, type OrderTab } from "../hooks/useOrderInbox"
import { waitingSideOf } from "@/lib/order-waiting"

/**
 * The unified order inbox that switches tabs by state.
 */
export default function OrderInbox({ role }: { role: "buyer" | "seller" }) {
	const [activeTab, setActiveTab] = useState<OrderTab>("all")

	const {
		me,
		orders,
		pendingCheckouts,
		listingsById,
		isLoading,
		isEmpty,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useOrderInbox(role, activeTab)

	const tabs: { id: OrderTab; label: string }[] = [{ id: "all", label: "Tất cả" }]
	if (role === "buyer") {
		tabs.push({ id: "pending-payment", label: "Chờ thanh toán" })
	}
	tabs.push(
		{ id: "awaiting-confirmation", label: "Chờ xác nhận" },
		{ id: "open", label: "Đang xử lý" },
		{ id: "completed", label: "Hoàn thành" },
		{ id: "cancelled", label: "Đã hủy" }
	)

	return (
		<div className="max-w-[880px] mx-auto px-4 md:px-8 py-8 pb-24 min-h-screen">
			<header className="mb-6">
				<h1 className="font-headline-md text-3xl font-extrabold tracking-tight text-on-surface">
					{role === "buyer" ? "Đơn mua" : "Đơn bán"}
				</h1>
				<p className="text-body-md text-on-surface-variant mt-1">
					{role === "buyer"
						? "Các đơn hàng bạn đã đặt mua."
						: "Các đơn hàng người khác mua từ bạn."}
				</p>
			</header>

			<div className="flex overflow-x-auto border-b border-outline-variant mb-6 gap-6">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`pb-3 font-label-md transition-colors border-b-2 whitespace-nowrap ${
							activeTab === tab.id
								? "border-primary text-primary"
								: "border-transparent text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{isLoading ? (
				<OrdersSkeleton />
			) : isEmpty ? (
				<EmptyState />
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
				<div key={row} className="flex gap-4 p-4 rounded-xl border border-outline-variant/60">
					<Skeleton className="w-16 h-16 rounded-lg shrink-0" />
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

function EmptyState() {
	return (
		<div className="flex flex-col items-center text-center py-20 gap-3">
			<span className="material-symbols-outlined text-[48px] text-on-surface-variant">
				receipt_long
			</span>
			<h2 className="font-headline-sm font-bold text-on-surface">Chưa có đơn hàng nào</h2>
			<p className="text-body-sm text-on-surface-variant max-w-sm">
				Chưa có giao dịch nào xuất hiện ở đây.
			</p>
			<Link href="/search" className="mt-2">
				<Button variant="primary">Khám phá sản phẩm</Button>
			</Link>
		</div>
	)
}
