import AccountPage from "@/components/account/AccountPage";
import WalletWorkspace from "./_components/WalletWorkspace";

export const metadata = { title: "Ví của tôi" };

export default function WalletPage() {
  return (
    <AccountPage
      title="Ví của tôi"
      description="Tiền bán hàng, các khoản đang tạm giữ và mọi yêu cầu rút về ngân hàng."
      width="wide"
    >
      <WalletWorkspace />
    </AccountPage>
  );
}
