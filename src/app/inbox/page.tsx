"use client"

import { Suspense, useState } from "react"

import ChatThread from "@/components/chat/ChatThread"
import OfferModal from "@/components/offers/OfferModal"
import Modal from "@/components/ui/Modal"

import EmptyThread from "./_components/EmptyThread"
import InboxSidebar from "./_components/InboxSidebar"
import ListingBanner from "./_components/ListingBanner"
import ThreadHeader from "./_components/ThreadHeader"
import ThreadInfoPanel from "./_components/ThreadInfoPanel"
import TicketBanner from "./_components/TicketBanner"
import TicketForm from "./_components/TicketForm"
import TicketInfoPanel from "./_components/TicketInfoPanel"
import { useInbox } from "./_hooks/useInbox"

/**
 * The inbox: every thread this account has, trade and support alike.
 *
 * A ticket is a conversation, so it is read here rather than on a screen of its own —
 * which is what the old `/support` route was, and what made answering one a trip out of
 * the inbox and back.
 */
function InboxContent() {
	const inbox = useInbox()
	const [isOfferModalOpen, setOfferModalOpen] = useState(false)

	const hasThread = Boolean(inbox.active)
	const isSupport = inbox.isTicketThread

	return (
		<div className="bg-background min-h-[calc(100vh-76px)] w-full">
			<div className="w-full h-[calc(100vh-76px)] overflow-hidden">
				<div className="flex h-full border-t border-outline-variant relative w-full">
					<InboxSidebar
						conversations={inbox.visible}
						accountId={inbox.accountId}
						activeId={inbox.activeId}
						listingOf={inbox.listingOf}
						ticketOf={inbox.ticketOf}
						deals={inbox.deals}
						tab={inbox.tab}
						onTabChange={inbox.setTab}
						search={inbox.search}
						onSearchChange={inbox.setSearch}
						unreadThreadCount={inbox.unreadThreadCount}
						unreadMessageCount={inbox.unreadMessageCount}
						openTicketCount={inbox.openTicketCount}
						totalCount={inbox.conversations.length}
						isLoading={inbox.isLoading}
						hasNextPage={inbox.hasNextPage}
						isFetchingNextPage={inbox.isFetchingNextPage}
						onLoadMore={() => inbox.fetchNextPage()}
						onSelect={inbox.select}
						onCompose={() => inbox.openCompose()}
						hidden={inbox.showThreadOnMobile}
					/>

					<section className="flex-1 flex flex-col bg-surface overflow-hidden min-w-0 relative z-10">
						{!inbox.isLoading && !hasThread ? (
							<EmptyThread onCompose={() => inbox.openCompose()} />
						) : (
							<>
								<ThreadHeader
									conversation={inbox.active}
									productHref={inbox.listing ? `/product/${inbox.listing.slug}` : undefined}
									isSupport={isSupport}
									onBack={() => inbox.setShowThreadOnMobile(false)}
									onToggleInfo={() => inbox.setInfoOpen(!inbox.isInfoOpen)}
									isInfoOpen={inbox.isInfoOpen}
								/>

								{isSupport
									? inbox.activeTicket && <TicketBanner ticket={inbox.activeTicket} />
									: inbox.listing && (
											<ListingBanner
												listing={inbox.listing}
												deals={inbox.activeDeals}
												onNegotiate={() => setOfferModalOpen(true)}
											/>
										)}

								<ChatThread
									conversationId={inbox.activeId || undefined}
									// Support answers as the platform, so a ticket thread names no person.
									counterparty={
										!isSupport && inbox.active
											? {
													name: inbox.active.counterparty.name,
													avatarUrl: inbox.active.counterparty.avatar?.url,
												}
											: undefined
									}
									unread={inbox.active?.unread ?? 0}
									counterpartyReadAt={inbox.active?.counterparty_read_at}
									readAt={inbox.active?.read_at}
									refs={
										!isSupport && inbox.listing ? { listing_id: inbox.listing.id } : undefined
									}
									placeholder={
										isSupport ? "Viết tin nhắn cho bộ phận hỗ trợ..." : undefined
									}
									// Reporting is a `report-message` ticket, and this screen is where
									// tickets are raised — so the thread hands the message back rather
									// than knowing the route itself.
									onReportMessage={isSupport ? undefined : inbox.reportMessage}
								/>
							</>
						)}

						<OfferModal
							isOpen={isOfferModalOpen}
							onClose={() => setOfferModalOpen(false)}
							product={inbox.listing || null}
						/>
					</section>

					{hasThread &&
						(isSupport ? (
							<TicketInfoPanel
								ticket={inbox.activeTicket}
								isOpen={inbox.isInfoOpen}
								onClose={() => inbox.setInfoOpen(false)}
							/>
						) : (
							<ThreadInfoPanel
								listing={inbox.listing}
								contact={inbox.active?.counterparty}
								role={inbox.counterpartyRole}
								deals={inbox.activeDeals}
								accountId={inbox.accountId}
								onNegotiate={() => setOfferModalOpen(true)}
								isOpen={inbox.isInfoOpen}
								onClose={() => inbox.setInfoOpen(false)}
							/>
						))}
				</div>
			</div>

			<Modal open={inbox.isComposeOpen} title="Gửi yêu cầu hỗ trợ" onClose={inbox.closeCompose}>
				<TicketForm
					initialKind={inbox.composeKind ?? "other"}
					initialRefId={inbox.composeRefId}
					refLocked={Boolean(inbox.composeRefId)}
					onCancel={inbox.closeCompose}
					onCreated={inbox.openCreatedTicket}
				/>
			</Modal>
		</div>
	)
}

export default function InboxPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-background">
					<span className="sr-only">Đang mở hộp thư</span>
					<span
						className="material-symbols-outlined animate-spin text-primary text-3xl"
						aria-hidden="true"
					>
						progress_activity
					</span>
				</div>
			}
		>
			<InboxContent />
		</Suspense>
	)
}
