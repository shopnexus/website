// ─────────────────────────────────────────────────────────────────────────────
// chat.type.ts
// Conversation, Message, UnreadCount types.
// Source: openapi.yaml — components/schemas (Conversation*, Message*, ChatUnread*)
// ─────────────────────────────────────────────────────────────────────────────

import type { Resource, PaginatedPage } from './common.type';
import type { AccountID, AccountSummary } from './account.type';

// ── Primitive IDs & Enums ─────────────────────────────────────────────────────

/** Pattern: ^cnv_[0-9a-hjkmnp-tv-z]{13}$ */
export type ConversationID = string;

/** Pattern: ^msg_[0-9a-hjkmnp-tv-z]{13}$ */
export type MessageID = string;

export type MessageStatus = 'sent' | 'delivered' | 'read';

/**
 * A "system" message is produced by the backend — an offer was accepted,
 * an order shipped — and belongs to no participant (no sender).
 */
export type MessageType = 'user' | 'system';

// ── Message ───────────────────────────────────────────────────────────────────

export interface Message {
  id: MessageID;
  conversation_id: ConversationID;
  type: MessageType;
  body: string;
  status: MessageStatus;
  attachments: Resource[];
  /** References to a listing, variant, order; payload of an offer card */
  metadata: Record<string, unknown>;
  created_at: string;
  /** Null on a system message */
  sender_id?: AccountID | null;
  edited_at?: string | null;
  /** Set on a redacted message. The row stays so thread has no unexplained gaps. */
  deleted_at?: string | null;
}

export type MessagePage = PaginatedPage<Message>;

// ── Conversation ──────────────────────────────────────────────────────────────

export interface Conversation {
  id: ConversationID;
  counterparty: AccountSummary;
  /** Starts at creation time so empty thread still sorts predictably */
  last_message_at: string;
  unread: number;
  created_at: string;
  last_message?: Message | null;
}

export type ConversationPage = PaginatedPage<Conversation>;

// ── Unread Counts ─────────────────────────────────────────────────────────────

export interface ChatUnreadCount {
  unread: number;
  /** How many threads have anything unread */
  conversations: number;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export interface StartConversationRequest {
  account_id: AccountID;
}

/** A body or at least one attachment is required */
export interface SendMessageRequest {
  body?: string;
  attachments?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateMessageRequest {
  body: string;
}

export interface MarkConversationReadRequest {
  /** Mark everything sent at or before this instant read. Omit to mark whole thread. */
  before?: string;
}
