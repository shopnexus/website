import AccountPage from "@/components/account/AccountPage";
import FollowedShopList from "./_components/FollowedShopList";

export const metadata = { title: "Đang theo dõi" };

export default function FollowingPage() {
  return (
    <AccountPage
      title="Đang theo dõi"
      description="Các gian hàng bạn đang theo dõi, cùng lối tắt sang trang của họ."
      width="wide"
    >
      <FollowedShopList />
    </AccountPage>
  );
}
