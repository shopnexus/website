"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { CreateBankAccountRequest } from "@/api/generated/types.gen";
import {
  useAddBankAccount,
  useBankAccounts,
  useDeleteBankAccount,
  useMakeBankAccountDefault,
} from "@/hooks/api/useWallet";
import { BANK_SUGGESTIONS } from "../_lib/banks";
import { bankLabel } from "../_lib/wallet.logic";

const EMPTY: CreateBankAccountRequest = {
  bank_code: "",
  account_number: "",
  account_holder: "",
  is_default: false,
};

/**
 * Where cash-outs are sent.
 *
 * The stored number comes back masked and there is no route to edit one: an account is
 * replaced by adding the right one and removing the wrong one, which is the server's
 * shape rather than a limitation of this screen — `is_default` is the only mutable field.
 */
export default function BankAccountList() {
  const { data: accounts = [], isLoading } = useBankAccounts();
  const addAccount = useAddBankAccount();
  const makeDefault = useMakeBankAccountDefault();
  const deleteAccount = useDeleteBankAccount();

  const [isFormOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CreateBankAccountRequest>(EMPTY);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addAccount.mutate(
      {
        bank_code: form.bank_code.trim().toLowerCase(),
        account_number: form.account_number.replace(/\s+/g, ""),
        account_holder: form.account_holder.trim(),
        // The first account registered is the destination by default; there is nothing
        // else it could be, and leaving it unset would make the first withdrawal fail.
        is_default: accounts.length === 0 ? true : form.is_default,
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm tài khoản ngân hàng.");
          setForm(EMPTY);
          setFormOpen(false);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa tài khoản ngân hàng này?")) return;
    deleteAccount.mutate(id, { onSuccess: () => toast.success("Đã xóa tài khoản.") });
  };

  const complete =
    form.bank_code.trim() && form.account_number.trim() && form.account_holder.trim();

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/40 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-headline font-bold text-lg text-primary">Tài khoản ngân hàng</h2>
          <p className="font-body-sm text-on-surface-variant mt-1">
            Nơi nhận tiền khi bạn rút. Số tài khoản chỉ hiển thị vài số cuối.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          icon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          Thêm
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-3xl">
            progress_activity
          </span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-40 mb-3 block">
            account_balance_wallet
          </span>
          <p className="font-body-md">Chưa có tài khoản nào được đăng ký.</p>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/30">
          {accounts.map((account) => (
            <li key={account.id} className="p-5 flex flex-wrap items-center gap-4">
              <span className="material-symbols-outlined w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                account_balance
              </span>

              <div className="min-w-0 flex-1">
                <div className="font-label-md font-semibold text-on-surface flex items-center gap-2 flex-wrap">
                  {bankLabel(account)}
                  {account.is_default && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-container text-on-primary-container uppercase tracking-wide">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="font-body-sm text-on-surface-variant mt-0.5">
                  {account.account_holder}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {!account.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={makeDefault.isPending}
                    onClick={() =>
                      makeDefault.mutate(account.id, {
                        onSuccess: () => toast.success("Đã đặt làm tài khoản mặc định."),
                      })
                    }
                  >
                    Đặt mặc định
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-error border-error hover:bg-error/10"
                  disabled={deleteAccount.isPending}
                  onClick={() => handleDelete(account.id)}
                >
                  Xóa
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={isFormOpen}
        title="Thêm tài khoản ngân hàng"
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="bank-code"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Mã ngân hàng
            </label>
            <input
              id="bank-code"
              list="bank-code-suggestions"
              value={form.bank_code}
              maxLength={20}
              onChange={(event) => setForm({ ...form, bank_code: event.target.value })}
              placeholder="vcb"
              className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
            />
            <datalist id="bank-code-suggestions">
              {BANK_SUGGESTIONS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label
              htmlFor="bank-number"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Số tài khoản
            </label>
            <input
              id="bank-number"
              inputMode="numeric"
              maxLength={50}
              value={form.account_number}
              onChange={(event) => setForm({ ...form, account_number: event.target.value })}
              className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums"
            />
          </div>

          <div>
            <label
              htmlFor="bank-holder"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Tên chủ tài khoản
            </label>
            <input
              id="bank-holder"
              maxLength={100}
              value={form.account_holder}
              onChange={(event) => setForm({ ...form, account_holder: event.target.value })}
              className="w-full h-11 px-3 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
            />
          </div>

          {accounts.length > 0 && (
            <label className="flex items-center gap-2 font-body-sm text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.is_default)}
                onChange={(event) => setForm({ ...form, is_default: event.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              Dùng tài khoản này làm mặc định
            </label>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} fullWidth>
              Hủy
            </Button>
            <Button type="submit" disabled={!complete || addAccount.isPending} fullWidth>
              {addAccount.isPending ? "Đang lưu..." : "Thêm tài khoản"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
