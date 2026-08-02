import IdentifiersForm from "./_components/IdentifiersForm";
import PasswordForm from "./_components/PasswordForm";
import LinkedProviders from "./_components/LinkedProviders";
import PushDevices from "./_components/PushDevices";

export default function SecurityPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-headline-md font-bold text-on-surface mb-2">Bảo mật & Định danh</h1>
        <p className="font-body-sm text-on-surface-variant">Quản lý cách bạn đăng nhập và bảo vệ tài khoản của mình.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <IdentifiersForm />
        <PasswordForm />
        <LinkedProviders />
        <PushDevices />
      </div>
    </div>
  );
}
