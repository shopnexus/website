import Link from "next/link";
import ContentPage, { Section } from "@/components/content/ContentPage";

export const metadata = { title: "Về ShopNexus" };

export default function AboutPage() {
  return (
    <ContentPage
      title="Về ShopNexus"
      intro="Một sàn để người dùng mua bán trực tiếp với nhau — và một cơ chế giữ tiền để việc đó không cần niềm tin mù quáng."
    >
      <Section id="van-de" title="Vấn đề chúng tôi giải">
        <p>
          Mua bán đồ cũ giữa hai người lạ luôn vướng cùng một câu hỏi: ai đưa trước. Người mua
          sợ chuyển tiền rồi không nhận được hàng; người bán sợ gửi hàng rồi không nhận được
          tiền.
        </p>
        <p>
          ShopNexus đứng giữa. Tiền của người mua được giữ lại từ lúc thanh toán, và chỉ chuyển
          cho người bán sau khi hàng đã tới nơi. Không bên nào phải đưa trước.
        </p>
      </Section>

      <Section id="cach-lam" title="Cách nó hoạt động">
        <ul>
          <li>Người bán đăng tin, đặt giá cố định hoặc cho phép thương lượng.</li>
          <li>Người mua thanh toán; ShopNexus giữ tiền và phí vận chuyển.</li>
          <li>Người bán xác nhận, kiện hàng được giao cho đơn vị vận chuyển.</li>
          <li>Người mua nhận hàng, kiểm tra, xác nhận — rồi tiền mới về người bán.</li>
          <li>Có trục trặc thì mở yêu cầu hoàn tiền, và ShopNexus phân xử nếu hai bên không thống nhất.</li>
        </ul>
        <p>
          Chi tiết từng mốc thời gian nằm trong <Link href="/terms">điều khoản sử dụng</Link>.
        </p>
      </Section>

      <Section id="lien-he" title="Liên hệ">
        <p>
          Mọi câu hỏi, góp ý hay báo lỗi, hãy gửi qua{" "}
          <Link href="/support">Trung tâm hỗ trợ</Link> — đó là kênh duy nhất chúng tôi theo
          dõi, nên nó cũng là kênh trả lời nhanh nhất.
        </p>
      </Section>
    </ContentPage>
  );
}
