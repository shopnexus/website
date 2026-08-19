import AdminPage from "@/components/admin-config/AdminPage";
import SessionLedger from "./_components/SessionLedger";

export const metadata = {
  title: "Phiên thanh toán | Vận hành",
};

export default function AdminPaymentSessionsPage() {
  return (
    <AdminPage
      width="full"
      eyebrow="Đối soát"
      title="Phiên thanh toán"
      consequence="Trang này chỉ đọc. Chỉ webhook của cổng thanh toán mới quyết định một phiên đã thu được tiền hay chưa — con số ở đây là kết quả đó, để đối chiếu với số cổng báo về."
    >
      <SessionLedger />
    </AdminPage>
  );
}
