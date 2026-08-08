"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import CancelCheckoutDialog from "@/components/orders/CancelCheckoutDialog";
import { remainingLabel } from "@/lib/order-state";
import type { Option, PaymentSession } from "@/api/generated/types.gen";

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);

/**
 * A payer who left for a rail and came back without paying.
 *
 * This screen exists because the rails do not all report a cancellation. SePay's hosted page
 * has a back button and no webhook behind it, so a buyer who presses it leaves the session
 * exactly as it was — funded by nobody and good until `expired_at`. Nothing is wrong and
 * nothing needs undoing; the only thing missing is a way back to the gateway.
 *
 * `checkout_url` is that way back, and when the server answers one it is the whole screen:
 * the rail chooser is not offered beside it, because tendering a *different* rail while one
 * attempt is still open is refused — the platform cannot tell an abandoned page from a
 * payment under way, and two live pages on one session can both be paid.
 *
 * The checkout form is not repeated here either. The draft that opened this session is spent
 * and its terms — address, carrier, price — are frozen into the session already, so re-asking
 * would offer choices that can no longer change anything.
 */
export default function ResumePayment({
  session,
  isLoading,
  paymentOptions,
  activePayment,
  onSelectPayment,
  onRetry,
  isRetrying,
}: {
  session: PaymentSession | undefined;
  isLoading: boolean;
  paymentOptions: Option[];
  activePayment: string;
  onSelectPayment: (id: string) => void;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  if (isLoading && !session) {
    return (
      <div className="min-h-screen py-12 flex justify-center text-on-surface-variant">
        Đang tải phiên thanh toán...
      </div>
    );
  }

  // A session id that reads back as nothing is a link into a session that is not this
  // account's, or one the voiding job has already collected.
  if (!session) {
    return (
      <Shell>
        <Empty
          icon="link_off"
          title="Không tìm thấy phiên thanh toán"
          body="Liên kết này đã hết hiệu lực hoặc không thuộc về tài khoản của bạn."
        />
      </Shell>
    );
  }

  const left = remainingLabel(session.expired_at);
  const expired = left === "đã quá hạn";
  // `outstanding` rather than `total_amount`: a session may already be part-paid across rails,
  // and asking again for the whole total would take the settled part twice.
  const due = session.outstanding;

  const finished = session.status === "cancelled" || session.status === "failed";
  // The page the rail is still waiting at. Its presence is what tells "the payer walked away
  // from a gateway that is still open" apart from "the rail was called and said nothing" —
  // two situations that look identical in the session's own status.
  const gateway = !expired && !finished ? session.checkout_url : "";
  // A leg in flight with nowhere to send anybody: nothing to press but cancel.
  const settling = session.status === "processing" && !gateway;
  const canRetry = session.status === "pending" && !expired && due > 0;
  // Exactly what `CancelSession` accepts. `processing` is included on purpose and by the
  // server's own rule: a rail that took the payer away and never reported leaves the
  // session there, and without this the buyer would have no way out of it at all.
  const canCancel = session.status === "pending" || session.status === "processing";

  return (
    <Shell>
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">receipt_long</span>
          <div className="flex flex-col min-w-0">
            <h1 className="font-headline-sm font-bold">Đơn hàng chờ thanh toán</h1>
            <span className="text-body-sm text-on-surface-variant tabular-nums">{session.id}</span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-label-md text-on-surface-variant">Số tiền còn phải trả</span>
            <span className="font-headline-md text-[22px] text-primary font-bold leading-none">
              {formatPrice(due, session.currency)}
            </span>
          </div>

          {settling && (
            <Notice tone="info" icon="hourglass_top">
              Đang chờ xác nhận từ cổng thanh toán. Bạn có thể để trang này mở — đơn hàng sẽ được
              tạo ngay khi thanh toán hoàn tất.
            </Notice>
          )}

          {finished && (
            <Notice tone="error" icon="cancel">
              Phiên thanh toán đã kết thúc. Vui lòng đặt hàng lại từ trang sản phẩm.
            </Notice>
          )}

          {expired && !finished && (
            <Notice tone="error" icon="timer_off">
              Phiên thanh toán đã hết hạn. Vui lòng đặt hàng lại từ trang sản phẩm.
            </Notice>
          )}

          {gateway && (
            <Notice tone="info" icon="info">
              Bạn đã rời khỏi cổng thanh toán trước khi hoàn tất. Đơn hàng vẫn được giữ
              {left ? ` — còn ${left} để thanh toán` : ""}. Mở lại trang thanh toán để tiếp tục.
            </Notice>
          )}

          {!gateway && canRetry && (
            <>
              <Notice tone="info" icon="info">
                Bạn chưa chọn phương thức thanh toán cho đơn này. Đơn hàng vẫn được giữ
                {left ? ` — còn ${left} để thanh toán` : ""}. Chọn phương thức và tiếp tục.
              </Notice>

              <div className="bg-surface-container-low p-4 rounded-xl">
                <h2 className="font-label-md text-primary mb-2">Phương thức thanh toán</h2>
                {paymentOptions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {paymentOptions.map((opt) => (
                      <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="resume-payment"
                          value={opt.id}
                          checked={activePayment === opt.id}
                          onChange={(e) => onSelectPayment(e.target.value)}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <span className="flex flex-col">
                          <span>{opt.name}</span>
                          {opt.description && (
                            <span className="text-xs text-on-surface-variant">
                              {opt.description}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">
                    Không có phương thức thanh toán nào khả dụng. Vui lòng liên hệ hỗ trợ.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {gateway ? (
              <a href={gateway} className="sm:flex-1 w-full">
                <Button variant="primary" size="lg" fullWidth>
                  Mở lại trang thanh toán
                </Button>
              </a>
            ) : (
              canRetry && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={onRetry}
                  disabled={isRetrying || !activePayment}
                >
                  {isRetrying ? "Đang chuyển tới cổng thanh toán..." : "Thanh toán"}
                </Button>
              )
            )}
            <Link href="/account/orders" className="sm:w-auto w-full">
              <Button variant="outline" size="lg" fullWidth>
                Xem đơn hàng của tôi
              </Button>
            </Link>
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelling(true)}
              className="self-center text-body-sm text-on-surface-variant underline underline-offset-4 hover:text-error transition-colors"
            >
              Huỷ đơn này
            </button>
          )}
        </div>
      </div>

      <CancelCheckoutDialog
        sessionId={session.id}
        open={cancelling}
        onClose={() => setCancelling(false)}
        // Nothing left on this screen once the session is gone — it exists only to pay one.
        onCancelled={() => router.push("/account/orders")}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[560px] mx-auto px-4 md:px-8">{children}</div>
    </div>
  );
}

function Notice({
  tone,
  icon,
  children,
}: {
  tone: "info" | "error";
  icon: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "error"
      ? "bg-error-container text-on-error-container"
      : "bg-tertiary-container/40 text-on-surface";

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${styles}`}>
      <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
      <p className="text-body-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Empty({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-10 flex flex-col items-center text-center gap-3">
      <span className="material-symbols-outlined text-[40px] text-on-surface-variant">{icon}</span>
      <h1 className="font-headline-sm font-bold">{title}</h1>
      <p className="text-body-sm text-on-surface-variant max-w-[380px]">{body}</p>
      <Link href="/account/orders" className="mt-2">
        <Button variant="outline">Xem đơn hàng của tôi</Button>
      </Link>
    </div>
  );
}
