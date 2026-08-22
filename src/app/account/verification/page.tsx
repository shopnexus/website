import AccountPage from "@/components/account/AccountPage";
import VerificationPanel from "./_components/VerificationPanel";

export const metadata = { title: "Xác minh danh tính (KYC)" };

export default function VerificationPage() {
  return (
    <AccountPage
      title="Xác minh danh tính (KYC)"
      description="Xác minh danh tính để mở khóa việc đăng bán và rút tiền về ngân hàng."
    >
      <VerificationPanel />
    </AccountPage>
  );
}
