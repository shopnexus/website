import AdminPage from "@/components/admin-config/AdminPage";
import OptionBoard from "./_components/OptionBoard";

export const metadata = {
  title: "Cổng thanh toán & vận chuyển | Vận hành",
};

export default function AdminOptionsPage() {
  return (
    <AdminPage
      width="md"
      eyebrow="Cấu hình"
      title="Cổng thanh toán & vận chuyển"
      consequence="Mã của mỗi dòng là vĩnh viễn vì đơn hàng và giao dịch đã xong đều lưu nó. Vì vậy chỉ có bật/tắt, không có xoá."
    >
      <OptionBoard />
    </AdminPage>
  );
}
