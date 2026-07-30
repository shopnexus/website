// ─────────────────────────────────────────────────────────────────────────────
// catalog.type.ts
// Listing, SKU, Category, Tag, Review, Favorites types.
// Source: openapi.yaml — components/schemas (Listing*, Sku, Category*, Tag*, Review*, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { Resource, ResourceID, CurrencyCode, PaginatedPage } from './common.type';
import type { AccountID, AccountSummary } from './account.type';

// ── Primitive IDs & Enums ─────────────────────────────────────────────────────

/** Pattern: ^spu_[0-9a-hjkmnp-tv-z]{13}$ */
export type ProductSPUID = string;

/** Pattern: ^sku_[0-9a-hjkmnp-tv-z]{13}$ */
export type ProductSKUID = string;

/** Pattern: ^cat_[0-9a-hjkmnp-tv-z]{13}$ */
export type CategoryID = string;

/** Pattern: ^fbk_[0-9a-hjkmnp-tv-z]{13}$ */
export type ReviewID = string;

/** Pattern: ^rpl_[0-9a-hjkmnp-tv-z]{13}$ */
export type ReviewReplyID = string;

/**
 * A tag's id is its slug. Pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
 * e.g. "handmade"
 */
export type TagSlug = string;

/** Item condition — this is a marketplace for used goods */
export type ListingCondition = 'new' | 'used' | 'damaged';

/**
 * Lifecycle and moderation in one column.
 * hidden: live listing the seller took down.
 */
export type ListingStatus = 'draft' | 'pending' | 'active' | 'hidden';

/**
 * fixed: can be bought straight from listing page.
 * negotiable: must go through an offer first.
 */
export type PriceMode = 'fixed' | 'negotiable';

/** buyer: adds fee to checkout. seller: deducts from payout. */
export type ShippingPaidBy = 'buyer' | 'seller';

// ── Category ──────────────────────────────────────────────────────────────────

export interface Category {
  id: CategoryID;
  name: string;
  description: string;
  /** Null for a root category */
  parent_id?: CategoryID | null;
}

export interface CategoryList {
  items: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  parent_id?: CategoryID;
}

/** Every field optional. Setting parent to null makes it a root. */
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parent_id?: CategoryID | null;
}

// ── Tag ───────────────────────────────────────────────────────────────────────

export interface Tag {
  slug: TagSlug;
  description?: string | null;
}

export interface TagList {
  items: Tag[];
}

export interface CreateTagRequest {
  slug: TagSlug;
  description?: string;
}

// ── SKU / Stock ───────────────────────────────────────────────────────────────

export interface Stock {
  sku_id: ProductSKUID;
  /** Total on hand */
  stock: number;
  /** Held by paid but unconfirmed items */
  reserved: number;
  /** Total minus reserved */
  available: number;
}

export interface Sku {
  id: ProductSKUID;
  /** Smallest unit of the listing's currency */
  price: number;
  /** Variant attributes such as size and colour */
  attributes: Record<string, unknown>;
  /** Weight and dimensions for shipping quote */
  package_details: Record<string, unknown>;
  /** Empty means fall back to the listing gallery */
  images: Resource[];
  created_at: string;
  stock?: Stock;
}

export interface CreateSkuRequest {
  price: number;
  attributes: Record<string, unknown>;
  package_details: Record<string, unknown>;
  stock?: number;
  attachments?: ResourceID[];
}

/** Every field optional */
export interface UpdateSkuRequest {
  price?: number;
  attributes?: Record<string, unknown>;
  package_details?: Record<string, unknown>;
  attachments?: ResourceID[];
}

export interface SetStockRequest {
  stock: number;
}

// ── Listing ───────────────────────────────────────────────────────────────────

/** The card shown in a feed */
export interface Listing {
  id: ProductSPUID;
  slug: string;
  name: string;
  status: ListingStatus;
  condition: ListingCondition;
  price_mode: PriceMode;
  currency: CurrencyCode;
  /** The featured variant's price, or cheapest when sorting by price */
  price: number;
  /** Average review rating 1–5, or 0 when there are none */
  rating: number;
  category_id: CategoryID;
  seller: AccountSummary;
  created_at: string;
  cover?: Resource | null;
}

export type ListingPage = PaginatedPage<Listing>;

/** Full listing returned by GET /listings/{id} */
export interface ListingDetail {
  id: ProductSPUID;
  slug: string;
  name: string;
  description: string;
  status: ListingStatus;
  condition: ListingCondition;
  price_mode: PriceMode;
  shipping_paid_by: ShippingPaidBy;
  currency: CurrencyCode;
  specifications: Record<string, unknown>;
  /** Ordered. The first is the cover. */
  images: Resource[];
  category: Category;
  tags: TagSlug[];
  skus: Sku[];
  rating: number;
  seller: AccountSummary;
  created_at: string;
  featured_sku_id?: ProductSKUID | null;
  /** An edit waiting on moderation — visible to owner and staff only */
  pending_edit?: Record<string, unknown> | null;
}

export interface ListingSearchHit {
  listing: Listing;
  /** Higher is more relevant in every mode */
  score: number;
}

export interface ListingSearchResult {
  items: ListingSearchHit[];
  mode: 'lexical' | 'semantic' | 'hybrid';
}

export interface CreateListingRequest {
  name: string;
  description: string;
  category_id: CategoryID;
  condition: ListingCondition;
  price_mode: PriceMode;
  shipping_paid_by: ShippingPaidBy;
  currency: CurrencyCode;
  skus: CreateSkuRequest[];
  /** Ordered. The first becomes the cover. */
  attachments?: ResourceID[];
  specifications?: Record<string, unknown>;
  tags?: TagSlug[];
}

/** Every field optional. Variants are edited through their own endpoints. */
export interface UpdateListingRequest {
  name?: string;
  description?: string;
  category_id?: CategoryID;
  condition?: ListingCondition;
  price_mode?: PriceMode;
  shipping_paid_by?: ShippingPaidBy;
  featured_sku_id?: ProductSKUID;
  attachments?: ResourceID[];
  specifications?: Record<string, unknown>;
  tags?: TagSlug[];
}

export interface AddAttachmentsRequest {
  attachments: ResourceID[];
}

// ── Review ────────────────────────────────────────────────────────────────────

export interface ReviewVoteTally {
  helpful: number;
  not_helpful: number;
  /** The caller's own vote: 1 = helpful, -1 = not helpful. Null if not voted. */
  my_vote?: 1 | -1 | null;
}

export interface ReviewReply {
  id: ReviewReplyID;
  author: AccountSummary;
  /** Whether the author owns the listing */
  is_seller: boolean;
  body: string;
  created_at: string;
}

export interface Review {
  id: ReviewID;
  spu_id: ProductSPUID;
  author: AccountSummary;
  rating: number;
  body: string;
  attachments: Resource[];
  replies: ReviewReply[];
  votes: ReviewVoteTally;
  created_at: string;
}

export type ReviewPage = PaginatedPage<Review>;

export interface SubmitReviewRequest {
  order_id: string;
  rating: number;
  body?: string;
  attachments?: ResourceID[];
}

/** Every field optional */
export interface UpdateReviewRequest {
  rating?: number;
  body?: string;
  attachments?: ResourceID[];
}

export interface SubmitReviewReplyRequest {
  body: string;
}

export interface VoteReviewRequest {
  vote: 1 | -1;
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export interface Favorite {
  spu_id: ProductSPUID;
  created_at: string;
}

export type FavoritePage = PaginatedPage<Favorite>;
