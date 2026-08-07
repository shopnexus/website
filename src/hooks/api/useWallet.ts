"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	deleteBankAccountsById,
	deleteWithdrawalsById,
	patchBankAccountsById,
	postBankAccounts,
	postWithdrawals,
	putTaxInfo,
} from "@/api/generated/sdk.gen"
import {
	getBankAccountsOptions,
	getTaxInfoOptions,
	getWalletsByCurrencyTransactionsOptions,
	getWithdrawalsOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	BankAccountId,
	CreateBankAccountRequest,
	CreateWithdrawalRequest,
	CurrencyCode,
	PaymentSessionId,
	UpsertTaxInfoRequest,
	Wallet,
	WalletTransactionKind,
} from "@/api/generated/types.gen"
import { ApiError } from "@/api/api-error"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { unwrapData } from "@/api/unwrap"

/**
 * Whether a failure was the server saying "there is no such row".
 *
 * Two reads here treat a 404 as a value rather than a fault — an unopened wallet has an
 * empty ledger, an unregistered seller has no tax record — and the generated options type
 * their error as the raw envelope, so the runtime type has to be re-established here. The
 * interceptor in `runtime-config` has already turned every failure into an `ApiError`.
 */
function isNotFound(error: unknown): boolean {
	return error instanceof ApiError && error.status === 404
}

/**
 * The currency this marketplace settles in, and the one a seller with no wallet row yet
 * is shown a zero balance for. A wallet is opened by the first movement into it, so
 * "never sold anything" and "sold and withdrew it all" both read as no row at all.
 */
export const DEFAULT_CURRENCY: CurrencyCode = "VND"

/**
 * A zero balance is a real answer, not a missing one.
 *
 * `GET /wallets` returns the rows that exist, and a wallet only exists once money has
 * moved through it — so an account that has never been paid gets `[]`. Rendering that as
 * an error, or as an em dash, tells a seller their balance is unknown when it is known
 * and it is nothing. This fills the gap with an explicit zero for the currency asked
 * about, so the balance card has one shape in every case.
 */
export function walletOrZero(
	wallets: ReadonlyArray<Wallet> | undefined,
	currency: CurrencyCode,
): Pick<Wallet, "currency" | "available_balance" | "held_balance"> {
	const found = wallets?.find((w) => w.currency === currency)
	if (found) return found
	return { currency, available_balance: 0, held_balance: 0 }
}

// ── Ledger ───────────────────────────────────────────────────────────────────

/**
 * One wallet's movements, newest first.
 *
 * Deliberately a single page. The spec declares this route cursor-paginated but its
 * response carries page-shaped `meta` with no `next_cursor`, and the handler behind it
 * actually reads `page` — so the generated client, which only knows how to send `cursor`,
 * has no way to ask for the second page. `total_count` is passed back so the UI can say
 * how much it is not showing rather than imply the list is complete.
 *
 * A currency with no wallet answers 404, which is the same fact as an empty ledger — so
 * the query stays quiet about it and the caller reads an empty list.
 */
export function useWalletLedger(
	currency: CurrencyCode,
	kind?: WalletTransactionKind,
	limit = 50,
) {
	const query = useQuery({
		...getWalletsByCurrencyTransactionsOptions({ path: { currency }, query: { kind, limit } }),
		meta: { silent: true },
		retry: false,
	})

	return {
		...query,
		movements: query.data?.data ?? [],
		totalCount: query.data?.meta.total_count ?? null,
		// A 404 here means "no balance has been opened in this currency", which the
		// caller renders as an empty ledger. Anything else is a genuine failure.
		failed: query.isError && !isNotFound(query.error),
	}
}

// ── Bank accounts ────────────────────────────────────────────────────────────

/** Where a cash-out can be sent. Unpaginated — nobody registers a hundred of them. */
export function useBankAccounts() {
	return useQuery({
		...getBankAccountsOptions(),
		select: unwrapData,
	})
}

export function useAddBankAccount() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateBankAccountRequest) => {
			const { data } = await postBankAccounts({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.bankAccounts),
	})
}

/**
 * Make one the default. `is_default` is the only mutable field — an account number is
 * replaced by registering another and deleting this one, never edited in place.
 */
export function useMakeBankAccountDefault() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: BankAccountId) => {
			const { data } = await patchBankAccountsById({
				path: { id },
				body: { is_default: true },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.bankAccounts),
	})
}

export function useDeleteBankAccount() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: BankAccountId) => {
			await deleteBankAccountsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.bankAccounts),
	})
}

// ── Withdrawals ──────────────────────────────────────────────────────────────

/**
 * Cash-out requests, newest first. One page, because a seller reviews the recent ones
 * and the history behind them is the ledger's job.
 */
export function useWithdrawals(limit = 20) {
	const query = useQuery({
		...getWithdrawalsOptions({ query: { limit } }),
	})
	return { ...query, withdrawals: query.data?.data ?? [] }
}

/**
 * Raise a cash-out.
 *
 * The debit lands immediately — the money leaves the available balance and waits on an
 * admin — so the wallet, its ledger and the request list are all stale on success.
 */
export function useCreateWithdrawal() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateWithdrawalRequest) => {
			const { data } = await postWithdrawals({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () =>
			invalidate(
				queryClient,
				OPERATIONS.withdrawals,
				OPERATIONS.wallets,
				OPERATIONS.walletTransactions,
			),
	})
}

/** Call one off while it is still awaiting review. The debit is reversed. */
export function useCancelWithdrawal() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: PaymentSessionId) => {
			await deleteWithdrawalsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () =>
			invalidate(
				queryClient,
				OPERATIONS.withdrawals,
				OPERATIONS.wallets,
				OPERATIONS.walletTransactions,
			),
	})
}

// ── Tax registration ─────────────────────────────────────────────────────────

/**
 * The seller's tax registration, or nothing.
 *
 * "Nothing registered yet" is a 404 rather than an empty body, so the query is silent and
 * the caller reads `undefined` as "not registered" — an error toast on first visit would
 * report a state every new seller is in.
 */
export function useTaxInfo() {
	const query = useQuery({
		...getTaxInfoOptions(),
		select: unwrapData,
		meta: { silent: true },
		retry: false,
	})
	return {
		...query,
		taxInfo: query.data,
		registered: Boolean(query.data),
		failed: query.isError && !isNotFound(query.error),
	}
}

/**
 * Register or replace it. Replacing resets the verdict, which is why the form warns
 * before overwriting a verified registration.
 */
export function useSaveTaxInfo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: UpsertTaxInfoRequest) => {
			const { data } = await putTaxInfo({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.taxInfo),
	})
}
