"use client";

import { useState } from "react";
import BalanceSummary from "./_components/BalanceSummary";
import BankAccountList from "./_components/BankAccountList";
import LedgerList from "./_components/LedgerList";
import TaxInfoCard from "./_components/TaxInfoCard";
import WithdrawDialog from "./_components/WithdrawDialog";
import WithdrawalList from "./_components/WithdrawalList";
import { useWalletPage } from "./_hooks/useWalletPage";
import type { WalletTab } from "./types";

const TABS: Array<{ id: WalletTab; label: string; icon: string }> = [
  { id: "balance", label: "Số dư & lịch sử", icon: "account_balance_wallet" },
  { id: "withdrawals", label: "Rút tiền", icon: "payments" },
  { id: "banks", label: "Tài khoản ngân hàng", icon: "account_balance" },
  { id: "tax", label: "Thuế", icon: "receipt_long" },
];

export default function WalletPage() {
  const { tab, setTab, kind, setKind, currency, setCurrency, currencies, wallet, isLoading } =
    useWalletPage();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto pb-12 space-y-8">
      <header>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary tracking-tight mb-2">
          Ví của tôi
        </h1>
        <p className="text-on-surface-variant font-body-md max-w-xl">
          Tiền bán hàng, các khoản đang tạm giữ và mọi yêu cầu rút về ngân hàng.
        </p>
      </header>

      {/* The currency switch appears only where there is a choice: a shop that prices in
          one currency has nothing to pick between, and a single-item selector is a
          control that teaches the reader nothing. */}
      {currencies.length > 1 && (
        <div className="flex gap-2" role="group" aria-label="Loại tiền">
          {currencies.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={currency === code}
              onClick={() => setCurrency(code)}
              className={[
                "px-4 py-2 rounded-full border text-sm font-semibold transition-all cursor-pointer",
                currency === code
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              {code}
            </button>
          ))}
        </div>
      )}

      <BalanceSummary
        balance={wallet}
        loading={isLoading}
        onWithdraw={() => setWithdrawOpen(true)}
      />

      <nav
        className="flex gap-1 overflow-x-auto bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30 hide-scrollbar"
        aria-label="Mục của ví"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => setTab(item.id)}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 cursor-pointer",
              tab === item.id
                ? "bg-surface shadow-sm text-primary"
                : "text-on-surface-variant hover:text-primary",
            ].join(" ")}
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "balance" && (
        <LedgerList currency={currency} kind={kind} onKindChange={setKind} />
      )}
      {tab === "withdrawals" && <WithdrawalList />}
      {tab === "banks" && <BankAccountList />}
      {tab === "tax" && <TaxInfoCard />}

      <WithdrawDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        currency={currency}
        available={wallet.available_balance}
      />
    </div>
  );
}
