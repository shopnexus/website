import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .grainy-bg {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.03;
        }
      `}} />
      <main className="min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 relative overflow-hidden bg-background">
        {/* Background Decor */}
        <div className="absolute inset-0 grainy-bg pointer-events-none"></div>
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-secondary-container/30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full text-center z-10">
          {/* 404 Hero Section */}
          <div className="relative mb-12 flex justify-center">
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[20rem] font-headline font-extrabold text-surface-container-highest tracking-tighter select-none leading-none opacity-50">
              404
            </h1>
            {/* Character Visual */}
            <div className="relative z-10 animate-float">
              <div className="relative p-8 bg-surface-container-lowest rounded-full shadow-2xl border border-outline-variant/30">
                <Image 
                  alt="Nexus lost character logo" 
                  className="w-48 md:w-64 grayscale opacity-90 transition-transform duration-500 hover:scale-110" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgZcTVwsHHX-roIz3XB5G57zrDxHoPEA-UiGO2AlgPSk7GFIu71ejllsUquDMwGpQ8j3Qbfwr3-A0tyiQoNTbA4x8RGpgK-L-zKmuatmmABat_sRnxIS5943FLDME6IGg1nfwcxGbMEP6maVBbld70Kcus6jL_Vk2JzId8hp6EqTZVPs4V07NNcWWegD0enVljn9nwwBLtOdG6mDv2edPRRv-m0xNBlk7xW7ldiWWeXHuw76wi72NfJA2cLTGlh9HBFA"
                  width={256}
                  height={256}
                />
                {/* Floating Tags (The missing "treasures") */}
                <div className="absolute -top-4 -right-8 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-label-sm font-bold shadow-sm rotate-12">Mất tích!</div>
                <div className="absolute bottom-4 -left-12 bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-full text-label-sm font-bold shadow-sm -rotate-6">Không có ở đây?</div>
              </div>
            </div>
          </div>
          
          {/* Messaging */}
          <div className="space-y-4 mb-12">
            <h2 className="font-headline font-bold text-3xl md:text-5xl text-on-surface tracking-tight">
              Rất tiếc! Trang bạn tìm không tồn tại.
            </h2>
            <p className="font-body text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Ngay cả những nhà thám hiểm dày dạn kinh nghiệm nhất đôi khi cũng lạc đường. Trang bạn đang tìm kiếm có thể đã bị di chuyển, hoặc chưa từng tồn tại.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link className="group flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold text-lg hover:bg-primary-container transition-all duration-300 shadow-lg shadow-primary/20" href="/">
              <span className="material-symbols-outlined">home</span>
              Về trang chủ
            </Link>
            <div className="flex items-center gap-4">
              <Link className="flex items-center gap-2 text-primary font-headline font-bold px-6 py-4 hover:bg-secondary-container/20 rounded-xl transition-all duration-200" href="/search">
                <span className="material-symbols-outlined">search</span>
                Tìm sản phẩm
              </Link>
              <Link className="flex items-center gap-2 text-primary font-headline font-bold px-6 py-4 hover:bg-secondary-container/20 rounded-xl transition-all duration-200" href="/help">
                <span className="material-symbols-outlined">help_center</span>
                Trung tâm trợ giúp
              </Link>
            </div>
          </div>
          
          {/* Bento Hint Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-80">
            <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary mb-3">inventory_2</span>
              <h3 className="font-headline font-bold text-label-md mb-2">Xem kho lưu trữ</h3>
              <p className="text-body-sm text-on-surface-variant">Bạn đang tìm kiếm sản phẩm mùa cũ? Nó có thể được cất giữ trong kho lưu trữ của chúng tôi.</p>
            </div>
            <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary mb-3">explore</span>
              <h3 className="font-headline font-bold text-label-md mb-2">Khám phá bộ sưu tập</h3>
              <p className="text-body-sm text-on-surface-variant">Sản phẩm mới vừa cập bến sáng nay. Khám phá những xu hướng mới nhất tại ShopNexus.</p>
            </div>
            <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/50 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary mb-3">support_agent</span>
              <h3 className="font-headline font-bold text-label-md mb-2">Sự cố kỹ thuật?</h3>
              <p className="text-body-sm text-on-surface-variant">Nếu bạn cho rằng đây là lỗi hệ thống, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
