import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface-container-lowest font-body">
      {/* Left Side: Branding / Image */}
      <div className="hidden md:flex w-1/2 relative flex-col justify-between bg-primary p-12 lg:p-16 text-on-primary overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5qIqlhDoZ2wjN18demXNu7wgtLEc_bzHfUbfW88M9p7MVftnwUufmLTQwYFS-0SdimMzZfvL2MGJK0ktmhmK5qlNzZ5DH2NpXH1g4-EL-MJsycCvQYs2PQnS1pa8I9Jdde_iRkhh5S7wdQIyjmuNtHospjv4vc8YmrVssjchqdIFl2QImC9s_VU5vXhWeje17IfVHxeJBIi8jIh9u4WUdbBRZUyMEYM_5SN8OdF62I0HPZ4VWXP8O')" }}
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="font-headline font-extrabold text-2xl tracking-tight text-white">ShopNexus</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-lg mt-auto mb-24">
          <h1 className="font-headline text-[3.5rem] leading-[1.1] font-extrabold text-white mb-6 tracking-tight">
            Nền tảng của<br/>thương mại<br/>thế hệ mới.
          </h1>
          <p className="font-body text-primary-fixed text-lg font-medium">
            Tạo tài khoản để bắt đầu xây dựng cửa hàng của bạn, khám phá các sản phẩm độc đáo và kết nối với cộng đồng.
          </p>
        </div>

        {/* Trust Indicator */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-variant overflow-hidden flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Curator" className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-variant overflow-hidden flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="Curator" className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-variant overflow-hidden flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn" alt="Curator" className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="font-label text-sm font-bold tracking-wider uppercase text-white">
            ĐƯỢC TIN DÙNG BỞI HƠN 20K NGƯỜI
          </span>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-24">
          <div className="w-full max-w-md mx-auto">
            <h2 className="font-headline text-[2.5rem] leading-tight font-extrabold text-on-surface mb-8">Tạo tài khoản</h2>
            <RegisterForm />
          </div>
          
          {/* Footer */}
          <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/30">
            <p className="text-[11px] text-outline font-medium">© 2024 ShopNexus. Thương mại vì con người.</p>
            <div className="flex gap-6 text-[11px] text-outline font-medium">
              <Link href="/privacy" className="hover:text-on-surface transition-colors">Bảo mật</Link>
              <Link href="/terms" className="hover:text-on-surface transition-colors">Điều khoản</Link>
              <Link href="/cookies" className="hover:text-on-surface transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
