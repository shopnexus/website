// ─────────────────────────────────────────────────────────────────────────────
// finance.type.ts
// Wallet, BankAccount, PaymentSession, Transaction, Withdrawal, TaxInfo types.
// Source: openapi.yaml — components/schemas (Wallet*, Bank*, Payment*, Transaction*, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { CurrencyCode, PaginatedPage } from './common.type';
import type { AccountID } from './account.type';

// ── Primitive IDs & Enums ─────────────────────────────────────────────────────

/** Pattern: ^pay_[0-9a-hjkmnp-tv-z]{13}$ */
export type PaymentSessionID = string;

/** Pattern: ^txn_[0-9a-hjkmnp-tv-z]{13}$ */
export type TransactionID = string;

/** Pattern: ^bnk_[0-9a-hjkmnp-tv-z]{13}$ */
export type BankAccountID = string;

/**
 * What the money is for — routes the flow.
 * A client cannot pick this.
 */
export type PaymentSessionKind =
  | 'buyer-checkout'
  | 'seller-confirmation-fee'
  | 'seller-payout'
  | 'withdrawal';

export type PaymentSessionStatus = 'pending' | 'processing' | 'success' | 'cancelled' | 'failed';

/** A leg goes pending → success or failed. Success is terminal. */
export type TransactionStatus = 'pending' | 'success' | 'failed';

export type WalletTransactionKind =
  | 'topup'
  | 'escrow-hold'
  | 'escrow-release'
  | 'payout'
  | 'refund'
  | 'withdrawal'
  | 'fee'
  | 'adjustment';

export type TaxCodeType = 'individual' | 'business' | 'household';

export type TaxVerificationStatus = 'pending' | 'verified' | 'rejected';

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface Wallet {
  account_id: AccountID;
  currency: CurrencyCode;
  /** Spendable and withdrawable */
  available_balance: number;
  /** Locked in escrow; not the owner's to draw yet */
  held_balance: number;
  created_at: string;
}

export interface WalletList {
  items: Wallet[];
}

export interface WalletTransaction {
  seq: number;
  currency: CurrencyCode;
  kind: WalletTransactionKind;
  /** Signed change to the available balance */
  available_delta: number;
  /** Signed change to the held balance */
  held_delta: number;
  available_after: number;
  held_after: number;
  note: string;
  created_at: string;
  group_id?: string | null;
  ref_id?: string | null;
  ref_type?: 'order' | 'payment-session' | null;
}

export type WalletTransactionPage = PaginatedPage<WalletTransaction>;

export interface WalletAdjustmentRequest {
  currency: CurrencyCode;
  reason: string;
  idempotency_key: string;
  available_delta?: number;
  held_delta?: number;
}

// ── Payment Session ───────────────────────────────────────────────────────────

export interface PaymentSession {
  id: PaymentSessionID;
  kind: PaymentSessionKind;
  status: PaymentSessionStatus;
  currency: CurrencyCode;
  total_amount: number;
  /** Sum of the settled legs */
  amount_paid: number;
  note: string;
  created_at: string;
  /** A session still unsettled past this point is voided by a job */
  expired_at: string;
  /** The payer. Null means the platform itself. */
  from_id?: AccountID | null;
  /** The payee. Null means the platform itself. */
  to_id?: AccountID | null;
  paid_at?: string | null;
}

export type PaymentSessionPage = PaginatedPage<PaymentSession>;

export interface StartPaymentRequest {
  payment_option: string;
  /** Omit to tender the whole outstanding balance */
  amount?: number;
  /** Where the gateway sends the payer back */
  return_url?: string;
}

// ── Transaction ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: TransactionID;
  session_id: PaymentSessionID;
  status: TransactionStatus;
  /** A payment option slug from the common module */
  payment_option: string;
  /** Signed — positive is a charge, negative is a reversal */
  amount: number;
  currency: CurrencyCode;
  note: string;
  created_at: string;
  /** Where to send the payer for this leg. Null once rail no longer needs it. */
  checkout_url?: string | null;
  error?: string | null;
  expired_at?: string | null;
  /** The leg this one reverses. Set on reversals, null on originals. */
  reverses_id?: TransactionID | null;
  settled_at?: string | null;
}

export interface TransactionList {
  items: Transaction[];
}

// ── Bank Account ──────────────────────────────────────────────────────────────

export interface BankAccount {
  id: BankAccountID;
  /** Bank identifier, e.g. "vcb" */
  bank_code: string;
  /** Only the last digits */
  account_number_masked: string;
  account_holder: string;
  is_default: boolean;
  created_at: string;
}

export interface BankAccountList {
  items: BankAccount[];
}

export interface CreateBankAccountRequest {
  bank_code: string;
  account_number: string;
  account_holder: string;
  is_default?: boolean;
}

export interface UpdateBankAccountRequest {
  /** The only mutable field */
  is_default: true;
}

// ── Withdrawal ────────────────────────────────────────────────────────────────

export interface Withdrawal {
  id: PaymentSessionID;
  status: PaymentSessionStatus;
  currency: CurrencyCode;
  amount: number;
  bank_account: BankAccount;
  created_at: string;
  resolution_note?: string | null;
  resolved_at?: string | null;
  resolved_by_id?: AccountID | null;
}

export type WithdrawalPage = PaginatedPage<Withdrawal>;

export interface CreateWithdrawalRequest {
  currency: CurrencyCode;
  amount: number;
  bank_account_id: BankAccountID;
}

export interface WithdrawalApprovalRequest {
  note: string;
  provider_ref?: string;
}

export interface WithdrawalRejectionRequest {
  reason: string;
}

// ── Tax Info ──────────────────────────────────────────────────────────────────

export interface TaxInfo {
  tax_code: string;
  tax_code_type: TaxCodeType;
  legal_name: string;
  verification_status: TaxVerificationStatus;
  created_at: string;
  verified_at?: string | null;
}

export interface UpsertTaxInfoRequest {
  tax_code: string;
  tax_code_type: TaxCodeType;
  legal_name: string;
}

export interface TaxVerificationRequest {
  status: 'verified' | 'rejected';
  source: string;
  note?: string;
}
