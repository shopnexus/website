import Link from "next/link";
import ContentPage, { Section } from "@/components/content/ContentPage";

export const metadata = { title: "Chính sách bảo mật | ShopNexus" };

/**
 * What the system actually stores and sends, read off the modules rather than generalised
 * from a template — including the two facts most policies get wrong by omission: card
 * details never reach this platform, and identity scans are not kept.
 */
export default function PrivacyPage() {
  return (
    <ContentPage
      title="Chính sách bảo mật"
      intro="Những gì ShopNexus lưu, vì sao, và ai khác nhìn thấy."
      updated="2026-08-07"
      draft
    >
      <Section id="thu-thap" title="1. Dữ liệu chúng tôi lưu">
        <ul>
          <li>
            <strong>Tài khoản:</strong> email, số điện thoại, tên đăng nhập, tên hiển thị, ảnh
            đại diện, và các thông tin bạn tự điền như ngày sinh, giới tính, mô tả.
          </li>
          <li>
            <strong>Địa chỉ:</strong> địa chỉ nhận và lấy hàng. Khi một đơn được tạo, địa chỉ
            được <em>sao chép</em> vào đơn đó — sửa sổ địa chỉ về sau không làm thay đổi nơi
            một kiện hàng cũ đã được gửi tới.
          </li>
          <li>
            <strong>Giao dịch:</strong> đơn hàng, thương lượng, hoàn tiền, sổ cái ví, và ảnh
            bằng chứng bạn tải lên.
          </li>
          <li>
            <strong>Tin nhắn:</strong> nội dung trò chuyện giữa bạn và người bạn giao dịch.
          </li>
          <li>
            <strong>Nhật ký kỹ thuật:</strong> thời gian, đường dẫn và mã trạng thái của các
            yêu cầu tới máy chủ, để vận hành và tìm lỗi.
          </li>
        </ul>
      </Section>

      <Section id="khong-luu" title="2. Những gì chúng tôi KHÔNG lưu">
        <ul>
          <li>
            <strong>Thông tin thẻ.</strong> Thanh toán do cổng thanh toán xử lý trên trang của
            họ. Số thẻ không bao giờ đi qua máy chủ ShopNexus.
          </li>
          <li>
            <strong>Ảnh chụp và số giấy tờ tuỳ thân.</strong> Việc xác minh do đối tác eKYC
            thực hiện; chúng tôi chỉ nhận lại kết quả (đạt/không đạt) và ngày hết hạn của giấy
            tờ.
          </li>
        </ul>
      </Section>

      <Section id="ben-thu-ba" title="3. Bên thứ ba">
        <ul>
          <li>
            <strong>Cổng thanh toán</strong> — để nhận tiền và hoàn tiền.
          </li>
          <li>
            <strong>Đơn vị vận chuyển</strong> — nhận tên, số điện thoại và địa chỉ của bên
            nhận, vì đó là thứ cần để giao hàng.
          </li>
          <li>
            <strong>Đối tác eKYC</strong> — nhận ảnh giấy tờ bạn gửi khi xác minh danh tính.
          </li>
          <li>
            <strong>Nhà cung cấp email và SMS</strong> — để gửi mã xác minh và thông báo.
          </li>
          <li>
            <strong>Rybbit</strong> — công cụ đo lường lượt truy cập, do chúng tôi tự vận hành
            trên hạ tầng riêng.
          </li>
        </ul>
      </Section>

      <Section id="ai-thay" title="4. Ai nhìn thấy gì">
        <p>
          Người bạn giao dịch nhìn thấy tên hiển thị, ảnh đại diện, đánh giá công khai, và —
          khi đã có đơn — địa chỉ nhận hàng. Họ không thấy email hay số điện thoại của bạn trừ
          khi bạn tự cung cấp.
        </p>
        <p>
          Nhân viên hỗ trợ đọc được nội dung của yêu cầu hỗ trợ mà bạn mở, để xử lý vụ việc.
          Với bạn, họ hiện diện dưới danh nghĩa bộ phận hỗ trợ chứ không phải tài khoản cá
          nhân.
        </p>
      </Section>

      <Section id="phien" title="5. Phiên đăng nhập">
        <p>
          Mỗi phiên đăng nhập tồn tại tối đa 30 ngày và được kiểm tra ở <em>mọi</em> yêu cầu.
          Nghĩa là đăng xuất, đổi mật khẩu hoặc bị khoá tài khoản có hiệu lực ngay, kể cả với
          thiết bị đang mở sẵn.
        </p>
      </Section>

      <Section id="quyen" title="6. Quyền của bạn">
        <p>
          Bạn xem và sửa hồ sơ, địa chỉ, phương thức đăng nhập trong{" "}
          <Link href="/dashboard/profile">trang quản lý tài khoản</Link>. Với yêu cầu xoá dữ
          liệu, hãy mở một yêu cầu qua <Link href="/support">Trung tâm hỗ trợ</Link>.
        </p>
        <p>
          Một số dữ liệu phải được giữ lại sau khi bạn rời đi: hồ sơ giao dịch và sổ cái tiền,
          vì đó là bằng chứng của những khoản tiền đã chuyển giữa các bên.
        </p>
      </Section>
    </ContentPage>
  );
}
