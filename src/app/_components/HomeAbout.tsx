export default function HomeAbout() {
  return (
    <section className="mt-24 pt-16 border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mx-auto md:mx-0">
            <span className="material-symbols-outlined text-primary">handshake</span>
          </div>
          <h3 className="font-headline font-bold text-headline-sm text-on-surface">Giao dịch tin cậy</h3>
          <p className="text-body-md text-on-surface-variant">
            ShopNexus bảo vệ quyền lợi người mua và người bán với hệ thống đánh giá minh bạch và quy trình thanh toán an toàn.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mx-auto md:mx-0">
            <span className="material-symbols-outlined text-primary">eco</span>
          </div>
          <h3 className="font-headline font-bold text-headline-sm text-on-surface">Tiêu dùng bền vững</h3>
          <p className="text-body-md text-on-surface-variant">
            Góp phần giảm thiểu rác thải môi trường bằng cách tái sử dụng và trao đổi những giá trị vẫn còn vẹn nguyên.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mx-auto md:mx-0">
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <h3 className="font-headline font-bold text-headline-sm text-on-surface">Cộng đồng gắn kết</h3>
          <p className="text-body-md text-on-surface-variant">
            Không chỉ là mua bán, đây là nơi những người có cùng sở thích kết nối, học hỏi và chia sẻ niềm đam mê.
          </p>
        </div>
      </div>
    </section>
  );
}
