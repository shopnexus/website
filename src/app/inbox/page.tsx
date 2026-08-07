"use client"

import { Suspense, useState } from "react"

import ChatThread from "@/components/chat/ChatThread"
import OfferModal from "@/components/offers/OfferModal"

import InboxSidebar from "./_components/InboxSidebar"
import ListingBanner from "./_components/ListingBanner"
import ThreadHeader from "./_components/ThreadHeader"
import ThreadInfoPanel from "./_components/ThreadInfoPanel"
import { useInbox } from "./_hooks/useInbox"

function InboxContent() {
	const inbox = useInbox()
	const [isOfferModalOpen, setOfferModalOpen] = useState(false)

	return (
		<div className="bg-background min-h-[calc(100vh-76px)] w-full">
			<div className="w-full h-[calc(100vh-76px)] overflow-hidden">
				<div className="flex h-full border-t border-outline-variant/30 relative w-full">
					<InboxSidebar
						conversations={inbox.visible}
						accountId={inbox.accountId}
						activeId={inbox.activeId}
						tab={inbox.tab}
						onTabChange={inbox.setTab}
						search={inbox.search}
						onSearchChange={inbox.setSearch}
						unreadThreadCount={inbox.unreadThreadCount}
						unreadMessageCount={inbox.unreadMessageCount}
						totalCount={inbox.conversations.length}
						isLoading={inbox.isLoading}
						hasNextPage={inbox.hasNextPage}
						isFetchingNextPage={inbox.isFetchingNextPage}
						onLoadMore={() => inbox.fetchNextPage()}
						onSelect={inbox.select}
						hidden={inbox.showThreadOnMobile}
					/>

					<section className="flex-1 flex flex-col bg-surface overflow-hidden min-w-0 relative z-10">
						<ThreadHeader
							conversation={inbox.active}
							onBack={() => inbox.setShowThreadOnMobile(false)}
						/>

						{inbox.listing && (
							<ListingBanner
								listing={inbox.listing}
								onNegotiate={() => setOfferModalOpen(true)}
							/>
						)}

						<ChatThread
							conversationId={inbox.activeId || undefined}
							counterparty={
								inbox.active
									? {
											name: inbox.active.counterparty.name,
											avatarUrl: inbox.active.counterparty.avatar?.url,
										}
									: undefined
							}
							unread={inbox.active?.unread ?? 0}
							counterpartyReadAt={inbox.active?.counterparty_read_at}
							refs={inbox.listing ? { listing_id: inbox.listing.id } : undefined}
						/>

						<OfferModal
							isOpen={isOfferModalOpen}
							onClose={() => setOfferModalOpen(false)}
							product={inbox.listing || null}
						/>
					</section>

					<ThreadInfoPanel
						listing={inbox.listing}
						contact={inbox.active?.counterparty}
						onNegotiate={() => setOfferModalOpen(true)}
					/>
				</div>
			</div>
		</div>
	)
}

export default function InboxPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-background">
					<span className="material-symbols-outlined animate-spin text-primary text-3xl">
						progress_activity
					</span>
				</div>
			}
		>
			<InboxContent />
		</Suspense>
	)
}
