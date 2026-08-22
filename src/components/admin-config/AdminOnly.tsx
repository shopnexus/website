"use client";

import Link from "next/link";
import { useMe } from "@/hooks/api/useAccount";

/**
 * A wall in front of the pages a moderator cannot use at all.
 *
 * Six of the eleven console pages need `admin` for something, but only three of them need it
 * to show anything: categories, tags and options are public reads with admin-only writes, so
 * a moderator reads them and `AdminOnlyNotice` says why the buttons are missing. The other
 * three — withdrawals, the moderator roster, the payment-session ledger — are `requireAdmin`
 * on the read itself, so for a moderator the page could only ever be a failed request. One of
 * them was reported doing exactly that: the withdrawal queue firing
 * `GET /admin/withdrawals?status=pending` and putting `{"error":{"code":"admin_required"}}` on
 * screen.
 *
 * The nav hides these three from a moderator, so reaching one means a bookmark or a pasted
 * link — which is exactly when an explanation is worth more than an empty table.
 *
 * The children are not rendered while the role is unknown, which is the point: the request
 * has to not happen, not merely be hidden after it fails.
 */
export default function AdminOnly({
  what,
  children,
}: {
  /** What this page is, in the sentence "… chỉ quản trị viên xem được." */
  what: string;
  children: React.ReactNode;
}) {
  const { data: me } = useMe();

  if (me === undefined) return null;
  if (me.role === "admin") return <>{children}</>;

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-5 py-6">
      <span className="material-symbols-outlined text-[24px] text-on-surface-variant">lock</span>
      <div>
        <p className="font-label-lg text-on-surface">{what} chỉ quản trị viên xem được</p>
        <p className="mt-1 font-body-sm text-on-surface-variant">
          Tài khoản của bạn là kiểm duyệt viên. Các hàng đợi khiếu nại, xác minh danh tính và
          tin đăng thì mở.
        </p>
      </div>
      <Link
        href="/admin"
        className="font-label-md font-bold text-primary hover:underline"
      >
        Về bảng điều hành
      </Link>
    </div>
  );
}
