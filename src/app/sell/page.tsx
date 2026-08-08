"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import StepIndicator from "@/components/ui/StepIndicator"
import { useMe } from "@/hooks/api/useAccount"
import { useCategories } from "@/hooks/api/useCatalog"
import { useContacts } from "@/hooks/api/useContacts"
import { useTags } from "@/hooks/api/useTags"
import type { ContactId, ListingSuggestion } from "@/api/generated/types.gen"
import {
	buildCreateListingRequest,
	flattenCategories,
	SELL_STEPS,
	validateSellStep,
} from "./_lib/sell-form.logic"
import { useCreateProductFlow } from "./_hooks/useCreateProductFlow"
import { useListingPhotoUpload } from "./_hooks/useListingPhotoUpload"
import { useSellForm } from "./_hooks/useSellForm"
import DetailsStep from "./_components/DetailsStep"
import ListingPreview from "./_components/ListingPreview"
import PhotoStep from "./_components/PhotoStep"
import PublishStep from "./_components/PublishStep"
import VariantsStep from "./_components/VariantsStep"
import type { SellStep } from "./types"

function LoadingShell() {
	return <div className="mx-auto mt-16 h-72 max-w-5xl animate-pulse rounded-3xl bg-surface-container" />
}

export default function SellPage() {
	const router = useRouter()
	const [step, setStep] = useState<SellStep>(0)
	const sellForm = useSellForm()
	const uploader = useListingPhotoUpload()
	const productFlow = useCreateProductFlow()
	const { data: me, isLoading: isLoadingMe } = useMe()
	const { data: categories = [], isLoading: isLoadingCategories } = useCategories()
	const { data: contacts = [], isLoading: isLoadingContacts } = useContacts()
	const { data: tags = [] } = useTags({ limit: 100 })

	const categoryOptions = useMemo(() => flattenCategories(categories), [categories])
	const knownTags = useMemo(() => new Set(tags.map(({ slug }) => slug)), [tags])
	const defaultPickup = contacts.find(({ is_default_pickup }) => is_default_pickup) ?? contacts[0]
	const activePickupId = sellForm.form.pickupContactId || defaultPickup?.id || ""

	function showValidation(targetStep: SellStep): boolean {
		const validation = validateSellStep(targetStep, sellForm.form)
		if (validation.valid) return true
		setStep(targetStep)
		toast.error(validation.message ?? "Kiểm tra lại thông tin tin đăng.")
		return false
	}

	function nextStep(): void {
		if (!showValidation(step)) return
		setStep((current) => Math.min(3, current + 1) as SellStep)
	}

	async function uploadPhotos(files: File[]): Promise<void> {
		const photos = await uploader.uploadFiles(files)
		if (photos.length > 0) sellForm.addPhotos(photos)
		if (photos.length < files.length) toast.error("Một số ảnh chưa tải lên được. Hãy thử lại.")
	}

	function acceptSuggestion(suggestion: ListingSuggestion): void {
		sellForm.applySuggestion(suggestion, knownTags)
		setStep(1)
	}

	function validateProduct(): boolean {
		return showValidation(1) && showValidation(2)
	}

	async function saveDraft(): Promise<void> {
		if (!validateProduct()) return
		try {
			const id = await productFlow.saveDraft(buildCreateListingRequest(sellForm.form))
			toast.success("Đã lưu bản nháp.")
			router.push(`/dashboard/products/${id}`)
		} catch {
			// The API layer presents the structured server error.
		}
	}

	async function submitForReview(): Promise<void> {
		if (!validateProduct()) return
		if (!activePickupId) {
			setStep(3)
			toast.error("Thêm địa chỉ lấy hàng trước khi gửi duyệt.")
			return
		}
		try {
			const result = await productFlow.submitForReview(
				buildCreateListingRequest(sellForm.form),
				activePickupId as ContactId,
			)
			if (result.published) {
				toast.success("Đã gửi tin cho kiểm duyệt.")
				router.push("/dashboard/products")
				return
			}
			toast("Tin đã được lưu nháp. Mở trình chỉnh sửa để hoàn tất gửi duyệt.", { icon: "📝" })
			router.push(`/dashboard/products/${result.listingId}`)
		} catch {
			// Creation failed before a draft existed; the global handler shows why.
		}
	}

	if (isLoadingMe || isLoadingCategories || isLoadingContacts) return <LoadingShell />

	if (me && !me.identity_verified) {
		return (
			<div className="min-h-screen bg-surface-container-low px-4 py-16">
				<div className="mx-auto max-w-xl rounded-3xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
					<div className="mx-auto grid size-20 place-items-center rounded-[20px] bg-primary/10 text-primary">
						<span className="material-symbols-outlined text-5xl leading-none">verified_user</span>
					</div>
					<h1 className="mt-6 text-2xl font-bold text-on-surface">Xác minh danh tính để bắt đầu bán</h1>
					<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">Server dùng cùng trạng thái xác minh cho quyền đăng bán và nhận tiền. Hoàn tất bước này trước để không bị chặn sau khi có đơn đầu tiên.</p>
					<Link href="/dashboard/verification" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-on-primary shadow-sm transition hover:brightness-110"><span className="material-symbols-outlined">badge</span>Xác minh ngay</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-surface-container-low pb-28">
			<div className="border-b border-outline-variant bg-surface">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
					<div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Seller studio</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-on-surface">Tạo tin đăng mới</h1></div>
					<Link href="/dashboard/products" className="grid size-10 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface" aria-label="Đóng"><span className="material-symbols-outlined">close</span></Link>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
				<StepIndicator steps={[...SELL_STEPS]} currentStep={step} className="mb-10 !max-w-3xl" />
				<div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
					<div className="overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm">
						<div className="p-6 md:p-9">
							{step === 0 ? <PhotoStep photos={sellForm.form.photos} isUploading={uploader.isUploading} uploadingCount={uploader.uploadingCount} onUpload={uploadPhotos} onRemove={sellForm.removePhoto} onSuggestion={acceptSuggestion} /> : null}
							{step === 1 ? <DetailsStep form={sellForm.form} categories={categoryOptions} tags={tags} onField={sellForm.updateField} onAddSpecification={sellForm.addSpecification} onChangeSpecification={(id, patch) => sellForm.updatePair("specifications", id, patch)} onRemoveSpecification={sellForm.removeSpecification} /> : null}
							{step === 2 ? <VariantsStep variants={sellForm.form.variants} onAdd={sellForm.addVariant} onChange={sellForm.updateVariant} onRemove={sellForm.removeVariant} onAddAttribute={sellForm.addVariantAttribute} onChangeAttribute={sellForm.updateVariantAttribute} onRemoveAttribute={sellForm.removeVariantAttribute} /> : null}
							{step === 3 ? <PublishStep contacts={contacts} activePickupId={activePickupId as ContactId | ""} onPickupChange={(id) => sellForm.updateField("pickupContactId", id)} /> : null}
						</div>

						<footer className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-5 md:px-9">
							<Button type="button" variant="ghost" disabled={step === 0 || productFlow.isPending} onClick={() => setStep((current) => Math.max(0, current - 1) as SellStep)}><span className="material-symbols-outlined text-[18px]">arrow_back</span>Quay lại</Button>
							<div className="ml-auto flex flex-wrap gap-2">
								{step === 3 ? <Button type="button" variant="outline" disabled={productFlow.isPending} onClick={saveDraft}>{productFlow.isCreating ? "Đang lưu…" : "Lưu nháp"}</Button> : null}
								{step < 3 ? <Button type="button" disabled={uploader.isUploading} onClick={nextStep}>Tiếp tục<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Button> : <Button type="button" disabled={productFlow.isPending || !activePickupId} onClick={submitForReview}>{productFlow.isPublishing ? "Đang gửi duyệt…" : productFlow.isCreating ? "Đang tạo tin…" : "Gửi kiểm duyệt"}<span className="material-symbols-outlined text-[18px]">send</span></Button>}
							</div>
						</footer>
					</div>
					<ListingPreview form={sellForm.form} categories={categoryOptions} />
				</div>
			</div>
		</div>
	)
}
