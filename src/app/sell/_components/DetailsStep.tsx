"use client"

import type {
	CategoryId,
	ListingCondition,
	PriceMode,
	Tag,
	TagSlug,
} from "@/api/generated/types.gen"
import Input from "@/components/ui/Input"
import { LISTING_CONDITION_VI, PRICE_MODE_VI } from "@/lib/dictionaries"
import type { CategoryOption } from "../_lib/sell-form.logic"
import type { FormPair, SellFormState } from "../types"
import PairEditor from "./PairEditor"

interface DetailsStepProps {
	form: SellFormState
	categories: CategoryOption[]
	tags: Tag[]
	onField: <Key extends keyof SellFormState>(key: Key, value: SellFormState[Key]) => void
	onAddSpecification: () => void
	onChangeSpecification: (id: string, patch: Partial<Pick<FormPair, "key" | "value">>) => void
	onRemoveSpecification: (id: string) => void
}

export default function DetailsStep({
	form,
	categories,
	tags,
	onField,
	onAddSpecification,
	onChangeSpecification,
	onRemoveSpecification,
}: DetailsStepProps) {
	function toggleTag(slug: TagSlug): void {
		onField(
			"tags",
			form.tags.includes(slug) ? form.tags.filter((tag) => tag !== slug) : [...form.tags, slug],
		)
	}

	return (
		<section className="space-y-7">
			<header>
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Bước 2 · Thông tin</p>
				<h2 className="text-2xl font-bold tracking-tight text-on-surface">Mô tả đúng món đồ đang bán</h2>
				<p className="mt-2 text-sm leading-6 text-on-surface-variant">Thông tin này sẽ được gửi cho kiểm duyệt trước khi xuất hiện trên chợ.</p>
			</header>

			{form.transcript ? (
				<div className="flex gap-3 rounded-2xl border border-secondary/20 bg-secondary-container/25 p-4 text-sm text-on-secondary-container">
					<span className="material-symbols-outlined shrink-0 text-primary">graphic_eq</span>
					<p><span className="font-semibold">AI đã nghe:</span> “{form.transcript}”</p>
				</div>
			) : null}

			<label className="block space-y-2">
				<span className="text-sm font-semibold text-on-surface">Tên sản phẩm <span className="text-error">*</span></span>
				<Input value={form.name} maxLength={200} onChange={(event) => onField("name", event.target.value)} placeholder="Ví dụ: Máy ảnh Fujifilm X-T30 II, ngoại hình đẹp" />
				<span className="block text-right text-xs text-on-surface-variant">{form.name.length}/200</span>
			</label>

			<div className="grid gap-5 sm:grid-cols-2">
				<label className="space-y-2">
					<span className="text-sm font-semibold text-on-surface">Danh mục <span className="text-error">*</span></span>
					<select value={form.categoryId} onChange={(event) => onField("categoryId", event.target.value as CategoryId)} className="w-full rounded-2xl border border-outline bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
						<option value="">Chọn danh mục phù hợp</option>
						{categories.map((category) => <option key={category.id} value={category.id}>{`${"— ".repeat(category.depth)}${category.label}`}</option>)}
					</select>
				</label>
				<label className="space-y-2">
					<span className="text-sm font-semibold text-on-surface">Tình trạng <span className="text-error">*</span></span>
					<select value={form.condition} onChange={(event) => onField("condition", event.target.value as ListingCondition)} className="w-full rounded-2xl border border-outline bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
						<option value="">Chọn tình trạng</option>
						{(Object.keys(LISTING_CONDITION_VI) as ListingCondition[]).map((condition) => <option key={condition} value={condition}>{LISTING_CONDITION_VI[condition]}</option>)}
					</select>
				</label>
			</div>

			<label className="block space-y-2">
				<span className="text-sm font-semibold text-on-surface">Mô tả chi tiết</span>
				<textarea value={form.description} maxLength={20_000} onChange={(event) => onField("description", event.target.value)} placeholder="Tình trạng thực tế, thời gian sử dụng, phụ kiện đi kèm, lỗi hoặc vết xước…" className="min-h-40 w-full resize-y rounded-2xl border border-outline bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
				<span className="block text-right text-xs text-on-surface-variant">{form.description.length.toLocaleString("vi-VN")}/20.000</span>
			</label>

			<div className="space-y-3">
				<div>
					<h3 className="text-sm font-semibold text-on-surface">Hình thức bán</h3>
					<p className="mt-1 text-xs text-on-surface-variant">Giá thương lượng cho phép người mua gửi đề nghị trước khi tạo đơn.</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					{(Object.keys(PRICE_MODE_VI) as PriceMode[]).map((mode) => (
						<button key={mode} type="button" onClick={() => onField("priceMode", mode)} className={`rounded-2xl border p-4 text-left transition ${form.priceMode === mode ? "border-primary bg-primary/8 ring-2 ring-primary/10" : "border-outline-variant hover:border-primary/50"}`}>
							<span className="flex items-center justify-between font-semibold text-on-surface">{PRICE_MODE_VI[mode]}<span className="material-symbols-outlined text-primary">{form.priceMode === mode ? "radio_button_checked" : "radio_button_unchecked"}</span></span>
							<span className="mt-1 block text-xs leading-5 text-on-surface-variant">{mode === "fixed" ? "Người mua thanh toán theo giá niêm yết." : "Hai bên có thể chốt một mức giá khác qua đề nghị."}</span>
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-end justify-between gap-4">
					<div><h3 className="text-sm font-semibold text-on-surface">Thẻ tìm kiếm</h3><p className="mt-1 text-xs text-on-surface-variant">Chỉ chọn từ bộ thẻ của ShopNexus để tin đăng luôn hợp lệ.</p></div>
					<span className="text-xs font-semibold text-on-surface-variant">{form.tags.length}/10</span>
				</div>
				<div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-low p-3">
					{tags.map((tag) => {
						const selected = form.tags.includes(tag.slug)
						return <button key={tag.slug} type="button" onClick={() => toggleTag(tag.slug)} disabled={!selected && form.tags.length >= 10} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selected ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary"}`}>{tag.slug}</button>
					})}
					{tags.length === 0 ? <span className="text-sm text-on-surface-variant">Chưa có thẻ nào trong từ điển.</span> : null}
				</div>
			</div>

			<div className="space-y-3">
				<div><h3 className="text-sm font-semibold text-on-surface">Thông số sản phẩm</h3><p className="mt-1 text-xs text-on-surface-variant">Ví dụ: thương hiệu, chất liệu, dung lượng. Đây là thông tin chung cho mọi phiên bản.</p></div>
				<PairEditor pairs={form.specifications} keyPlaceholder="Tên thông số" valuePlaceholder="Giá trị" addLabel="Thêm thông số" onAdd={onAddSpecification} onChange={onChangeSpecification} onRemove={onRemoveSpecification} />
			</div>
		</section>
	)
}
