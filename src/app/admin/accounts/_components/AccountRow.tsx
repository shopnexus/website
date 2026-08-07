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
      <td className="px-5 py-4">
        <div className="font-label-md text-on-surface">{account.name}</div>
        <div className="font-body-sm text-on-surface-variant">
          {account.email ?? account.phone ?? account.username ?? "Không có định danh công khai"}
        </div>
        <div className="mt-1.5">
          <IdentityKey value={account.id} />
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="font-body-sm text-on-surface">{ACCOUNT_ROLE_VI[account.role]}</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {account.email_verified && <Marker icon="mark_email_read" label="Email đã xác minh" />}
          {account.identity_verified && <Marker icon="badge" label="Đã xác minh danh tính" />}
        </div>
      </td>

      <td className="px-5 py-4">
        <SuspensionBadge account={account} />
      </td>

      <td className="px-5 py-4 text-right whitespace-nowrap">
        {isSuspended ? (
          <Button size="sm" variant="outline" onClick={onReinstate} disabled={isBusy}>
            Gỡ đình chỉ
          </Button>
        ) : (
          <Button size="sm" variant="error" onClick={onSuspend} disabled={isBusy}>
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
      className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-on-surface-variant"
    >
      <span className="material-symbols-outlined text-[13px]">{icon}</span>
      {label}
    </span>
  );
}
