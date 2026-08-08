import OrderInbox from "./components/OrderInbox"

export const metadata = { title: "Đơn mua | ShopNexus" }

export default function OrdersPage() {
	return <OrderInbox role="buyer" />
}
