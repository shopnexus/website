import Link from "next/link";
import ContentPage, { Section } from "@/components/content/ContentPage";

export const metadata = { title: "Giao dịch an toàn" };

/**
 * The page the chat's safety tip links to — it had no target at all, so the one moment the
 * app warns somebody about direct transfers led nowhere.
 *
 * Written around what the platform can and cannot do for you, because that is the only
 * thing that makes "đừng chuyển khoản trực tiếp" more than a slogan: money inside the
 * system is recoverable and money outside it is not.
 */
export default function SafetyPage() {
  return (
    <ContentPage
      title="Giao dịch an toàn"
      intro="ShopNexus giữ tiền của bạn tới khi hàng tới nơi. Đó là toàn bộ lý do những lời khuyên dưới đây có giá trị."
    >
      <Section id="thanh-toan" title="Luôn thanh toán qua ShopNexus">
        <p>
          Khi bạn trả tiền trên sàn, số tiền đó được <strong>giữ lại</strong> chứ không tới tay
          người bán ngay. Người bán chỉ nhận được sau khi bạn xác nhận đã nhận hàng, và bạn
          luôn có đường mở yêu cầu hoàn tiền.
        </p>
        <p>
          Chuyển khoản thẳng vào tài khoản cá nhân của người bán là bước ra khỏi toàn bộ cơ chế
          đó. Khi ấy ShopNexus <strong>không thể</strong> hoàn tiền, không thể phân xử, và
          không có hồ sơ nào để dựa vào — vì giao dịch chưa từng diễn ra trên sàn.
        </p>
      </Section>

      <Section id="tro-chuyen" title="Giữ cuộc trò chuyện trên sàn">
        <p>
          Nếu có tranh chấp, nhân viên hỗ trợ đọc được nội dung trao đổi trong yêu cầu hỗ trợ
          để phân xử. Những gì đã nói qua Zalo, Messenger hay điện thoại thì không ai kiểm
          chứng được.
        </p>
        <p>
          Một người bán khăng khăng chuyển sang kênh khác <em>trước khi</em> chốt đơn là dấu
          hiệu đáng ngờ — thường vì họ muốn bạn ra khỏi chỗ được bảo vệ.
        </p>
      </Section>

      <Section id="nhan-hang" title="Kiểm hàng trước khi xác nhận">
        <p>
          Bấm &ldquo;Đã nhận hàng&rdquo; là thứ mở đồng hồ trả tiền cho người bán, và{" "}
          <strong>không hoàn tác được</strong>. Hãy mở hộp và kiểm tra trước.
        </p>
        <p>
          Ảnh mở hộp là bắt buộc, và không bổ sung được về sau: nếu bạn yêu cầu hoàn tiền, đó
          chính là bằng chứng vụ việc được xét trên. Chụp cả tình trạng gói hàng lúc vừa nhận.
        </p>
        <p>
          Thấy có gì chưa đúng thì <strong>yêu cầu hoàn tiền trước</strong>, đừng xác nhận rồi
          mới khiếu nại.
        </p>
      </Section>

      <Section id="nguoi-ban" title="Nếu bạn là người bán">
        <p>
          Đừng gửi hàng trước khi đơn được thanh toán và bạn đã xác nhận đơn trên sàn. Đơn nào
          đã trả tiền thì tiền đang được giữ sẵn cho bạn.
        </p>
        <p>
          Vị trí kiện hàng do đơn vị vận chuyển báo, không phải do bạn tự cập nhật — vì đó là
          thứ quyết định người mua còn huỷ đơn được hay không. Thấy sai thì{" "}
          <Link href="/support?kind=order-issue">báo để ShopNexus kiểm tra</Link>.
        </p>
      </Section>

      <Section id="canh-bao" title="Dấu hiệu cần cảnh giác">
        <ul>
          <li>Giục chuyển khoản riêng, hoặc &ldquo;đặt cọc giữ hàng&rdquo; ngoài sàn.</li>
          <li>Giá thấp bất thường kèm sức ép phải quyết ngay.</li>
          <li>Xin mã OTP, mật khẩu, hoặc ảnh giấy tờ tuỳ thân. Không ai của ShopNexus hỏi những thứ này.</li>
          <li>Link lạ dẫn tới trang &ldquo;thanh toán&rdquo; không thuộc ShopNexus.</li>
        </ul>
        <p>
          Gặp bất kỳ dấu hiệu nào, hãy <Link href="/support">báo cho chúng tôi</Link>.
        </p>
      </Section>
    </ContentPage>
  );
}
