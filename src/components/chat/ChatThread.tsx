"use client"

import ThreadView from "./ThreadView"
import type { ChatThreadProps } from "./types"

/**
 * One chat thread: its messages and the box you write in.
 *
 * The same component serves the inbox and a support ticket, because a ticket *is* a
 * conversation — `body` and `attachments` on `POST /tickets` become its first message and
 * everything after that is ordinary chat. A second implementation would mean two upload
 * flows and two read-receipt rules for one contract.
 *
 * All it does itself is key the view on the conversation. Everything a thread holds that
 * is not the thread — a half-typed edit, a picture staged but not sent — is per-thread
 * state, and a remount is what makes that true without a reset effect that has to be kept
 * in step with every new piece of state.
 */
export default function ChatThread(props: ChatThreadProps) {
	return <ThreadView key={props.conversationId ?? "empty"} {...props} />
}
