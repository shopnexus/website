import AdminPage from "@/components/admin-config/AdminPage";
import IdentityDesk from "./_components/IdentityDesk";

export const metadata = {
  title: "Xác minh danh tính | Vận hành",
};

export default function AdminIdentityDocumentsPage() {
  return (
    <AdminPage
      width="lg"
      eyebrow="Hàng đợi"
      title="Xác minh danh tính"
      consequence="Kết quả nhà cung cấp trả về không phải quyết định cuối cùng — ảnh giữ lại là để bạn tự đối chiếu. Nhớ ghi ngày hết hạn với loại giấy tờ có hạn, vì cổng chi tiền đọc ngày đó chứ không chỉ đọc trạng thái."
    >
      <IdentityDesk />
    </AdminPage>
  );
}
