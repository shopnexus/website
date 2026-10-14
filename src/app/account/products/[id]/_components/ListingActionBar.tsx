"use client";

import type { ListingDetail, ListingStatus } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";

/**
 * The page's one action, and the sentence that says what pressing it does.
 *
 * There used to be two, worded almost identically — "Lưu thay đổi" at the foot of the form and
 * "Đăng bán" in the panel beside it — and on a draft that is a fifty-fifty guess with a silent
 * wrong answer: the seller saves, sees a success toast, and their listing is never submitted.
 * So there is one button whose label is what will happen to *this* listing in *this* state, and
 * the line under it is the consequence the label cannot fit.
 *
 * Hiding a live listing stays available but is not competing for the same attention: it is the
 * quiet one, on the right.
 */
const LABELS: Record<ListingStatus, string> = {
	draft: "Lưu & đăng bán",
	hidden: "Lưu & đăng bán lại",
	pending: "Lưu thay đổi",
	active: "Lưu & gửi kiểm duyệt",
};

const HINTS: Record<ListingStatus, string> = {
	draft: "Tin sẽ được kiểm duyệt trước khi hiển thị với người mua.",
	hidden: "Tin sẽ được kiểm duyệt lại trước khi hiển thị với người mua.",
	pending: "Tin đang chờ kiểm duyệt. Thay đổi được cập nhật ngay vào bản đang chờ.",
	active: "Bản đang bán giữ nguyên tới khi thay đổi của bạn được duyệt.",
};

export default function ListingActionBar({
	listing,
	isDirty,
	isSaving,
	isUnpublishing,
	hasPickupAddress,
	onSubmit,
	onUnpublish,
}: {
	listing: ListingDetail;
	isDirty: boolean;
	isSaving: boolean;
	isUnpublishing: boolean;
	/** False when publishing would fail for want of a pickup address, which is said out loud. */
	hasPickupAddress: boolean;
	onSubmit: () => void;
	onUnpublish: () => void;
}) {
	const status = listing.status;
	const publishing = status === "draft" || status === "hidden";
	// Nothing to save and nothing to publish is the one state where the button does nothing, so
	// it says so rather than answering a press with "không có thay đổi nào".
	const nothingToDo = !isDirty && !publishing;
	const blocked = publishing && !hasPickupAddress;

	return (
		<div className="sticky bottom-0 z-10 -mx-4 md:mx-0 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur px-4 md:px-6 py-4 md:rounded-2xl md:border">
			<div className="flex flex-wrap items-center gap-3">
				<Button onClick={onSubmit} disabled={isSaving || nothingToDo || blocked}>
					{isSaving ? "Đang lưu..." : LABELS[status]}
				</Button>
				{status === "active" && (
					<Button variant="outline" onClick={onUnpublish} disabled={isUnpublishing}>
						{isUnpublishing ? "Đang ẩn..." : "Ẩn khỏi trang bán"}
					</Button>
				)}
				{isDirty && (
					<span className="text-body-xs text-on-surface-variant ml-auto">
						Có thay đổi chưa lưu
					</span>
				)}
			</div>
			<p className="text-body-xs text-on-surface-variant mt-2">
				{blocked
					? "Thêm một địa chỉ lấy hàng ở khung Trạng thái trước khi đăng bán."
					: nothingToDo
						? "Chưa có thay đổi nào để lưu."
						: HINTS[status]}
			</p>
		</div>
	);
}
