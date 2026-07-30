// ─────────────────────────────────────────────────────────────────────────────
// admin.type.ts
// Admin/moderator specific views and actions.
// Source: openapi.yaml — components/schemas (Admin*, Identity*, Takedown*, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { OffsetPage, CursorPage } from './common.type';
import type {
  AccountID,
  AccountRole,
  AccountStatus,
  AccountSummary,
  IdentityDocument,
} from './account.type';
import type { Report } from './trust.type';

// ── Admin Account ─────────────────────────────────────────────────────────────

/**
 * The staff view of an account.
 * Carries the identifiers and the suspension state that PublicAccount withholds.
 */
export interface AdminAccount {
  id: AccountID;
  name: string;
  role: AccountRole;
  status: AccountStatus;
  email_verified: boolean;
  identity_verified: boolean;
  created_at: string;
  email?: string | null;
  phone?: string | null;
  username?: string | null;
  /** Null while suspended means the suspension is permanent */
  suspended_until?: string | null;
  suspension_reason?: string | null;
}

/** Offset/page-paginated. Source: openapi.yaml — AdminAccountPage */
export type AdminAccountPage = OffsetPage<AdminAccount>;

// ── Admin Identity Document Queue ─────────────────────────────────────────────

/** A queue entry — needs the subject alongside the document */
export interface AdminIdentityDocument {
  document: IdentityDocument;
  account: AccountSummary;
}

/** Offset/page-paginated. Source: openapi.yaml — IdentityDocumentPage */
export type IdentityDocumentPage = OffsetPage<AdminIdentityDocument>;

// ── Admin Report Queue ────────────────────────────────────────────────────────

/** A queue entry — moderator needs reporter and target beside the report itself */
export interface AdminReport {
  report: Report;
  reporter: AccountSummary;
  /** How many other unresolved reports name the same target */
  open_reports_against_target: number;
  /** The reported content, shaped by ref_type */
  target?: Record<string, unknown>;
  resolved_by?: AccountSummary | null;
}

/** Offset/page-paginated. Source: openapi.yaml — AdminReportPage */
export type AdminReportPage = OffsetPage<AdminReport>;

// ── Admin Refund Dispute Queue ────────────────────────────────────────────────

/**
 * A queue row: the open dispute round plus the refund it belongs to.
 * Source: openapi.yaml — AdminDisputeQueueEntry (used in RefundDisputePage)
 */
export interface AdminDisputeQueueEntry {
  refund: import('./trust.type').Refund;
  round: DisputeRound;
}

/** Cursor-paginated. Source: openapi.yaml — RefundDisputePage (admin view) */
export type AdminRefundDisputePage = CursorPage<AdminDisputeQueueEntry>;

// ── Dispute Round ─────────────────────────────────────────────────────────────

export interface DisputeRound {
  id: string;
  dispute_id: import('./trust.type').RefundDisputeID;
  reason: string;
  attachments: string[];
  created_at: string;
  outcome?: import('./trust.type').DisputeOutcome | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  resolved_by_id?: AccountID | null;
}

// ── Admin Mutations ───────────────────────────────────────────────────────────

export interface TakedownRequest {
  reason: string;
  notify_seller?: boolean;
}
