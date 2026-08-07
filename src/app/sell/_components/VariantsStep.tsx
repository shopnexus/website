"use client"

import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { formatMoney } from "@/lib/money"
import type { FormPair, VariantDraft } from "../types"
import PairEditor from "./PairEditor"

interface VariantsStepProps {
	variants: VariantDraft[]
	onAdd: () => void
	onChange: (id: string, patch: Partial<Omit<VariantDraft, "id" | "attributes">>) => void
	onRemove: (id: string) => void
	onAddAttribute: (variantId: string) => void
	onChangeAttribute: (variantId: string, attributeId: string, patch: Partial<Pick<FormPair, "key" | "value">>) => void
	onRemoveAttribute: (variantId: string, attributeId: string) => void
}

export default function VariantsStep({
	variants,
	onAdd,
	onChange,
	onRemove,
	onAddAttribute,
	onChangeAttribute,
	onRemoveAttribute,
}: VariantsStepProps) {
	return (
		<section className="space-y-7">
			<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Bước 3 · Phiên bản</p>
					<h2 className="text-2xl font-bold tracking-tight text-on-surface">Giá, tồn kho và kiện hàng</h2>
					<p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">Mỗi phiên bản là một lựa chọn người mua có thể đặt. Phiên bản đầu tiên sẽ làm giá đại diện.</p>
				</div>
				<Button type="button" variant="outline" onClick={onAdd}><span className="material-symbols-outlined text-[18px]">add</span>Thêm phiên bản</Button>
			</header>

			<div className="space-y-5">
				{variants.map((variant, index) => {
					const price = Number(variant.price)
					return (
						<article key={variant.id} className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
							<header className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-4">
								<div><p className="text-xs font-bold uppercase tracking-wider text-primary">Phiên bản {index + 1}</p><p className="mt-1 text-sm font-semibold text-on-surface">{Number.isFinite(price) && price > 0 ? formatMoney(price, "VND") : "Chưa nhập giá"}{index === 0 ? " · Giá đại diện" : ""}</p></div>
								{variants.length > 1 ? <button type="button" onClick={() => onRemove(variant.id)} className="grid size-9 place-items-center rounded-full text-on-surface-variant hover:bg-error-container/40 hover:text-error" aria-label={`Xóa phiên bản ${index + 1}`}><span className="material-symbols-outlined text-[20px]">delete</span></button> : null}
							</header>
							<div className="space-y-5 p-5">
								<div><h3 className="mb-1 text-sm font-semibold text-on-surface">Thuộc tính phân biệt</h3><p className="mb-3 text-xs text-on-surface-variant">Ví dụ Màu sắc · Đen, Dung lượng · 256 GB. Server dùng bộ này để ngăn phiên bản trùng nhau.</p><PairEditor pairs={variant.attributes} keyPlaceholder="Tên thuộc tính" valuePlaceholder="Lựa chọn" addLabel="Thêm thuộc tính" onAdd={() => onAddAttribute(variant.id)} onChange={(attributeId, patch) => onChangeAttribute(variant.id, attributeId, patch)} onRemove={(attributeId) => onRemoveAttribute(variant.id, attributeId)} /></div>
								<div className="grid gap-4 sm:grid-cols-3">
									<label className="space-y-2"><span className="text-sm font-semibold text-on-surface">Giá bán (₫) <span className="text-error">*</span></span><Input type="number" min={1} step={1} inputMode="numeric" value={variant.price} onChange={(event) => onChange(variant.id, { price: event.target.value })} placeholder="2.990.000" /></label>
									<label className="space-y-2"><span className="text-sm font-semibold text-on-surface">Tồn kho <span className="text-error">*</span></span><Input type="number" min={0} step={1} inputMode="numeric" value={variant.quantity} onChange={(event) => onChange(variant.id, { quantity: event.target.value })} /></label>
									<label className="space-y-2"><span className="text-sm font-semibold text-on-surface">Khối lượng (g)</span><Input type="number" min={1} step={1} inputMode="numeric" value={variant.weightG} onChange={(event) => onChange(variant.id, { weightG: event.target.value })} placeholder="500" /></label>
								</div>
							</div>
						</article>
					)
				})}
			</div>
		</section>
	)
}
