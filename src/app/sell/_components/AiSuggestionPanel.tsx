"use client"

import { useRef, useState } from "react"
import { toast } from "react-hot-toast"
import Button from "@/components/ui/Button"
import { useSuggestListing } from "@/hooks/api/useCatalog"
import type { ListingSuggestion, ResourceId } from "@/api/generated/types.gen"

const MAX_VOICE_BYTES = 1 << 20

interface AiSuggestionPanelProps {
	attachments: ResourceId[]
	onSuggestion: (suggestion: ListingSuggestion) => void
}

async function encodeBase64(file: File): Promise<string> {
	const bytes = new Uint8Array(await file.arrayBuffer())
	let binary = ""
	for (let index = 0; index < bytes.length; index += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
	}
	return btoa(binary)
}

export default function AiSuggestionPanel({ attachments, onSuggestion }: AiSuggestionPanelProps) {
	const suggest = useSuggestListing()
	const [note, setNote] = useState("")
	const [voiceName, setVoiceName] = useState("")
	const voiceRef = useRef<{ base64: string; mime: string } | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	async function pickVoiceNote(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const file = event.target.files?.[0]
		if (!file) return
		if (file.size > MAX_VOICE_BYTES) {
			toast.error("Ghi âm tối đa 1 MB.")
			event.target.value = ""
			return
		}
		voiceRef.current = { base64: await encodeBase64(file), mime: file.type }
		setVoiceName(file.name)
	}

	function run(): void {
		const voice = voiceRef.current
		if (attachments.length === 0 && !note.trim() && !voice) {
			toast.error("Thêm ít nhất một ảnh, mô tả nhanh hoặc ghi âm.")
			return
		}
		suggest.mutate(
			{
				attachments: attachments.length > 0 ? attachments.slice(0, 3) : undefined,
				note: note.trim() || undefined,
				voice_note: voice?.base64,
				voice_note_mime: voice?.mime,
				language: "vi",
			},
			{
				onSuccess: (suggestion) => {
					onSuggestion(suggestion)
					toast.success("Đã điền gợi ý. Hãy kiểm tra lại trước khi gửi duyệt.")
				},
			},
		)
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-secondary/25 bg-secondary-container/25">
			<div className="flex items-start gap-3 border-b border-secondary/15 p-5"><span className="material-symbols-outlined rounded-xl bg-primary p-2 text-on-primary">auto_awesome</span><div><h3 className="font-bold text-on-surface">Phác thảo tin bằng AI</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">Server đọc tối đa ba ảnh đầu và lời bạn cung cấp. AI chỉ điền biểu mẫu, không tự tạo tin.</p></div></div>
			<div className="space-y-3 p-5">
				<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: Máy dùng 8 tháng, còn hộp, xước nhẹ cạnh trái, muốn bán 6 triệu…" className="min-h-24 w-full resize-y rounded-xl border border-outline bg-surface px-3 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
				<div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><span className="material-symbols-outlined text-[17px]">mic</span>{voiceName ? "Đổi ghi âm" : "Thêm ghi âm"}</Button>{voiceName ? <span className="max-w-48 truncate text-xs text-on-surface-variant">{voiceName}</span> : null}<input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={pickVoiceNote} /><Button type="button" size="sm" className="ml-auto" disabled={suggest.isPending} onClick={run}>{suggest.isPending ? "Đang phân tích…" : "Điền giúp tôi"}</Button></div>
			</div>
		</div>
	)
}
