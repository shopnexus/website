import AdminPage from "@/components/admin-config/AdminPage";
import WithdrawalsDesk from "./_components/WithdrawalsDesk";

export const metadata = {
  title: "Yêu cầu rút tiền | Vận hành",
};

export default function AdminWithdrawalsPage() {
  return (
    <AdminPage
      width="lg"
      eyebrow="Hàng đợi"
      title="Yêu cầu rút tiền"
      consequence="Tiền đã bị trừ khỏi số dư khả dụng ngay khi người bán gửi yêu cầu. Duyệt là ghi nhận khoản đã chuyển ra ngân hàng; từ chối là hoàn khoản đó về ví ngay lập tức."
    >
      <WithdrawalsDesk />
    </AdminPage>
  );
}
