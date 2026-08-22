"use client";

import { useEffect } from "react";
import { DEFAULT_CURRENCY } from "@/hooks/api/useWallet";
import type { useWalletInspector } from "../_hooks/useWalletInspector";
import AccountPicker from "./AccountPicker";
import AdjustmentForm from "./AdjustmentForm";
import TaxVerificationForm from "./TaxVerificationForm";
import WalletBalances from "./WalletBalances";

/**
 * The money behind a row, as a panel beside the queue rather than a page of its own.
 *
 * A side panel and not a dialog on purpose: deciding a payout means reading the balance
 * and the request at the same time, and a centred modal covers the row being decided.
 */
export default function WalletInspector({
  inspector,
}: {
  inspector: ReturnType<typeof useWalletInspector>;
}) {
  const { isOpen, close, selected } = inspector;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const currency = inspector.wallets[0]?.currency ?? DEFAULT_CURRENCY;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={close}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tra cứu ví"
        className="bg-surface w-full max-w-xl h-full overflow-y-auto shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 bg-surface px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-sm font-bold text-on-surface">Tra cứu ví</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          {!selected ? (
            <AccountPicker
              term={inspector.term}
              onTermChange={inspector.setTerm}
              accounts={inspector.accounts}
              searching={inspector.searching}
              searched={inspector.searched}
              onSelect={inspector.select}
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-headline-sm text-on-surface truncate">
                    {selected.name}
                  </div>
                  <div className="font-body-sm text-on-surface-variant truncate">
                    {selected.email ?? selected.phone ?? selected.username ?? "—"}
                  </div>
        <div className="font-mono text-label-xs text-on-surface-variant mt-0.5">
                    {selected.id}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={inspector.clearSelection}
                  className="font-label-md text-primary hover:underline shrink-0 cursor-pointer"
                >
                  Đổi tài khoản
                </button>
              </div>

              <WalletBalances wallets={inspector.wallets} loading={inspector.walletsLoading} />

              <AdjustmentForm accountId={selected.id} currency={currency} />
              <TaxVerificationForm accountId={selected.id} />
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
