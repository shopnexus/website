"use client";

import type { PaymentSession } from "@/api/generated/types.gen";
import { PAYMENT_SESSION_STATUS_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import { STATUS_CHIP, STATUS_RAIL, isOverdue } from "../_lib/sessions.logic";

const KIND_VI: Record<PaymentSession["kind"], string> = {
  "buyer-checkout": "Người mua thanh toán",
  "seller-payout": "Chi cho người bán",
  withdrawal: "Rút tiền",
};

/**
 * The rows themselves.
 *
 * A table because this is the one screen where the reader is comparing figures down a
 * column rather than reading one record. It scrolls inside its own box so the page never
 * scrolls sideways.
 */
export default function SessionTable({
  sessions,
  isLoading,
  shown,
  totalCount,
}: {
  sessions: ReadonlyArray<PaymentSession>;
  isLoading: boolean;
  shown: number;
  totalCount: number | null;
}) {
  return (
    <section className="bg-surface-container-low rounded-2xl border border-outline-variant/40 overflow-hidden">
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-14 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-40 mb-3 block">
            receipt_long
          </span>
          <p className="font-body-md text-on-surface">
            Không có phiên thanh toán nào khớp bộ lọc.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40">
                <th className="w-1 p-0" aria-hidden />
                <th className="px-4 py-3 font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Phiên
                </th>
                <th className="px-4 py-3 font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Loại
                </th>
                <th className="px-4 py-3 font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Trạng thái
                </th>
                <th className="px-4 py-3 font-label-sm uppercase tracking-wider text-on-surface-variant text-right">
                  Số tiền
                </th>
                <th className="px-4 py-3 font-label-sm uppercase tracking-wider text-on-surface-variant text-right">
                  Còn phải thu
                </th>
                <th className="px-4 py-3 font-label-sm uppercase tracking-wider text-on-surface-variant">
                  Mốc thời gian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {sessions.map((session) => {
                const overdue = isOverdue(session);
                return (
                  <tr key={session.id} className="align-top">
                    <td className={`w-1 p-0 ${STATUS_RAIL[session.status]}`} aria-hidden />

                    <td className="px-4 py-4">
                      <div className="font-mono text-[12px] text-on-surface">{session.id}</div>
                      {session.note && (
                        <div className="font-body-sm text-on-surface-variant mt-1 max-w-xs">
                          {session.note}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 font-body-sm text-on-surface whitespace-nowrap">
                      {KIND_VI[session.kind]}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${STATUS_CHIP[session.status]}`}
                      >
                        {PAYMENT_SESSION_STATUS_VI[session.status]}
                      </span>
                      {overdue && (
                        <div className="text-[11px] font-bold text-error mt-1">Quá hạn chưa huỷ</div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right font-label-md text-on-surface tabular-nums whitespace-nowrap">
                      {formatMoney(session.total_amount, session.currency)}
                    </td>

                    <td
                      className={[
                        "px-4 py-4 text-right font-label-md tabular-nums whitespace-nowrap",
                        session.outstanding > 0 ? "text-on-surface" : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      {formatMoney(session.outstanding, session.currency)}
                    </td>

                    <td className="px-4 py-4 font-body-sm text-on-surface-variant whitespace-nowrap">
                      <div>Tạo {new Date(session.created_at).toLocaleString("vi-VN")}</div>
                      <div>
                        {session.paid_at
                          ? `Thanh toán ${new Date(session.paid_at).toLocaleString("vi-VN")}`
                          : `Hết hạn ${new Date(session.expired_at).toLocaleString("vi-VN")}`}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Says what is not on screen instead of implying the list is everything: the route
          answers one page and the client has no way to ask for a second. */}
      {totalCount !== null && totalCount > shown && (
        <div className="p-4 border-t border-outline-variant/40 text-center font-body-sm text-on-surface-variant">
          Đang hiển thị {shown} phiên gần nhất trong tổng số {totalCount}. Tăng số dòng hoặc thu hẹp
          bộ lọc để xem phần còn lại.
        </div>
      )}
    </section>
  );
}
