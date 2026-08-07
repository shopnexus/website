import type { AdminAccount } from "@/api/generated/types.gen";
import { describeSuspension, formatDateTime } from "@/lib/admin-suspension";

/**
 * The account's standing, with the permanent case spelled out.
 *
 * A suspended row whose `suspended_until` is null is the strongest state this system has,
 * and it is encoded as an absent value — so it is the one that gets the loudest treatment
 * here rather than the quietest.
 */
export default function SuspensionBadge({ account }: { account: AdminAccount }) {
  const view = describeSuspension(account);

  if (view.kind === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 font-label-sm text-on-surface-variant">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" aria-hidden />
        Hoạt động
      </span>
    );
  }

  const isPermanent = view.kind === "permanent";
  return (
    <div className="flex flex-col gap-1 items-start">
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm",
          isPermanent
            ? "bg-error text-on-error"
            : "bg-error-container text-on-error-container",
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[14px]">
          {isPermanent ? "gpp_bad" : "schedule" }
        </span>
        {isPermanent ? "Đình chỉ vĩnh viễn" : "Đình chỉ có thời hạn"}
      </span>
      {view.kind === "until" && (
        <span className="font-body-sm text-on-surface-variant">
          {view.expired ? "Đã hết hạn " : "Đến "}
          {formatDateTime(view.until)}
        </span>
      )}
      {isPermanent && (
        <span className="font-body-sm text-on-surface-variant">Không có ngày mở lại</span>
      )}
      {view.reason && (
        <span className="font-body-sm text-on-surface-variant italic line-clamp-2 max-w-[22rem]">
          “{view.reason}”
        </span>
      )}
    </div>
  );
}
