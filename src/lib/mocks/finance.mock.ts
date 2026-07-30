
import type {
  Wallet,
  WalletList,
  WalletTransaction,
  WalletTransactionPage,
  PaymentSession,
  PaymentSessionPage,
  Transaction,
  TransactionList,
  BankAccount,
  BankAccountList,
  Withdrawal,
  WithdrawalPage,
  TaxInfo,
} from '@/types/finance.type';
import { mockAccountID, mockSellerAccountID } from './account.mock';


export const mockWallet: Wallet = {
  account_id: mockAccountID,
  currency: 'VND',
  available_balance: 1250000,
  held_balance: 3500000,
  created_at: '2024-03-15T08:00:00Z',
};

export const mockSellerWallet: Wallet = {
  account_id: mockSellerAccountID,
  currency: 'VND',
  available_balance: 45000000,
  held_balance: 7000000,
  created_at: '2023-01-10T00:00:00Z',
};

export const mockWalletList: WalletList = {
  data: [mockWallet],
};


export const mockWalletTransactionPage: WalletTransactionPage = {
  data: [
    {
      seq: 5,
      currency: 'VND',
      kind: 'escrow-hold',
      available_delta: -3500000,
      held_delta: 3500000,
      available_after: 1250000,
      held_after: 3500000,
      note: 'Escrow hold for order ord_fv2cpg50vkrfp',
      created_at: '2025-06-20T09:15:00Z',
      ref_id: 'ord_fv2cpg50vkrfp',
      ref_type: 'order',
    },
    {
      seq: 4,
      currency: 'VND',
      kind: 'topup',
      available_delta: 5000000,
      held_delta: 0,
      available_after: 4750000,
      held_after: 0,
      note: 'Top-up via VNPay QR',
      created_at: '2025-06-15T10:00:00Z',
      ref_id: 'pay_topup0000001',
      ref_type: 'payment-session',
    },
    {
      seq: 3,
      currency: 'VND',
      kind: 'refund',
      available_delta: 250000,
      held_delta: 0,
      available_after: -250000,
      held_after: 0,
      note: 'Refund for cancelled order',
      created_at: '2025-06-10T14:00:00Z',
    },
  ] as WalletTransaction[],
  meta: { next_cursor: null },
};


export const mockPaymentSession: PaymentSession = {
  id: 'pay_7bq2xn4tw9yef',
  kind: 'buyer-checkout',
  status: 'success',
  currency: 'VND',
  total_amount: 3500000,
  amount_paid: 3500000,
  note: 'Checkout - ord_fv2cpg50vkrfp',
  created_at: '2025-06-20T09:15:00Z',
  expired_at: '2025-06-20T09:45:00Z',
  from_id: mockAccountID,
  to_id: mockSellerAccountID,
  paid_at: '2025-06-20T09:20:00Z',
};

export const mockPaymentSessionPage: PaymentSessionPage = {
  data: [
    mockPaymentSession,
    {
      ...mockPaymentSession,
      id: 'pay_session2nd001',
      status: 'pending',
      amount_paid: 0,
      paid_at: null,
      created_at: '2025-06-22T10:00:00Z',
    },
  ],
  meta: { next_cursor: null },
};


export const mockTransaction: Transaction = {
  id: 'txn_5wtc4mx8jd2qr',
  session_id: 'pay_7bq2xn4tw9yef',
  status: 'success',
  payment_option: 'vnpay-qr',
  amount: 3500000,
  currency: 'VND',
  note: 'VNPay QR payment for checkout',
  created_at: '2025-06-20T09:18:00Z',
  settled_at: '2025-06-20T09:20:00Z',
  checkout_url: null,
  error: null,
  reverses_id: null,
};

export const mockTransactionList: TransactionList = {
  data: [mockTransaction],
};


export const mockBankAccount: BankAccount = {
  id: 'bnk_2qr5wtc4mx8jd',
  bank_code: 'vcb',
  account_number_masked: '****1234',
  account_holder: 'NGUYEN VAN AN',
  is_default: true,
  created_at: '2024-04-10T09:00:00Z',
};

export const mockBankAccountList: BankAccountList = {
  data: [
    mockBankAccount,
    {
      id: 'bnk_account2nd001',
      bank_code: 'tcb',
      account_number_masked: '****5678',
      account_holder: 'NGUYEN VAN AN',
      is_default: false,
      created_at: '2024-06-01T10:00:00Z',
    },
  ],
};


export const mockWithdrawal: Withdrawal = {
  id: 'pay_withdrawal001',
  status: 'success',
  currency: 'VND',
  amount: 1000000,
  bank_account: mockBankAccount,
  created_at: '2025-06-10T09:00:00Z',
  resolved_at: '2025-06-10T11:00:00Z',
  resolution_note: 'Đã chuyển thành công',
  resolved_by_id: null,
};

export const mockWithdrawalPage: WithdrawalPage = {
  data: [
    mockWithdrawal,
    {
      ...mockWithdrawal,
      id: 'pay_withdrawal002',
      status: 'pending',
      amount: 2000000,
      created_at: '2025-06-22T10:00:00Z',
      resolved_at: null,
      resolution_note: null,
    },
  ],
  meta: { next_cursor: null },
};


export const mockTaxInfo: TaxInfo = {
  tax_code: '0123456789',
  tax_code_type: 'individual',
  legal_name: 'NGUYEN VAN AN',
  verification_status: 'verified',
  created_at: '2024-05-01T10:00:00Z',
  verified_at: '2024-05-02T09:00:00Z',
};
