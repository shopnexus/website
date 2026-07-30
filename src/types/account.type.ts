// ─────────────────────────────────────────────────────────────────────────────
// account.type.ts
// All account, auth, profile, KYC, device, notification types.
// Source: openapi.yaml — components/schemas (Account*, Me, Auth*, Profile*, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { Resource, ResourceID, PaginatedPage } from './common.type';

// ── Primitive IDs & Enums ─────────────────────────────────────────────────────

/** Pattern: ^acc_[0-9a-hjkmnp-tv-z]{13}$ */
export type AccountID = string;

/** Pattern: ^dvc_[0-9a-hjkmnp-tv-z]{13}$ */
export type DeviceID = string;

/** Pattern: ^idd_[0-9a-hjkmnp-tv-z]{13}$ */
export type IdentityDocumentID = string;

/**
 * user: self-registers, buys and sells.
 * moderator: granted by admin.
 * admin: configured, not created.
 */
export type AccountRole = 'user' | 'moderator' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export type ProfileGender = 'male' | 'female' | 'other';

export type DevicePlatform = 'ios' | 'android' | 'web';

export type IdentityDocumentType = 'national-id' | 'passport' | 'driver-license';

export type IdentityStatus = 'pending' | 'verified' | 'rejected';

export type OAuthProvider = string;

export type NotificationCategory = 'order' | 'promotion' | 'system' | 'chat' | 'social';

export type NotificationChannel = 'in-app' | 'push' | 'email' | 'sms';

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  country: string;
  locale: string;
  timezone: string;
  created_at: string;
  avatar?: Resource | null;
  date_of_birth?: string | null;
  description?: string | null;
  gender?: ProfileGender | null;
}

// ── Account Entities ─────────────────────────────────────────────────────────

/** Compact form used in follower/following lists */
export interface AccountSummary {
  id: AccountID;
  name: string;
  avatar?: Resource | null;
}

export type AccountSummaryPage = PaginatedPage<AccountSummary>;

/** The caller's own view — private to them */
export interface Me {
  id: AccountID;
  role: AccountRole;
  status: AccountStatus;
  email_verified: boolean;
  /** False on a provider-only account */
  has_password: boolean;
  /** Whether a live verified identity document exists */
  identity_verified: boolean;
  profile: Profile;
  created_at: string;
  email?: string | null;
  phone?: string | null;
  username?: string | null;
}

/** What anyone may see about an account (seller page) */
export interface PublicAccount {
  id: AccountID;
  name: string;
  identity_verified: boolean;
  follower_count: number;
  created_at: string;
  avatar?: Resource | null;
  description?: string | null;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  /** Access token lifetime in seconds */
  expires_in: number;
  account: Me;
}

export interface LoginRequest {
  /** An email, a phone, or a username */
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  country: string;
  locale: string;
  timezone: string;
  email?: string;
  phone?: string;
  username?: string;
}

export interface OAuthLoginRequest {
  provider: OAuthProvider;
  /** The provider's authorization code or id token */
  credential: string;
  country?: string;
  locale?: string;
  timezone?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  device_id?: DeviceID;
}

// ── Account Mutations ─────────────────────────────────────────────────────────

/** Every field optional. Setting one to null removes it */
export interface UpdateAccountRequest {
  email?: string | null;
  phone?: string | null;
  username?: string | null;
}

/** Every field optional */
export interface UpdateProfileRequest {
  name?: string;
  country?: string;
  locale?: string;
  timezone?: string;
  description?: string | null;
  gender?: ProfileGender | null;
  date_of_birth?: string | null;
  avatar_resource_id?: ResourceID | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface PasswordResetRequest {
  /** An email or a phone */
  identifier: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

// ── OAuth Identity ────────────────────────────────────────────────────────────

export interface OAuthIdentity {
  provider: OAuthProvider;
  created_at: string;
  /** As the provider reported it. May differ from the account's email */
  email?: string | null;
}

export interface OAuthIdentityList {
  items: OAuthIdentity[];
}

// ── KYC / Identity Document ───────────────────────────────────────────────────

export interface IdentityDocument {
  id: IdentityDocumentID;
  doc_type: IdentityDocumentType;
  /** KYC vendor, kebab-case */
  provider: string;
  status: IdentityStatus;
  created_at: string;
  expires_at?: string | null;
  rejection_reason?: string | null;
  verified_at?: string | null;
}

export interface IdentityDocumentList {
  items: IdentityDocument[];
}

export interface IdentityVerificationTicket {
  document: IdentityDocument;
  vendor_session_url?: string | null;
  vendor_session_expires_at?: string | null;
}

export interface StartIdentityVerificationRequest {
  doc_type: IdentityDocumentType;
}

export interface IdentityVerdictRequest {
  status: 'verified' | 'rejected';
  expires_at?: string;
  rejection_reason?: string;
}

// ── Device ────────────────────────────────────────────────────────────────────

export interface Device {
  id: DeviceID;
  platform: DevicePlatform;
  /** Tail of the token, enough for a client to recognise its own install */
  push_token_suffix: string;
  last_seen_at: string;
  created_at: string;
}

export interface DeviceList {
  items: Device[];
}

export interface RegisterDeviceRequest {
  platform: DevicePlatform;
  push_token: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  category: NotificationCategory;
  title: string;
  /** Structured content such as deep links and images */
  payload: Record<string, unknown>;
  created_at: string;
  read_at?: string | null;
}

export type NotificationPage = PaginatedPage<Notification>;

export interface NotificationPreference {
  category: NotificationCategory;
  channel: NotificationChannel;
  is_enabled: boolean;
  /** True when no stored row exists and this is the domain default */
  is_default: boolean;
}

export interface NotificationPreferenceList {
  items: NotificationPreference[];
}

export interface MarkNotificationsReadRequest {
  /** Omit to mark the whole feed read */
  before?: string;
}

export interface UpdateNotificationPreferencesRequest {
  items: Array<{
    category: NotificationCategory;
    channel: NotificationChannel;
    is_enabled: boolean;
  }>;
}

export interface UnreadCount {
  unread: number;
}

// ── Moderator / Admin mutations ───────────────────────────────────────────────

export interface CreateModeratorRequest {
  email: string;
  password: string;
  name: string;
  country: string;
  locale: string;
  timezone: string;
}

export interface SuspendAccountRequest {
  reason: string;
  /** Omit for a permanent suspension */
  until?: string;
}

export interface ModerationNoteRequest {
  note?: string;
}
