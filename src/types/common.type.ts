// ─────────────────────────────────────────────────────────────────────────────
// common.type.ts
// Primitive and shared types used across all modules.
// Source: openapi.yaml — components/schemas (shared primitives)
// ─────────────────────────────────────────────────────────────────────────────

// ── Primitive IDs ────────────────────────────────────────────────────────────

/** Pattern: ^res_[0-9a-hjkmnp-tv-z]{13}$ */
export type ResourceID = string;

/** ISO 4217, e.g. "VND", "USD" */
export type CurrencyCode = string;

// ── Resource (file/media) ─────────────────────────────────────────────────────

export interface Resource {
  id: ResourceID;
  /** Storage backend, kebab-case — "s3", "minio", "local" */
  provider: string;
  /** e.g. "image/jpeg" */
  mime: string;
  /** Bytes, as read back from storage */
  size: number;
  /** Backend-specific extras — dimensions, duration, CDN path */
  metadata: Record<string, unknown>;
  created_at: string;
  /** Null until the upload was confirmed */
  completed_at?: string | null;
  /** Content hash, used to share one stored object between identical uploads */
  checksum?: string | null;
  /** Short-lived URL to fetch the bytes. Null while unconfirmed */
  url?: string | null;
  url_expires_at?: string | null;
}

export interface CreateUploadRequest {
  mime: string;
  /** Expected byte count */
  size: number;
  /** Content hash if known — a match skips the upload */
  checksum?: string;
}

export interface UploadTicket {
  resource: Resource;
  /** PUT the bytes here, then confirm. Null when checksum matched */
  upload_url?: string | null;
  upload_expires_at?: string | null;
}

// ── Pagination ────────────────────────────────────────────────────────────────

/**
 * Pagination metadata for offset/page-based pagination.
 * Source: openapi.yaml — PageMeta
 */
export interface PageMeta {
  /** 1-based page number */
  page: number;
  limit: number;
  /**
   * Total matching rows. Explicitly null (not absent) for ranked/top-K queries
   * where the full count is not computed.
   */
  total_count: number | null;
}

/**
 * Pagination metadata for cursor-based pagination.
 * Source: openapi.yaml — CursorMeta
 */
export interface CursorMeta {
  /**
   * Pass as `cursor` to get the next page. Null on the last page.
   * Always present so "no more pages" is a value rather than a missing key.
   */
  next_cursor: string | null;
}

/**
 * A page response with cursor-based pagination.
 * Shape: { data: T[], meta: CursorMeta }
 * Used by: OrderPage, OrderItemPage, OfferPage, ConversationPage, MessagePage,
 *   FeedbackPage, ReportPage, RefundPage, RefundDisputePage, NotificationPage,
 *   ReviewPage, WalletTransactionPage, PaymentSessionPage, WithdrawalPage, etc.
 */
export interface CursorPage<T> {
  data: T[];
  meta: CursorMeta;
}

/**
 * A page response with offset/page-number pagination.
 * Shape: { data: T[], meta: PageMeta }
 * Used by: CartItemPage, DraftOrderPage, AdminAccountPage, IdentityDocumentPage,
 *   AdminReportPage, AccountSummaryPage, ListingPage, TagPage, etc.
 */
export interface OffsetPage<T> {
  data: T[];
  meta: PageMeta;
}

/**
 * An unpaginated list response.
 * Shape: { data: T[] }
 * Used by: ContactList, CategoryList, BankAccountList, OptionList, DeviceList,
 *   OAuthIdentityList, IdentityDocumentList, TransactionList, WalletList,
 *   NotificationPreferenceList, TagList, etc.
 */
export interface DataList<T> {
  data: T[];
}

// ── API Error ─────────────────────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ── Option (transport / payment integration) ──────────────────────────────────

/**
 * Stable kebab-case identifier, marketplace-wide. e.g. "ghn-express"
 * Pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
 */
export type OptionSlug = string;

/**
 * High-level grouping key. e.g. "transport", "payment"
 * Pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
 */
export type OptionType = string;

export interface Option {
  id: OptionSlug;
  type: OptionType;
  /** Sub-grouping key, kebab-case — "vnpay", "ghn" */
  provider: string;
  name: string;
  description: string;
  priority: number;
  is_enabled: boolean;
  /** Non-secret configuration only */
  data: Record<string, unknown>;
  created_at: string;
  logo?: Resource | null;
  /** The seller who configured it. Null means system-provided */
  owner_id?: string | null;
}

export interface OptionList extends DataList<Option> {}

export interface CreateOptionRequest {
  id: OptionSlug;
  type: OptionType;
  provider: string;
  name: string;
  description?: string;
  is_enabled?: boolean;
  priority?: number;
  logo_resource_id?: ResourceID;
  data?: Record<string, unknown>;
}

export interface UpdateOptionRequest {
  name?: string;
  description?: string;
  is_enabled?: boolean;
  priority?: number;
  logo_resource_id?: ResourceID | null;
  data?: Record<string, unknown>;
}
