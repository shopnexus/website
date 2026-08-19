import AdminPage from "@/components/admin-config/AdminPage"
import ListingWorkbench from "./_components/ListingWorkbench"

export const metadata = {
	title: "Tin đăng chờ duyệt | Vận hành",
}

export default function AdminListingsPage() {
	return (
		<AdminPage
			width="full"
			eyebrow="Hàng đợi"
			title="Tin đăng chờ duyệt"
			consequence="Duyệt là xuất bản tin đăng lên sàn ngay lập tức. Gỡ là ẩn nó khỏi mọi kết quả tìm kiếm và trang cửa hàng, và người bán được thông báo lý do bạn ghi. Cũ nhất lên trước."
		>
			<ListingWorkbench />
		</AdminPage>
	)
}
