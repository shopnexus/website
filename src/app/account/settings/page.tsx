import AccountPage from "@/components/account/AccountPage";
import SettingsForm from "./_components/SettingsForm";

export const metadata = {
  title: "Cài đặt bán hàng",
};

export default function SettingsPage() {
  return (
    <AccountPage
      title="Cài đặt bán hàng"
      description="Nơi lấy hàng, các đơn vị vận chuyển đang hoạt động và cách người mua trả tiền cho bạn."
      width="wide"
    >
      <SettingsForm />
    </AccountPage>
  );
}
