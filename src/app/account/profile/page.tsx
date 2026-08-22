import AccountPage from "@/components/account/AccountPage";
import AccountSettingsTabs from "@/components/account/AccountSettingsTabs";
import ProfileCompletion from "@/components/account/ProfileCompletion";
import ProfileForm from "./_components/ProfileForm";

export const metadata = {
  title: "Hồ sơ cá nhân",
};

export default function ProfilePage() {
  return (
    <AccountPage
      title="Hồ sơ cá nhân"
      description="Cập nhật thông tin công khai và thiết lập hiển thị của bạn trên ShopNexus."
    >
      <AccountSettingsTabs />
      {/* Above the form: these are the doors still shut, and two of them are on other
          pages. Disappears once nothing is missing. */}
      <ProfileCompletion />
      <ProfileForm />
    </AccountPage>
  );
}
