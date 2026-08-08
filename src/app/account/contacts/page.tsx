import ContactManager from "./_components/ContactManager";

export const metadata = {
  title: "Sổ địa chỉ | Shopnexus",
};

export default function ContactsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display-sm text-[32px] font-bold text-on-surface mb-2">Sổ địa chỉ</h1>
        <p className="font-body-md text-on-surface-variant">Quản lý các địa chỉ nhận hàng và lấy hàng của bạn</p>
      </div>

      <ContactManager />
    </div>
  );
}
