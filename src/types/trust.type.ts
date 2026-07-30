// ─────────────────────────────────────────────────────────────────────────────
// trust.type.ts
// Feedback, Reputation, Report, Refund, RefundDispute types.
// Source: openapi.yaml — components/schemas (Feedback*, Reputation*, Report*, Refund*, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPage, ResourceID } from './common.type';
import type { AccountID, AccountSummary } from './account.type';
import type { OrderID } from './order.type';
import type { ProductSPUID } from './catalog.type';

// ── Primitive IDs & Enums ─────────────────────────────────────────────────────

/** Pattern: ^fbk_[0-9a-hjkmnp-tv-z]{13}$ */
export type FeedbackID = string;

/** Pattern: ^rpt_[0-9a-hjkmnp-tv-z]{13}$ */
export type ReportID = string;

/** Pattern: ^rfd_[0-9a-hjkmnp-tv-z]{13}$ */
export type RefundID = string;

/** Pattern: ^dsp_[0-9a-hjkmnp-tv-z]{13}$ */
export type RefundDisputeID = string;

export type FeedbackDirection = 'buyer-to-seller' | 'seller-to-buyer';

export type ReputationRole = 'seller' | 'buyer';

export type ReportStatus = 'open' | 'reviewing' | 'actioned' | 'dismissed';

export type ReportReason = 'scam' | 'counterfeit' | 'prohibited' | 'harassment' | 'spam' | 'inappropriate' | 'other';

export type ReportRefType = 'listing' | 'account' | 'message' | 'review' | 'review-reply';

/** What a moderator did about an upheld report. "none" goes with a dismissal. */
export type ReportAction = 'none' | 'listing-removed' | 'message-removed' | 'account-suspended' | 'warning';

/**
 * A refund goes straight to seller review; buyer does not ship goods back first.
 */
export type RefundStatus = 'awaiting-seller-review' | 'disputed' | 'accepted' | 'rejected' | 'cancelled';

export type DisputeStatus = 'open' | 'seller-wins' | 'buyer-wins';

/** A ruling — open is not one of the choices */
export type DisputeOutcome = 'seller-wins' | 'buyer-wins';

// ── Feedback ──────────────────────────────────────────────────────────────────

export interface Feedback {
  id: FeedbackID;
  order_id: OrderID;
  rater: AccountSummary;
  ratee_id: AccountID;
  direction: FeedbackDirection;
  rating: number;
  comment: string;
  created_at: string;
  /**
   * Null while the rating is still blind.
   * Only published feedback is visible to anyone but its author.
   */
  published_at?: string | null;
}

/** Cursor-paginated. Source: openapi.yaml — FeedbackPage */
export type FeedbackPage = CursorPage<Feedback>;

/** Both directions on one order, as far as the caller is allowed to see */
export interface OrderFeedback {
  theirs_submitted: boolean;
  mine?: Feedback | null;
  /** Present only once published */
  theirs?: Feedback | null;
}

export interface SubmitFeedbackRequest {
  rating: number;
  comment?: string;
}

// ── Reputation ────────────────────────────────────────────────────────────────

/** Recomputed, never written directly */
export interface Reputation {
  account_id: AccountID;
  role: ReputationRole;
  /** Average transaction feedback from 1 to 5. Zero when there is none. */
  rating_average: number;
  rating_count: number;
  /** Average product-review rating. Always zero for the buyer role. */
  review_rating_average: number;
  review_rating_count: number;
  completed_orders: number;
  cancelled_orders: number;
  updated_at: string;
}

// ── Report ────────────────────────────────────────────────────────────────────

export interface Report {
  id: ReportID;
  ref_type: ReportRefType;
  /** Opaque id of the reported thing */
  ref_id: string;
  reason: ReportReason;
  detail: string;
  status: ReportStatus;
  created_at: string;
  action_taken?: ReportAction | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
}

/** Cursor-paginated. Source: openapi.yaml — ReportPage */
export type ReportPage = CursorPage<Report>;

export interface SubmitReportRequest {
  ref_type: ReportRefType;
  ref_id: string;
  reason: ReportReason;
  detail?: string;
}

export interface ResolveReportRequest {
  status: 'actioned' | 'dismissed';
  action_taken: ReportAction;
  note?: string;
}

// ── Refund ────────────────────────────────────────────────────────────────────

export interface Refund {
  id: RefundID;
  order_id: OrderID;
  buyer_id: AccountID;
  status: RefundStatus;
  reason: string;
  /** The buyer's evidence */
  attachments: ResourceID[];
  /** `created_at` + 48h. Silence past it is a full refund, applied by a job. */
  review_deadline_at: string;
  created_at: string;
  rejection_reason?: string | null;
  /** The leg sending the goods back */
  return_transport_id?: string | null;
  seller_decided_at?: string | null;
  /** Set when a rejection opened a dispute */
  dispute_id?: RefundDisputeID | null;
}

/** Cursor-paginated. Source: openapi.yaml — RefundPage */
export type RefundPage = CursorPage<Refund>;

export interface CreateRefundRequest {
  reason: string;
  /** Evidence is mandatory */
  attachments: ResourceID[];
}

export interface RejectRefundRequest {
  reason: string;
  /** Counter-evidence is mandatory */
  attachments: ResourceID[];
}

// ── Refund Dispute ────────────────────────────────────────────────────────────

export interface RefundDispute {
  id: RefundDisputeID;
  refund_id: RefundID;
  order_id: OrderID;
  seller_id: AccountID;
  buyer_id: AccountID;
  status: DisputeStatus;
  /** The seller's grounds for refusing */
  reason: string;
  /** The seller's evidence. The buyer's stays on the refund. */
  attachments: ResourceID[];
  created_at: string;
  resolution_note?: string | null;
  resolved_at?: string | null;
  /** The moderator who ruled */
  resolved_by_id?: AccountID | null;
}

/** Cursor-paginated. Source: openapi.yaml — RefundDisputePage */
export type RefundDisputePage = CursorPage<RefundDispute>;

export interface DisputeRulingRequest {
  outcome: DisputeOutcome;
  note: string;
}
