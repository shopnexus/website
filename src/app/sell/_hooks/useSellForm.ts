"use client"

import { useState } from "react"
import type { ListingSuggestion, ResourceId } from "@/api/generated/types.gen"
import {
	applyListingSuggestion,
	emptyPair,
	emptyVariant,
	initialSellForm,
} from "../_lib/sell-form.logic"
import type { FormPair, ListingPhoto, SellFormState, VariantDraft } from "../types"

export function useSellForm() {
	const [form, setForm] = useState<SellFormState>(initialSellForm)

	function updateField<Key extends keyof SellFormState>(key: Key, value: SellFormState[Key]): void {
		setForm((current) => ({ ...current, [key]: value }))
	}

	function addPhotos(photos: ListingPhoto[]): void {
		setForm((current) => ({ ...current, photos: [...current.photos, ...photos] }))
	}

	function removePhoto(id: ResourceId): void {
		setForm((current) => {
			const photo = current.photos.find((p) => p.id === id)
			if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl)
			return {
				...current,
				photos: current.photos.filter((p) => p.id !== id),
			}
		})
	}

	function updatePair(
		field: "specifications",
		id: string,
		patch: Partial<Pick<FormPair, "key" | "value">>,
	): void {
		setForm((current) => ({
			...current,
			[field]: current[field].map((pair) => (pair.id === id ? { ...pair, ...patch } : pair)),
		}))
	}

	function addSpecification(): void {
		setForm((current) => ({
			...current,
			specifications: [...current.specifications, emptyPair()],
		}))
	}

	function removeSpecification(id: string): void {
		setForm((current) => ({
			...current,
			specifications: current.specifications.filter((pair) => pair.id !== id),
		}))
	}

	function addVariant(): void {
		setForm((current) => ({ ...current, variants: [...current.variants, emptyVariant()] }))
	}

	function updateVariant(id: string, patch: Partial<Omit<VariantDraft, "id" | "attributes">>): void {
		setForm((current) => ({
			...current,
			variants: current.variants.map((variant) =>
				variant.id === id ? { ...variant, ...patch } : variant,
			),
		}))
	}

	function removeVariant(id: string): void {
		setForm((current) => ({
			...current,
			variants: current.variants.filter((variant) => variant.id !== id),
		}))
	}

	function addVariantAttribute(variantId: string): void {
		setForm((current) => ({
			...current,
			variants: current.variants.map((variant) =>
				variant.id === variantId
					? { ...variant, attributes: [...variant.attributes, emptyPair()] }
					: variant,
			),
		}))
	}

	function updateVariantAttribute(
		variantId: string,
		attributeId: string,
		patch: Partial<Pick<FormPair, "key" | "value">>,
	): void {
		setForm((current) => ({
			...current,
			variants: current.variants.map((variant) =>
				variant.id === variantId
					? {
							...variant,
							attributes: variant.attributes.map((attribute) =>
								attribute.id === attributeId ? { ...attribute, ...patch } : attribute,
							),
						}
					: variant,
			),
		}))
	}

	function removeVariantAttribute(variantId: string, attributeId: string): void {
		setForm((current) => ({
			...current,
			variants: current.variants.map((variant) =>
				variant.id === variantId
					? {
							...variant,
							attributes: variant.attributes.filter(({ id }) => id !== attributeId),
						}
					: variant,
			),
		}))
	}

	function applySuggestion(suggestion: ListingSuggestion, knownTags: ReadonlySet<string>): void {
		setForm((current) => applyListingSuggestion(current, suggestion, knownTags))
	}

	return {
		form,
		updateField,
		addPhotos,
		removePhoto,
		updatePair,
		addSpecification,
		removeSpecification,
		addVariant,
		updateVariant,
		removeVariant,
		addVariantAttribute,
		updateVariantAttribute,
		removeVariantAttribute,
		applySuggestion,
	}
}
