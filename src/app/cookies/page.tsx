import Link from "next/link";
import ContentPage, { Section } from "@/components/content/ContentPage";

export const metadata = { title: "Chính sách cookie" };

/**
 * Short because the truth is short: this site stores three things in the browser and none
 * of them is an advertising identifier. A long cookie policy here would be padding.
 */
export default function CookiesPage() {
  return (
    <ContentPage
      title="Chính sách cookie"
      intro="Ba thứ được lưu trong trình duyệt của bạn, và không có thứ nào phục vụ quảng cáo."
      updated="2026-08-07"
      draft
    >
      <Section id="dang-nhap" title="1. Phiên đăng nhập">
        <p>
          Sau khi đăng nhập, một cookie giữ mã phiên để bạn không phải nhập lại mật khẩu ở mỗi
          trang. Xoá nó đồng nghĩa với đăng xuất. Không có cookie này thì các trang cần đăng
          nhập sẽ đưa bạn về màn hình đăng nhập.
        </p>
      </Section>

      <Section id="gio-hang" title="2. Giỏ hàng của khách">
        <p>
          Khi bạn chưa đăng nhập, giỏ hàng được giữ trong bộ nhớ cục bộ của trình duyệt để nó
          không biến mất khi tải lại trang. Nó chỉ chứa mã sản phẩm và số lượng — không có giá
          và không có tên, vì giá thay đổi và một giỏ hàng nhớ giá của tuần trước là một giỏ
          hàng sai. Khi bạn đăng nhập, phần này được chuyển lên tài khoản rồi xoá đi.
        </p>
      </Section>

      <Section id="do-luong" title="3. Đo lường truy cập">
        <p>
          Chúng tôi đếm lượt truy cập bằng một công cụ tự vận hành trên hạ tầng riêng, để biết
          trang nào được dùng. Dữ liệu này không được bán và không dùng để hiển thị quảng cáo.
        </p>
      </Section>

      <Section id="tu-choi" title="4. Từ chối">
        <p>
          Bạn có thể chặn hoặc xoá cookie trong cài đặt trình duyệt. Chặn cookie phiên đăng
          nhập sẽ khiến bạn không đăng nhập được — đó là cookie bắt buộc để trang hoạt động.
          Mọi thắc mắc, hãy gửi qua <Link href="/support">Trung tâm hỗ trợ</Link>.
        </p>
      </Section>
    </ContentPage>
  );
}
