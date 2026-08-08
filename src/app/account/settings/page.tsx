import SettingsForm from "./_components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-background tracking-tight mb-2">
            Cài đặt bán hàng
          </h1>
          <p className="text-on-surface-variant font-body-md max-w-xl">
            Nơi lấy hàng, các đơn vị vận chuyển đang hoạt động và cách người mua trả tiền cho bạn.
          </p>
        </div>
      </header>

      <SettingsForm />
    </div>
  );
}
