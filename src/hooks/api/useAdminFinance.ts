"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import {
	postAdminIdentityDocumentsByIdVerdict,
	postAdminTaxInfoByAccountIdVerification,
	postAdminWalletsByAccountIdAdjustments,
	postAdminWithdrawalsByIdApproval,
	postAdminWithdrawalsByIdRejection,
} from "@/api/generated/sdk.gen"
import {
	getAdminAccountsOptions,
	getAdminAccountsQueryKey,
	getAdminIdentityDocumentsInfiniteOptions,
	getAdminIdentityDocumentsQueryKey,
	getAdminPaymentSessionsOptions,
	getAdminPaymentSessionsQueryKey,
	getAdminWalletsByAccountIdOptions,
	getAdminWalletsByAccountIdQueryKey,
	getAdminWithdrawalsInfiniteOptions,
	getAdminWithdrawalsQueryKey,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	AccountId,
	IdentityDocumentId,
	IdentityStatus,
	IdentityVerdictRequest,
	PaymentSessionId,
	PaymentSessionKind,
	PaymentSessionStatus,
	TaxVerificationRequest,
	WalletAdjustmentRequest,
	WithdrawalApprovalRequest,
	WithdrawalRejectionRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { flattenPages, pagePagination, totalCountOf } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/**
 * The staff money and identity desk: the withdrawal queue, the KYC queue, the payment
 * session ledger, and the wallet an admin inspects behind any of them.
 *
 * The operation ids are read back out of the generated query-key builders rather than
 * spelled as literals, which buys what `OPERATIONS` buys on the shopper side: rename an
 * operation in the spec and this stops compiling, instead of quietly invalidating
 * nothing. They live here rather than in `api/invalidate.ts` because nothing outside the
 * staff surface has any reason to drop these caches.
 */
const ADMIN_OPS = {
	accounts: getAdminAccountsQueryKey()[0]._id,
	identityDocuments: getAdminIdentityDocumentsQueryKey()[0]._id,
	paymentSessions: getAdminPaymentSessionsQueryKey()[0]._id,
	wallets: getAdminWalletsByAccountIdQueryKey({ path: { accountID: "" } })[0]._id,
	withdrawals: getAdminWithdrawalsQueryKey()[0]._id,
} as const

/** Partial key matching, exactly like `invalidate()` — every page and filter of each. */
function invalidateAdmin(client: QueryClient, ...operations: string[]): Promise<void> {
	return Promise.all(
		operations.map((id) => client.invalidateQueries({ queryKey: [{ _id: id }] })),
	).then(() => undefined)
}

/**
 * Everything a withdrawal decision moves.
 *
 * The debit landed when the seller raised the request, so approving records a transfer
 * that already left the balance and rejecting credits it back — either way the queue, the
 * payee's balances and the ledger behind them are one fact that just changed, and
 * refreshing the list alone would leave an admin looking at a balance from before their
 * own decision.
 */
function invalidateWithdrawalSet(client: QueryClient): Promise<void> {
	return Promise.all([
		invalidateAdmin(client, ADMIN_OPS.withdrawals, ADMIN_OPS.wallets, ADMIN_OPS.paymentSessions),
		invalidate(client, OPERATIONS.withdrawals, OPERATIONS.wallets, OPERATIONS.walletTransactions),
	]).then(() => undefined)
}

// ── Withdrawal queue ─────────────────────────────────────────────────────────

/**
 * Cash-outs awaiting a person, oldest money first.
 *
 * Filtered by the underlying *session* status rather than by the outcome a client
 * renders: `awaiting-review` covers both `pending` and `processing`, and the route only
 * knows the five statuses. Page-paginated, so it walks `page` and stops at `total_count`.
 */
export function useAdminWithdrawals(status: PaymentSessionStatus | undefined, limit = 20) {
	const query = useInfiniteQuery({
		...getAdminWithdrawalsInfiniteOptions({ query: { status, limit } }),
		...pagePagination,
	})

	const withdrawals = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, withdrawals, totalCount: totalCountOf(query.data) }
}

/**
 * Pay it out. `provider_ref` is the bank's own reference for the transfer — the only
 * handle on the money once it is outside the platform, which is why the form asks for it.
 */
export function useApproveWithdrawal() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: PaymentSessionId
			body: WithdrawalApprovalRequest
		}) => {
			const { data } = await postAdminWithdrawalsByIdApproval({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateWithdrawalSet(queryClient),
	})
}

/** Refuse it and give the money back. The reason is what the payee is shown. */
export function useRejectWithdrawal() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: PaymentSessionId
			body: WithdrawalRejectionRequest
		}) => {
			const { data } = await postAdminWithdrawalsByIdRejection({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateWithdrawalSet(queryClient),
	})
}

// ── Identity queue ───────────────────────────────────────────────────────────

/**
 * Documents awaiting a verdict, with the account each belongs to.
 *
 * The platform stores no document number and no scan — the vendor performs the check and
 * only its verdict is kept — so a queue entry is the subject, the type and which vendor
 * answered. Page-paginated like the withdrawal queue.
 */
export function useAdminIdentityDocuments(status: IdentityStatus | undefined, limit = 20) {
	const query = useInfiniteQuery({
		...getAdminIdentityDocumentsInfiniteOptions({ query: { status, limit } }),
		...pagePagination,
	})

	const entries = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, entries, totalCount: totalCountOf(query.data) }
}

/**
 * Record the verdict. The two domain rules are enforced by the server and mirrored by the
 * form: a rejection carries a reason, and a document type that runs out cannot be verified
 * without its expiry — a status alone would let an expired passport pass the payout gate
 * for ever.
 *
 * A verdict also flips `identity_verified` on the account, which the staff account list
 * shows, so that read is dropped alongside the queue.
 */
export function useRecordIdentityVerdict() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: IdentityDocumentId
			body: IdentityVerdictRequest
		}) => {
			const { data } = await postAdminIdentityDocumentsByIdVerdict({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidateAdmin(queryClient, ADMIN_OPS.identityDocuments, ADMIN_OPS.accounts),
	})
}

// ── Payment session ledger ───────────────────────────────────────────────────

/**
 * Every account's payment sessions, for tying platform totals to what the rails report.
 *
 * Deliberately a single page. The spec declares this route cursor-paginated, but the
 * handler behind it reads `page`/`limit` and answers page-shaped `meta` with no
 * `next_cursor` — so the generated client, which only knows how to send `cursor`, has no
 * way to ask for the second page. `total_count` comes back so the screen can say how much
 * it is not showing rather than imply the list is complete, and `limit` is a control
 * rather than a constant for the same reason.
 *
 * Only `kind` and `status` are offered. The spec also documents `account_id`, `from` and
 * `to`, and the handler reads none of them: a filter that silently returns everything is
 * worse than a filter that is not there.
 */
export function useAdminPaymentSessions(
	kind: PaymentSessionKind | undefined,
	status: PaymentSessionStatus | undefined,
	limit = 50,
) {
	const query = useQuery({
		...getAdminPaymentSessionsOptions({ query: { kind, status, limit } }),
	})

	return {
		...query,
		sessions: query.data?.data ?? [],
		totalCount: query.data?.meta.total_count ?? null,
	}
}

// ── Wallet inspector ─────────────────────────────────────────────────────────

/**
 * Somebody's balances, every currency they hold.
 *
 * An account nobody has paid holds no wallet row at all, and the route answers an empty
 * list for it — a real zero, not a missing answer. The caller renders it as such.
 */
export function useAdminWallets(accountId: AccountId | undefined) {
	const query = useQuery({
		...getAdminWalletsByAccountIdOptions({ path: { accountID: accountId! } }),
		select: unwrapData,
		enabled: Boolean(accountId),
	})

	return { ...query, wallets: query.data ?? [] }
}

/**
 * Move money by hand.
 *
 * The correction of last resort, and the only movement with no order or session behind
 * it — so the reason is mandatory, because the ledger note is the whole explanation an
 * audit will ever get. The idempotency key is the caller's: a double-clicked correction
 * would otherwise credit twice, and sending the same key again answers the wallet as it
 * stands rather than posting a second row.
 */
export function useAdjustWallet() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			accountId,
			body,
		}: {
			accountId: AccountId
			body: WalletAdjustmentRequest
		}) => {
			const { data } = await postAdminWalletsByAccountIdAdjustments({
				path: { accountID: accountId },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			Promise.all([
				invalidateAdmin(queryClient, ADMIN_OPS.wallets),
				invalidate(queryClient, OPERATIONS.wallets, OPERATIONS.walletTransactions),
			]),
	})
}

/**
 * Decide a seller's tax registration.
 *
 * `source` is what the verdict was based on and the server requires it: a verdict nobody
 * can trace is one nobody can revisit. There is no staff read of somebody else's
 * registration, so the form records where the check was made rather than showing it.
 */
export function useVerifyTaxInfo() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			accountId,
			body,
		}: {
			accountId: AccountId
			body: TaxVerificationRequest
		}) => {
			const { data } = await postAdminTaxInfoByAccountIdVerification({
				path: { accountID: accountId },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.taxInfo),
	})
}

// ── Finding whose money it is ────────────────────────────────────────────────

/**
 * Accounts matching an exact identifier or part of a display name.
 *
 * The inspector needs an account id and a withdrawal row does not carry one — the payout
 * projection resolves the bank destination but not the payee — so the account holder's
 * name on the request is what a search starts from. Read-only: this hook never writes,
 * and the account surface itself is another screen's job.
 */
export function useAccountSearch(term: string, limit = 8) {
	const query = useQuery({
		...getAdminAccountsOptions({ query: { q: term, limit } }),
		enabled: term.trim().length > 0,
	})

	return { ...query, accounts: query.data?.data ?? [] }
}
