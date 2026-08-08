"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { ContactId } from "@/api/generated/types.gen"
import { useContacts, useUpdateContact } from "@/hooks/api/useContacts"
import { useOptions } from "@/hooks/api/useOptions"
import type { SettingsTab } from "../types"

/**
 * The seller-side settings this platform actually has.
 *
 * Two of the three sections are read-only, and deliberately so: which carriers and which
 * payment rails are live is an operator's configuration, served by `GET /options`, and
 * there is no seller-facing route to change it. Showing them is still worth doing —
 * "why can't buyers pick express delivery" is answered here rather than in support.
 *
 * The one thing a seller does own is which saved address a courier collects from, which
 * is a flag on the contact row.
 */
export function useSettings() {
	const [tab, setTab] = useState<SettingsTab>("pickup")

	const { data: contacts = [], isLoading: contactsLoading } = useContacts()
	const carriers = useOptions("transport")
	const rails = useOptions("payment")
	const updateContact = useUpdateContact()

	const defaultPickup = contacts.find((contact) => contact.is_default_pickup)

	const setDefaultPickup = (id: ContactId) => {
		// One flag, sent alone: the server moves it off whichever row held it, and sending
		// the rest of the address back would re-assert fields nobody edited.
		updateContact.mutate(
			{ id, body: { is_default_pickup: true } },
			{ onSuccess: () => toast.success("Đã đổi địa chỉ lấy hàng mặc định.") },
		)
	}

	return {
		tab,
		setTab,
		contacts,
		contactsLoading,
		defaultPickup,
		setDefaultPickup,
		isSaving: updateContact.isPending,
		carriers: carriers.data ?? [],
		carriersLoading: carriers.isLoading,
		rails: rails.data ?? [],
		railsLoading: rails.isLoading,
	}
}
