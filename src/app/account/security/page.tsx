import AccountPage from "@/components/account/AccountPage";
import AccountSettingsTabs from "@/components/account/AccountSettingsTabs";
import IdentifiersForm from "./_components/IdentifiersForm";
import PasswordForm from "./_components/PasswordForm";
import LinkedProviders from "./_components/LinkedProviders";
import PushDevices from "./_components/PushDevices";

export const metadata = {
  title: "Bảo mật & Định danh",
};

export default function SecurityPage() {
  return (
    <AccountPage
      title="Bảo mật & Định danh"
      description="Quản lý cách bạn đăng nhập và bảo vệ tài khoản của mình."
    >
      <AccountSettingsTabs />
      <div className="space-y-6">
        <IdentifiersForm />
        <PasswordForm />
        <LinkedProviders />
        <PushDevices />
      </div>
    </AccountPage>
  );
}
