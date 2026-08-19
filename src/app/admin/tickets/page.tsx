import AdminPage from "@/components/admin-config/AdminPage"
import TicketQueue from "./_components/TicketQueue"

export const metadata = {
	title: "Yêu cầu hỗ trợ | Vận hành",
}

export default function AdminTicketsPage() {
	return (
		<AdminPage
			width="lg"
			eyebrow="Hàng đợi"
			title="Yêu cầu hỗ trợ"
			consequence="Nhận một yêu cầu là lấy nó khỏi hàng đợi của người khác, và kết luận bạn ghi được gửi thẳng cho người đã mở yêu cầu. Xếp theo thời gian chờ, cũ nhất lên trước."
		>
			<TicketQueue />
		</AdminPage>
	)
}
