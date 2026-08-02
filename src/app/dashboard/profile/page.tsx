import ProfileForm from "./_components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-md font-bold text-on-surface mb-2">Hồ sơ cá nhân</h1>
        <p className="font-body-sm text-on-surface-variant">Cập nhật thông tin công khai và thiết lập hiển thị của bạn trên ShopNexus.</p>
      </div>

      <ProfileForm />
    </div>
  );
}
