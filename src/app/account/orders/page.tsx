import { Suspense } from "react"

import AccountPage from "@/components/account/AccountPage"
import OrderInbox from "./components/OrderInbox"

export const metadata = { title: "Đơn mua" }

export default function OrdersPage() {
	return (
		<AccountPage
			title="Đơn mua"
			description="Các đơn hàng bạn đã đặt mua, kèm những yêu cầu hoàn tiền bạn đã mở."
			width="wide"
		>
			{/* The inbox reads its tab from the query string, so it needs a boundary here. */}
			<Suspense fallback={null}>
				<OrderInbox role="buyer" />
			</Suspense>
		</AccountPage>
	)
}
