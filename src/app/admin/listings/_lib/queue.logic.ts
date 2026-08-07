import type { Category, Listing, ListingDetail, ListingStatus } from "@/api/generated/types.gen"
import { LISTING_CONDITION_VI, PRICE_MODE_VI } from "@/lib/dictionaries"
import type { EditDiffRow } from "./types"

export const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
	draft: "bg-surface-container-high text-on-surface-variant",
	pending: "bg-primary/10 text-primary border border-primary/20",
	active: "bg-secondary-container text-on-secondary-container",
	hidden: "bg-error-container text-on-error-container",
}

/**
 * Why this row is in the queue, which is the first thing a moderator needs and is not a
 * column: a `pending` listing has never been public, while an `active` one in the queue is
 * live and holding an edit — the same verdict button does two different things.
 */
export function queueReason(listing: Listing): string {
	if (listing.status === "pending") return "Chờ xuất bản lần đầu"
	if (listing.status === "active") return "Đang bán, có chỉnh sửa chờ duyệt"
	if (listing.status === "hidden") {
		return listing.taken_down_at ? "Đã bị gỡ bởi kiểm duyệt" : "Người bán tự ẩn"
	}
	return "Bản nháp của người bán"
}

function orEmpty(value: string | null | undefined): string {
	return value && value.trim() ? value : "—"
}

/**
 * The held edit, as before/after pairs.
 *
 * A `PendingEdit` field is null where the seller left it alone, so only the non-null ones
 * are rows — showing every field would bury the two words that actually changed. Buyers
 * keep seeing the published version until this is approved, which is why the "before"
 * column matters at all.
 */
export function pendingEditDiff(
	detail: ListingDetail,
	categories: ReadonlyArray<Category>,
): EditDiffRow[] {
	const edit = detail.pending_edit
	if (!edit) return []

	const rows: EditDiffRow[] = []

	if (edit.name !== null) {
		rows.push({ label: "Tên", before: detail.name, after: edit.name })
	}
	if (edit.description !== null) {
		rows.push({ label: "Mô tả", before: orEmpty(detail.description), after: orEmpty(edit.description) })
	}
	if (edit.condition !== null) {
		rows.push({
			label: "Tình trạng",
			before: LISTING_CONDITION_VI[detail.condition],
			after: LISTING_CONDITION_VI[edit.condition],
		})
	}
	if (edit.price_mode !== null) {
		rows.push({
			label: "Cách bán",
			before: PRICE_MODE_VI[detail.price_mode],
			after: PRICE_MODE_VI[edit.price_mode],
		})
	}
	if (edit.category_id !== null) {
		const next = categories.find((category) => category.id === edit.category_id)
		rows.push({
			label: "Danh mục",
			before: detail.category.name,
			// A category the tree no longer has still has to render, so the id is the fallback.
			after: next?.name ?? edit.category_id,
		})
	}
	if (edit.tags.length > 0) {
		rows.push({
			label: "Thẻ",
			before: detail.tags.length ? detail.tags.join(", ") : "—",
			after: edit.tags.join(", "),
		})
	}
	if (edit.attachments.length > 0) {
		// Ids only — the bytes are not resolved for a held edit, so a count is the honest
		// claim rather than a gallery of the pictures that are still live.
		rows.push({
			label: "Ảnh",
			before: `${detail.images.length} ảnh`,
			after: `${edit.attachments.length} ảnh mới`,
		})
	}
	const specKeys = Object.keys(edit.specifications)
	if (specKeys.length > 0) {
		rows.push({
			label: "Thông số",
			before: `${Object.keys(detail.specifications).length} mục`,
			after: specKeys.join(", "),
		})
	}

	return rows
}
