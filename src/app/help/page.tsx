import Link from "next/link";
import ContentPage, { Section } from "@/components/content/ContentPage";

export const metadata = { title: "Trợ giúp" };

const GUIDES = [
  { href: "/help/safety", icon: "shield", title: "Giao dịch an toàn", note: "Vì sao luôn thanh toán qua sàn, và khi nào nên yêu cầu hoàn tiền." },
  { href: "/terms", icon: "gavel", title: "Điều khoản sử dụng", note: "Các mốc thời gian của một đơn hàng: xác nhận, nhận hàng, hoàn tiền." },
  { href: "/privacy", icon: "lock", title: "Chính sách bảo mật", note: "Dữ liệu nào được lưu, ai nhìn thấy, và những gì chúng tôi không giữ." },
];

/**
 * A hub, not an article. The 404 page and the help centre both pointed here and there was
 * nothing to arrive at; what people actually need is the safety guide or a human.
 */
export default function HelpPage() {
  return (
    <ContentPage title="Trợ giúp" intro="Câu trả lời cho những việc hay gặp, và lối tới người thật khi cần.">
      <Section id="huong-dan" title="Hướng dẫn">
        <div className="flex flex-col gap-3">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant bg-surface hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-primary">{g.icon}</span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="font-label-md font-bold text-on-surface">{g.title}</span>
                <span className="text-body-sm text-on-surface-variant">{g.note}</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="lien-he" title="Vẫn cần giúp?">
        <p>
          Mở một yêu cầu hỗ trợ và nhân viên sẽ trả lời ngay trong cuộc trò chuyện của yêu cầu
          đó. Nếu vấn đề thuộc về một đơn hàng cụ thể, hãy mở từ chính trang đơn — yêu cầu sẽ
          mang sẵn mã đơn.
        </p>
        <Link href="/inbox?kind=other" className="inline-flex w-fit items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md font-semibold hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          Mở yêu cầu hỗ trợ
        </Link>
      </Section>
    </ContentPage>
  );
}
