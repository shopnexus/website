import type {
	CategoryId,
	ContactId,
	ListingCondition,
	PriceMode,
	ResourceId,
	TagSlug,
} from "@/api/generated/types.gen"

export interface FormPair {
	id: string
	key: string
	value: string
}

export interface ListingPhoto {
	id: ResourceId
	url: string
}

export interface VariantDraft {
	id: string
	attributes: FormPair[]
	price: string
	quantity: string
	weightG: string
}

export interface SellFormState {
	photos: ListingPhoto[]
	name: string
	categoryId: CategoryId | ""
	condition: ListingCondition | ""
	description: string
	tags: TagSlug[]
	specifications: FormPair[]
	transcript: string
	priceMode: PriceMode
	variants: VariantDraft[]
	pickupContactId: ContactId | ""
}

export type SellStep = 0 | 1 | 2 | 3

export interface StepValidation {
	valid: boolean
	message?: string
}
