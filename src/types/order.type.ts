// ─────────────────────────────────────────────────────────────────────────────
// order.type.ts
// Order, OrderItem, Cart, DraftOrder, Offer, Checkout, Contact types.
// Source: openapi.yaml — components/schemas (Order*, Cart*, Draft*, Offer*, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { CurrencyCode, CursorPage, DataList, OffsetPage, ResourceID } from './common.type';
import type { AccountID } from './account.type';
import type { ProductSKUID, ProductSPUID } from './catalog.type';

// ── Primitive IDs & Enums ─────────────────────────────────────────────────────

/** Pattern: ^ord_[0-9a-hjkmnp-tv-z]{13}$ */
export type OrderID = string;

/** Pattern: ^itm_[0-9a-hjkmnp-tv-z]{13}$ */
export type OrderItemID = string;

/** Pattern: ^drf_[0-9a-hjkmnp-tv-z]{13}$ */
export type DraftOrderID = string;

/** Pattern: ^crt_[0-9a-hjkmnp-tv-z]{13}$ */
export type CartItemID = string;

/** Pattern: ^ofr_[0-9a-hjkmnp-tv-z]{13}$ */
export type OfferID = string;

/** Pattern: ^ctc_[0-9a-hjkmnp-tv-z]{13}$ */
export type ContactID = string;

/** Pattern: ^trp_[0-9a-hjkmnp-tv-z]{13}$ */
export type TransportID = string;

/**
 * Derived, not stored.
 * pending: paid but no order covers it yet.
 * confirmed: linked to an order.
 * cancelled: withdrawn by either party.
 */
export type OrderItemState = 'pending' | 'confirmed' | 'cancelled';

/**
 * Derived from the two outcome timestamps.
 * open: neither timestamp is set.
 */
export type OrderState = 'open' | 'completed' | 'cancelled';

/** Status of the payment session covering the item */
export type OrderPaymentStatus = 'pending' | 'processing' | 'success' | 'cancelled' | 'failed';

/** Chosen by seller at listing creation */
export type OrderShippingPaidBy = 'buyer' | 'seller';

export type OfferStatus = 'active' | 'accepted' | 'cancelled';

export type ContactAddressType = 'home' | 'work';

// ── Contact ───────────────────────────────────────────────────────────────────

export interface Contact {
  id: ContactID;
  full_name: string;
  phone: string;
  phone_verified: boolean;
  address_type: ContactAddressType;
  is_default_delivery: boolean;
  is_default_pickup: boolean;
  country: string;
  province_code: string;
  province_name: string;
  ward_code: string;
  ward_name: string;
  address: string;
  created_at: string;
  address_detail?: string | null;
  district_code?: string | null;
  district_name?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Per-carrier territory ids */
  provider_codes?: Record<string, unknown>;
}

export interface ContactList extends DataList<Contact> {}

export interface CreateContactRequest {
  full_name: string;
  phone: string;
  address_type: ContactAddressType;
  country: string;
  province_code: string;
  province_name: string;
  ward_code: string;
  ward_name: string;
  address: string;
  address_detail?: string;
  district_code?: string;
  district_name?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_default_delivery?: boolean;
  is_default_pickup?: boolean;
}

/** Every field optional */
export interface UpdateContactRequest {
  full_name?: string;
  phone?: string;
  address_type?: ContactAddressType;
  province_code?: string;
  province_name?: string;
  ward_code?: string;
  ward_name?: string;
  address?: string;
  address_detail?: string | null;
  district_code?: string | null;
  district_name?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default_delivery?: boolean;
  is_default_pickup?: boolean;
}

// ── Order Address Snapshot ────────────────────────────────────────────────────

/**
 * A contact copied into the row, not a pointer.
 * Administrative codes that a carrier is called with.
 */
export interface OrderAddressSnapshot {
  full_name: string;
  phone: string;
  country: string;
  province_code: string;
  ward_code: string;
  address: string;
  address_detail?: string | null;
  district_code?: string | null;
  district_name?: string | null;
  postal_code?: string | null;
  province_name?: string;
  ward_name?: string;
  /** Per-carrier territory ids */
  provider_codes?: Record<string, unknown>;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: CartItemID;
  sku_id: ProductSKUID;
  quantity: number;
  created_at: string;
}

/** Offset/page-paginated. Source: openapi.yaml — CartItemPage */
export type CartItemPage = OffsetPage<CartItem>;

export interface AddCartItemRequest {
  sku_id: ProductSKUID;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ── Draft Order ───────────────────────────────────────────────────────────────

export interface DraftSKUSnapshot {
  id: ProductSKUID;
  /** Smallest currency unit */
  price: number;
  attributes?: Record<string, unknown>;
  attachments?: ResourceID[];
  /** Weight and dimensions for shipping quote */
  package_details?: Record<string, unknown>;
}

export interface DraftSPUSnapshot {
  id: ProductSPUID;
  name: string;
  seller_id: AccountID;
  currency: CurrencyCode;
  price_mode: 'fixed' | 'negotiable';
  skus: DraftSKUSnapshot[];
  attachments?: ResourceID[];
  shipping_paid_by?: OrderShippingPaidBy;
}

export interface DraftOrder {
  id: DraftOrderID;
  spu_id: ProductSPUID;
  snapshot: DraftSPUSnapshot;
  created_at: string;
  valid_until: string;
  cancelled_at?: string | null;
}

/** Offset/page-paginated. Source: openapi.yaml — DraftOrderPage */
export type DraftOrderPage = OffsetPage<DraftOrder>;

export interface CreateDraftRequest {
  spu_id: ProductSPUID;
}

// ── Order ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: OrderItemID;
  draft_id: DraftOrderID;
  buyer_id: AccountID;
  seller_id: AccountID;
  sku_id: ProductSKUID;
  quantity: number;
  currency: CurrencyCode;
  total_amount: number;
  transport_option: string;
  address: OrderAddressSnapshot;
  state: OrderItemState;
  payment_status: OrderPaymentStatus;
  created_at: string;
  order_id?: OrderID | null;
  note?: string | null;
  cancelled_at?: string | null;
  /** Null means the system cancelled it */
  cancelled_by_id?: AccountID | null;
}

/** Cursor-paginated. Source: openapi.yaml — OrderItemPage */
export type OrderItemPage = CursorPage<OrderItem>;

export interface Order {
  id: OrderID;
  draft_id: DraftOrderID;
  buyer_id: AccountID;
  seller_id: AccountID;
  transport_id: TransportID;
  address: OrderAddressSnapshot;
  pickup_address: OrderAddressSnapshot;
  state: OrderState;
  receipt_attachments: ResourceID[];
  created_at: string;
  items?: OrderItem[];
  note?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
  received_at?: string | null;
  /** `received_at` + 72h. Absent a refund, payout happens here. */
  payout_deadline_at?: string | null;
}

/** Cursor-paginated. Source: openapi.yaml — OrderPage */
export type OrderPage = CursorPage<Order>;

// ── Checkout ──────────────────────────────────────────────────────────────────

export interface CheckoutLine {
  sku_id: ProductSKUID;
  quantity: number;
  transport_option: string;
  note?: string;
}

export interface CheckoutRequest {
  lines: CheckoutLine[];
  contact_id: ContactID;
  /** Must match the listing's currency */
  currency: CurrencyCode;
}

// CheckoutResult references PaymentSession which is in finance.type.ts
// Import lazily to avoid circular deps — define only what's needed here
export interface CheckoutResult {
  items: OrderItem[];
  payment_session: {
    id: string;
    kind: string;
    status: string;
    currency: CurrencyCode;
    total_amount: number;
    amount_paid: number;
    note: string;
    created_at: string;
    expired_at: string;
    from_id?: string | null;
    to_id?: string | null;
    paid_at?: string | null;
  };
}

// ── Order Actions ─────────────────────────────────────────────────────────────

export interface ConfirmOrderRequest {
  draft_id: DraftOrderID;
  transport_option: string;
  pickup_contact_id: ContactID;
  note?: string;
}

export interface ConfirmOrderResult {
  order: Order;
  /** Present only when the listing says the seller pays shipping */
  shipping_fee_session?: CheckoutResult['payment_session'] | null;
}

export interface ConfirmReceiptRequest {
  /** Unboxing photos or video. At least one is mandatory. */
  attachments: ResourceID[];
  note?: string;
}

export interface CancellationRequest {
  reason: string;
}

// ── Offer ─────────────────────────────────────────────────────────────────────

export interface Offer {
  id: OfferID;
  sku_id: ProductSKUID;
  buyer_id: AccountID;
  seller_id: AccountID;
  author_id: AccountID;
  status: OfferStatus;
  quantity: number;
  /** Currently proposed total, smallest currency unit */
  total: number;
  currency: CurrencyCode;
  created_at: string;
  expires_at: string;
  reason?: string;
}

/** Cursor-paginated. Source: openapi.yaml — OfferPage */
export type OfferPage = CursorPage<Offer>;

export interface CreateOfferRequest {
  sku_id: ProductSKUID;
  quantity: number;
  total: number;
  reason?: string;
}

export interface UpdateOfferRequest {
  quantity: number;
  total: number;
  reason?: string;
}

export interface AcceptOfferRequest {
  contact_id: ContactID;
  transport_option: string;
  note?: string;
}
