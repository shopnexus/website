"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useVerifyEmail } from "@/hooks/api/useAccount";
import { ApiError } from "@/api/api-error";

/**
 * Where the link in the verification email lands.
 *
 * The route existed on the server and nowhere on the web, so every one of those emails led
 * to a 404 and no address could ever be confirmed from one.
 *
 * It runs the token on arrival rather than behind a button: the recipient already made the
 * decision when they clicked the link, and a second "yes, really" screen is a step whose
 * only outcome is people not finishing. Signed-in state is irrelevant — the token names the
 * account, and these links are opened in whichever browser the mail app hands them to.
 */
export default function VerifyEmail() {
  const token = useSearchParams().get("token");
  const verifyEmail = useVerifyEmail();

  // The outcome is held here rather than read off the mutation. Strict mode unmounts and
  // remounts, and query-core's MutationObserver drops itself from an in-flight mutation on
  // unsubscribe without ever re-attaching, so the result never reaches the hook and the
  // screen stays on "verifying" over a request that already returned.
  const [outcome, setOutcome] = useState<"pending" | "done" | "failed">("pending");
  const [error, setError] = useState<unknown>(null);

  // The token is single-use, so the remount must not spend it a second time and report
  // "expired" over a verification that had just succeeded.
  const fired = useRef(false);
  useEffect(() => {
    if (!token || fired.current) return;
    fired.current = true;
    verifyEmail.mutateAsync(token).then(
      () => setOutcome("done"),
      (cause: unknown) => {
        setError(cause);
        setOutcome("failed");
      },
    );
  }, [token, verifyEmail]);

  const state = !token ? "missing" : outcome;

  // 401 is the only failure the route reports, and it covers three different situations.
  const spent = error instanceof ApiError && error.status === 401;

  return (
    <div className="w-full max-w-md bg-surface rounded-3xl border border-outline-variant p-8 md:p-10 shadow-sm text-center flex flex-col items-center gap-4">
      <span
        className={`material-symbols-outlined text-[56px] ${
          state === "done"
            ? "text-primary"
            : state === "pending"
              ? "text-on-surface-variant animate-pulse"
              : "text-error"
        }`}
        style={state === "done" ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {state === "done" ? "mark_email_read" : state === "pending" ? "mail" : "error"}
      </span>

      {state === "pending" && (
        <>
          <h1 className="font-headline-sm font-bold text-on-surface">Đang xác minh email…</h1>
          <p className="text-body-sm text-on-surface-variant">Chỉ mất một giây.</p>
        </>
      )}

      {state === "done" && (
        <>
          <h1 className="font-headline-sm font-bold text-on-surface">Email đã được xác minh</h1>
          <p className="text-body-sm text-on-surface-variant">
            Từ giờ bạn nhận được thông báo về đơn hàng và có thể khôi phục mật khẩu qua địa
            chỉ này.
          </p>
          <Link href="/account" className="w-full mt-2">
            <Button variant="primary" fullWidth>
              Về trang quản lý
            </Button>
          </Link>
        </>
      )}

      {state === "missing" && (
        <>
          <h1 className="font-headline-sm font-bold text-on-surface">Thiếu mã xác minh</h1>
          <p className="text-body-sm text-on-surface-variant">
            Đường dẫn này không mang mã nào. Hãy mở lại đúng liên kết trong email, hoặc yêu
            cầu gửi lại từ trang bảo mật.
          </p>
        </>
      )}

      {state === "failed" && (
        <>
          <h1 className="font-headline-sm font-bold text-on-surface">
            {spent ? "Liên kết không còn dùng được" : "Không xác minh được"}
          </h1>
          {/* Say all three, because the server cannot tell them apart and guessing one
              sends people looking for a problem they do not have. */}
          <p className="text-body-sm text-on-surface-variant">
            {spent
              ? "Có thể mã đã hết hạn, đã được dùng, hoặc email đã xác minh từ trước. Bạn có thể yêu cầu gửi lại một liên kết mới."
              : "Đã có lỗi xảy ra. Hãy thử lại sau ít phút."}
          </p>
        </>
      )}

      {(state === "failed" || state === "missing") && (
        <Link href="/account/security" className="w-full mt-2">
          <Button variant="outline" fullWidth>
            Gửi lại email xác minh
          </Button>
        </Link>
      )}
    </div>
  );
}
