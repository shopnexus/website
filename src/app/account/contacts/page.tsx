import AccountPage from "@/components/account/AccountPage";
import ContactManager from "./_components/ContactManager";

export const metadata = {
  title: "Thông tin liên lạc",
};

export default function ContactsPage() {
  return (
    <AccountPage
      title="Thông tin liên lạc"
      description="Quản lý các địa chỉ nhận hàng và lấy hàng của bạn."
    >
      <ContactManager />
    </AccountPage>
  );
}
