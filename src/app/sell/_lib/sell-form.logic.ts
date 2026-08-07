import type {
	Category,
	CreateListingRequest,
	CreateVariantRequest,
	ListingSuggestion,
	TagSlug,
} from "@/api/generated/types.gen"
import type { FormPair, SellFormState, SellStep, StepValidation, VariantDraft } from "../types"

export const SELL_STEPS = ["Hình ảnh", "Thông tin", "Phiên bản", "Gửi duyệt"] as const
export const MAX_TAGS = 10

let rowSequence = 0

function nextId(prefix: string): string {
	rowSequence += 1
	return `${prefix}-${rowSequence}`
}

export function emptyPair(key = "", value = ""): FormPair {
	return { id: nextId("pair"), key, value }
}

export function emptyVariant(): VariantDraft {
	return {
		id: nextId("variant"),
		attributes: [emptyPair("Phiên bản", "Mặc định")],
		price: "",
		quantity: "1",
		weightG: "",
	}
}

export function initialSellForm(): SellFormState {
	return {
		photos: [],
		name: "",
		categoryId: "",
		condition: "",
		description: "",
		tags: [],
		specifications: [],
		transcript: "",
		priceMode: "fixed",
		variants: [emptyVariant()],
		pickupContactId: "",
	}
}

function filledPairs(pairs: FormPair[]): FormPair[] {
	return pairs.filter(({ key, value }) => key.trim() && value.trim())
}

function pairsToRecord(pairs: FormPair[]): Record<string, unknown> {
	return Object.fromEntries(filledPairs(pairs).map(({ key, value }) => [key.trim(), value.trim()]))
}

function integerValue(raw: string): number | null {
	if (!raw.trim()) return null
	const value = Number(raw)
	return Number.isSafeInteger(value) ? value : null
}

function variantAttributes(variant: VariantDraft): Record<string, unknown> {
	const attributes = pairsToRecord(variant.attributes)
	return Object.keys(attributes).length > 0 ? attributes : { "Phiên bản": "Mặc định" }
}

function variantKey(variant: VariantDraft): string {
	return JSON.stringify(
		Object.entries(variantAttributes(variant)).sort(([left], [right]) => left.localeCompare(right)),
	)
}

export function validateSellStep(step: SellStep, form: SellFormState): StepValidation {
	if (step === 0) return { valid: true }

	if (step === 1) {
		if (!form.name.trim()) return { valid: false, message: "Nhập tên sản phẩm trước khi tiếp tục." }
		if (form.name.trim().length > 200) return { valid: false, message: "Tên sản phẩm tối đa 200 ký tự." }
		if (!form.categoryId) return { valid: false, message: "Chọn danh mục cho sản phẩm." }
		if (!form.condition) return { valid: false, message: "Chọn tình trạng sản phẩm." }
		if (form.description.length > 20_000) return { valid: false, message: "Mô tả tối đa 20.000 ký tự." }
		if (form.tags.length > MAX_TAGS) return { valid: false, message: `Chỉ được chọn tối đa ${MAX_TAGS} thẻ.` }
		return { valid: true }
	}

	if (step === 2) {
		if (form.variants.length === 0) return { valid: false, message: "Tin đăng cần ít nhất một phiên bản." }
		for (const [index, variant] of form.variants.entries()) {
			const price = integerValue(variant.price)
			const quantity = integerValue(variant.quantity)
			const weight = integerValue(variant.weightG)
			if (price === null || price < 1) {
				return { valid: false, message: `Giá của phiên bản ${index + 1} phải là số nguyên lớn hơn 0.` }
			}
			if (quantity === null || quantity < 0) {
				return { valid: false, message: `Tồn kho của phiên bản ${index + 1} không hợp lệ.` }
			}
			if (variant.weightG.trim() && (weight === null || weight < 1)) {
				return { valid: false, message: `Khối lượng của phiên bản ${index + 1} không hợp lệ.` }
			}
			if (form.variants.length > 1 && filledPairs(variant.attributes).length === 0) {
				return { valid: false, message: `Thêm thuộc tính để phân biệt phiên bản ${index + 1}.` }
			}
		}
		const keys = form.variants.map(variantKey)
		if (new Set(keys).size !== keys.length) {
			return { valid: false, message: "Hai phiên bản đang có cùng bộ thuộc tính." }
		}
	}

	return { valid: true }
}

function buildVariant(variant: VariantDraft): CreateVariantRequest {
	const weight = integerValue(variant.weightG)
	return {
		attributes: variantAttributes(variant),
		package_details: weight && weight > 0 ? { weight_g: weight } : {},
		price: integerValue(variant.price) ?? 0,
		quantity: integerValue(variant.quantity) ?? 0,
	}
}

export function buildCreateListingRequest(form: SellFormState): CreateListingRequest {
	if (!form.categoryId || !form.condition) {
		throw new Error("Form must be validated before building the listing request")
	}
	const specifications = pairsToRecord(form.specifications)
	return {
		name: form.name.trim(),
		description: form.description.trim() || undefined,
		category_id: form.categoryId,
		condition: form.condition,
		currency: "VND",
		price_mode: form.priceMode,
		tags: form.tags,
		specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
		attachments: form.photos.map(({ id }) => id),
		variants: form.variants.map(buildVariant),
	}
}

export function applyListingSuggestion(
	form: SellFormState,
	suggestion: ListingSuggestion,
	knownTags: ReadonlySet<string>,
): SellFormState {
	const firstVariant = form.variants[0] ?? emptyVariant()
	return {
		...form,
		name: suggestion.name || form.name,
		description: suggestion.description || form.description,
		categoryId: suggestion.category_id ?? form.categoryId,
		condition: suggestion.condition || form.condition,
		tags: suggestion.tags.filter((tag) => knownTags.has(tag)) as TagSlug[],
		specifications: Object.entries(suggestion.specifications).map(([key, value]) =>
			emptyPair(key, String(value)),
		),
		transcript: suggestion.transcript,
		variants: [
			{
				...firstVariant,
				price: suggestion.price === null ? firstVariant.price : String(suggestion.price),
				weightG: suggestion.weight_g === null ? firstVariant.weightG : String(suggestion.weight_g),
			},
			...form.variants.slice(1),
		],
	}
}

export interface CategoryOption {
	id: string
	label: string
	depth: number
}

export function flattenCategories(categories: Category[]): CategoryOption[] {
	const children = new Map<string | null, Category[]>()
	for (const category of categories) {
		const siblings = children.get(category.parent_id) ?? []
		siblings.push(category)
		children.set(category.parent_id, siblings)
	}
	for (const siblings of children.values()) siblings.sort((a, b) => a.name.localeCompare(b.name, "vi"))

	const result: CategoryOption[] = []
	const visit = (parentId: string | null, depth: number): void => {
		for (const category of children.get(parentId) ?? []) {
			result.push({ id: category.id, label: category.name, depth })
			visit(category.id, depth + 1)
		}
	}
	visit(null, 0)
	return result
}
