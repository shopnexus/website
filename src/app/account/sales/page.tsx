import OrderInbox from "../orders/components/OrderInbox"

export const metadata = { title: "Đơn bán" }

export default function SalesPage() {
	return <OrderInbox role="seller" />
}
