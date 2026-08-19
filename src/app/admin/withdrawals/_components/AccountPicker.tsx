"use client";

import type { AdminAccount } from "@/api/generated/types.gen";
import Input from "@/components/ui/Input";

/**
 * Finding whose wallet this is.
 *
 * A withdrawal row names the bank account holder and not the payee's account — the payout
 * projection resolves the destination, not the owner — so the inspector opens on that name
 * and a person confirms which account it is. Every identifier the staff list carries is
 * shown, because two sellers can share a display name and only one of them raised this.
 */
export default function AccountPicker({
  term,
  onTermChange,
  accounts,
  searching,
  searched,
  onSelect,
}: {
  term: string;
  onTermChange: (term: string) => void;
  accounts: ReadonlyArray<AdminAccount>;
  searching: boolean;
  searched: boolean;
  onSelect: (account: AdminAccount) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="font-label-md text-on-surface block mb-1.5">Tìm tài khoản</span>
        <Input
          fullWidth
          autoFocus
          leftIcon="search"
          value={term}
          onChange={(event) => onTermChange(event.target.value)}
          placeholder="Tên hiển thị, email hoặc số điện thoại"
        />
      </label>

      {searching && (
        <p className="font-body-sm text-on-surface-variant">Đang tìm…</p>
      )}

      {!searching && searched && accounts.length === 0 && (
        <p className="font-body-sm text-on-surface-variant">
          Không có tài khoản nào khớp. Thử email hoặc số điện thoại — tên chủ tài khoản ngân
          hàng không phải lúc nào cũng trùng tên hiển thị.
        </p>
      )}

      <ul className="divide-y divide-outline-variant rounded-xl border border-outline-variant overflow-hidden">
        {accounts.map((account) => (
          <li key={account.id}>
            <button
              type="button"
              onClick={() => onSelect(account)}
              className="w-full text-left px-4 py-3 hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="font-label-md text-on-surface">{account.name}</div>
              <div className="font-body-sm text-on-surface-variant mt-0.5 truncate">
                {account.email ?? account.phone ?? account.username ?? "Không có định danh công khai"}
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant mt-0.5">
                {account.id}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
