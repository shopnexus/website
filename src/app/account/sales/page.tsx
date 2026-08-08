import OrderInbox from "../orders/components/OrderInbox"

export const metadata = { title: "Đơn bán | ShopNexus" }

export default function SalesPage() {
	return <OrderInbox role="seller" />
}
