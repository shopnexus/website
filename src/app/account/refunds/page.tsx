import { redirect } from "next/navigation"

// Refunds moved into Đơn mua / Đơn bán, where a case is read against the order it came from.
// The route stays so older links keep working; the detail page at /account/refunds/[id] is
// unaffected and is still where a case is opened.
export default function RefundsPage() {
	redirect("/account/orders?tab=refunds")
}
