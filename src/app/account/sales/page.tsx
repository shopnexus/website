import { Suspense } from "react"

import AccountPage from "@/components/account/AccountPage"
import OrderInbox from "../orders/components/OrderInbox"

export const metadata = { title: "Đơn bán" }

export default function SalesPage() {
	return (
		<AccountPage
			title="Đơn bán"
			description="Các đơn hàng người khác mua từ bạn, kèm những yêu cầu hoàn tiền trên đơn của bạn."
			width="wide"
		>
			{/* The inbox reads its tab from the query string, so it needs a boundary here. */}
			<Suspense fallback={null}>
				<OrderInbox role="seller" />
			</Suspense>
		</AccountPage>
	)
}
