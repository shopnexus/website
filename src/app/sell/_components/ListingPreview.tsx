import Image from "next/image"
import { formatMoney } from "@/lib/money"
import { LISTING_CONDITION_VI, PRICE_MODE_VI } from "@/lib/dictionaries"
import type { CategoryOption } from "../_lib/sell-form.logic"
import type { SellFormState } from "../types"

export default function ListingPreview({ form, categories }: { form: SellFormState; categories: CategoryOption[] }) {
	const firstVariant = form.variants[0]
	const price = Number(firstVariant?.price)
	const category = categories.find(({ id }) => id === form.categoryId)

	return (
		<aside className="sticky top-24 overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm">
			<div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 via-surface-container-low to-secondary-container/50">
				{form.photos[0]?.previewUrl || form.photos[0]?.url ? <Image src={form.photos[0].previewUrl || form.photos[0].url!} alt="Ảnh xem trước" fill sizes="360px" className="object-cover" /> : <div className="absolute inset-0 grid place-items-center text-center"><div><span className="material-symbols-outlined text-5xl text-primary/45">image</span><p className="mt-2 text-xs font-semibold text-on-surface-variant">Ảnh bìa sẽ xuất hiện ở đây</p></div></div>}
				<span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold text-on-surface shadow-sm backdrop-blur">Xem trước thẻ sản phẩm</span>
			</div>
			<div className="space-y-4 p-5">
				<div><p className="text-xs font-semibold text-primary">{category?.label ?? "Chưa chọn danh mục"}</p><h2 className="mt-1 line-clamp-2 text-lg font-bold leading-6 text-on-surface">{form.name.trim() || "Tên sản phẩm của bạn"}</h2></div>
				<p className="text-2xl font-extrabold tracking-tight text-primary">{Number.isFinite(price) && price > 0 ? formatMoney(price, "VND") : "Chưa có giá"}</p>
				<div className="flex flex-wrap gap-2 text-[11px] font-semibold text-on-surface-variant">
					{form.condition ? <span className="rounded-full bg-surface-container px-3 py-1.5">{LISTING_CONDITION_VI[form.condition]}</span> : null}
					<span className="rounded-full bg-surface-container px-3 py-1.5">{PRICE_MODE_VI[form.priceMode]}</span>
					<span className="rounded-full bg-surface-container px-3 py-1.5">{form.variants.length} phiên bản</span>
				</div>
				{form.tags.length > 0 ? <div className="flex flex-wrap gap-1.5">{form.tags.slice(0, 5).map((tag) => <span key={tag} className="text-xs text-primary">#{tag}</span>)}</div> : null}
			</div>
		</aside>
	)
}
