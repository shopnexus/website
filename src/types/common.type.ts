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

export interface PaginatedPage<T> {
  items: T[];
  next_cursor?: string | null;
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

export interface OptionList {
  items: Option[];
}

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
