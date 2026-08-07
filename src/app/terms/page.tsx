import Link from "next/link";
import ContentPage, { Section } from "@/components/content/ContentPage";

export const metadata = { title: "Điều khoản sử dụng | ShopNexus" };

/**
 * Every number here is read off the running system, not invented: the windows come from
 * `internal/module/order/domain` and `internal/module/trust/domain`, and the flows are the
 * ones the routes actually enforce. A terms page that describes a platform other than the
 * one you are using is worse than none.
 */
export default function TermsPage() {
  return (
    <ContentPage
      title="Điều khoản sử dụng"
      intro="ShopNexus là sàn giao dịch giữa người dùng với người dùng. Trang này mô tả quyền và nghĩa vụ của các bên, và cách nền tảng giữ tiền cho tới khi hàng tới nơi."
      updated="2026-08-07"
      draft
    >
      <Section id="tai-khoan" title="1. Tài khoản">
        <p>
          Bạn cần một tài khoản để mua hoặc bán. Mỗi tài khoản phải luôn còn ít nhất một cách
          đăng nhập — mật khẩu hoặc một nhà cung cấp đã liên kết — nên yêu cầu gỡ bỏ cách cuối
          cùng sẽ bị từ chối.
        </p>
        <p>
          Để rút tiền bán hàng, bạn cần xác minh danh tính. Việc xác minh do một bên thứ ba
          thực hiện; ShopNexus <strong>không lưu số giấy tờ hay ảnh chụp</strong>, chỉ lưu kết
          quả và thời hạn của giấy tờ.
        </p>
      </Section>

      <Section id="mua-hang" title="2. Mua hàng và tiền tạm giữ">
        <p>
          Khi bạn thanh toán, ShopNexus giữ số tiền đó — bao gồm cả phí vận chuyển — chứ không
          chuyển ngay cho người bán. Đây là điểm cốt lõi của sàn: người bán chỉ nhận được tiền
          sau khi hàng đã tới tay bạn.
        </p>
        <ul>
          <li>
            Người bán có <strong>48 giờ</strong> để xác nhận đơn. Nếu họ từ chối, bạn được hoàn
            lại toàn bộ, kể cả phí vận chuyển, vì kiện hàng chưa rời kho.
          </li>
          <li>
            Nếu họ không trả lời trong 48 giờ, ShopNexus mở một yêu cầu hỗ trợ để nhân viên
            liên hệ. Sàn không tự huỷ đơn và cũng không gửi hàng thay người bán.
          </li>
          <li>
            Bạn huỷ đơn được chừng nào kiện hàng chưa được đơn vị vận chuyển lấy đi. Sau thời
            điểm đó, đường duy nhất là yêu cầu hoàn tiền.
          </li>
          <li>
            Sau khi bạn xác nhận đã nhận hàng, tiền chuyển cho người bán sau{" "}
            <strong>72 giờ</strong> — trừ khi trong khoảng đó có một yêu cầu hoàn tiền đang mở.
          </li>
        </ul>
        <p>
          Xác nhận nhận hàng cần ít nhất một ảnh mở hộp. Đó là bằng chứng mà một yêu cầu hoàn
          tiền về sau được xét trên, và nó không bổ sung được sau thời điểm xác nhận.
        </p>
      </Section>

      <Section id="hoan-tien" title="3. Hoàn tiền">
        <p>
          Chỉ người mua mở được yêu cầu hoàn tiền. Người bán{" "}
          <strong>không có quyền từ chối</strong> — họ chỉ có hai lựa chọn: chấp nhận, hoặc
          chuyển vụ việc cho ShopNexus xem xét. Im lặng quá <strong>48 giờ</strong> cũng đồng
          nghĩa chuyển cho ShopNexus.
        </p>
        <ul>
          <li>Chấp nhận thì hàng được gửi trả trước; tiền chưa chuyển ngay.</li>
          <li>
            Khi người bán xác nhận đã nhận lại hàng, họ có <strong>48 giờ</strong> để kiểm tra
            và khiếu nại. Hết thời hạn mà không khiếu nại, tiền tự động về người mua.
          </li>
          <li>
            Nếu người mua báo đã trả hàng nhưng người bán chưa xác nhận, vụ việc chuyển thẳng
            cho ShopNexus thay vì mở cửa sổ kiểm hàng.
          </li>
        </ul>
      </Section>

      <Section id="thuong-luong" title="4. Thương lượng giá">
        <p>
          Với tin đăng cho phép thương lượng, người mua gửi đề nghị giá và hai bên trả giá qua
          lại trong cuộc trò chuyện. Mỗi đề nghị có hiệu lực <strong>12 giờ</strong>. Khi một
          bên đồng ý, mức giá được giữ trong <strong>30 phút</strong> để người mua thanh toán —
          hết thời gian đó thì phải thương lượng lại.
        </p>
        <p>
          Đồng ý giá <em>không phải</em> là đã bán. Đơn hàng chỉ hình thành khi người mua thanh
          toán.
        </p>
      </Section>

      <Section id="danh-gia" title="5. Đánh giá">
        <p>
          Đánh giá giữa hai bên của một đơn là <strong>ẩn</strong>: không ai thấy đánh giá của
          bên kia cho tới khi cả hai cùng gửi, hoặc sau <strong>14 ngày</strong>. Điều này để
          một đánh giá không thể là hành động trả đũa. Mỗi bên gửi được đúng một lần và không
          sửa lại được.
        </p>
      </Section>

      <Section id="cam" title="6. Nội dung bị cấm và xử lý vi phạm">
        <p>
          Không đăng hàng cấm theo pháp luật Việt Nam, hàng giả, hàng nhái, hoặc nội dung xâm
          phạm quyền của người khác. Tin đăng có thể bị gỡ và tài khoản có thể bị tạm ngưng —
          có thời hạn hoặc vĩnh viễn — sau khi được kiểm duyệt viên xem xét.
        </p>
        <p>
          Mọi khiếu nại đều đi qua <Link href="/support">Trung tâm hỗ trợ</Link>. Đừng chuyển
          khoản trực tiếp cho người bán: xem{" "}
          <Link href="/help/safety">hướng dẫn giao dịch an toàn</Link>.
        </p>
      </Section>

      <Section id="lien-he" title="7. Liên hệ">
        <p>
          Mọi câu hỏi về các điều khoản này, hãy gửi qua{" "}
          <Link href="/support">Trung tâm hỗ trợ</Link>.
        </p>
      </Section>
    </ContentPage>
  );
}
