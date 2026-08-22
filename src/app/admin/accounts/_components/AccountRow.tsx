"use client";

import type { AdminAccount } from "@/api/generated/types.gen";
import { ACCOUNT_ROLE_VI } from "@/lib/dictionaries";
import IdentityKey from "@/components/admin-config/IdentityKey";
import SuspensionBadge from "@/components/admin-config/SuspensionBadge";
import Button from "@/components/ui/Button";

export default function AccountRow({
  account,
  onSuspend,
  onReinstate,
  isBusy,
}: {
  account: AdminAccount;
  onSuspend: () => void;
  onReinstate: () => void;
  isBusy: boolean;
}) {
  const isSuspended = account.status === "suspended";

  return (
    <tr className="border-t border-outline-variant hover:bg-surface-container-low/60 transition-colors align-top">
      {/* Two lines. The id used to sit on a third of its own, which cost 32px on every row
          of a table that is nothing but rows; beside the name it is still the first thing
          copied and the row is two thirds the height. */}
      <td className="px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-label-md text-on-surface">{account.name}</span>
          <IdentityKey value={account.id} />
        </div>
        <div className="truncate font-body-sm text-on-surface-variant">
          {account.email ?? account.phone ?? account.username ?? "Không có định danh công khai"}
        </div>
      </td>

      <td className="px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-body-sm text-on-surface">{ACCOUNT_ROLE_VI[account.role]}</span>
          {/* Icon only, with the words in the tooltip: the labels were longer than the role
              they qualified, so a verified account's cell read as two sentences. */}
          {account.email_verified && <Marker icon="mark_email_read" label="Email đã xác minh" />}
          {account.identity_verified && <Marker icon="badge" label="Đã xác minh danh tính" />}
        </div>
      </td>

      <td className="px-4 py-2.5">
        <SuspensionBadge account={account} />
      </td>

      <td className="whitespace-nowrap px-4 py-2.5 text-right">
        {/* Outlined, not filled. Nine rows of a filled destructive button is a wall of the
            loudest colour on the page arguing for the one action nobody should take by
            accident; the border carries the warning and the fill arrives on hover. */}
        {isSuspended ? (
          <Button size="sm" variant="outline" onClick={onReinstate} disabled={isBusy}>
            Gỡ đình chỉ
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onSuspend}
            disabled={isBusy}
            className="border-error/40 text-error hover:border-error hover:bg-error hover:text-on-error"
          >
            Đình chỉ
          </Button>
        )}
      </td>
    </tr>
  );
}

function Marker({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className="grid h-5 w-5 place-items-center rounded-full bg-surface-container text-on-surface-variant"
    >
      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
        {icon}
      </span>
    </span>
  );
}
