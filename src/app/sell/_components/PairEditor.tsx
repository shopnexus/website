import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import type { FormPair } from "../types"

interface PairEditorProps {
	pairs: FormPair[]
	keyPlaceholder: string
	valuePlaceholder: string
	addLabel: string
	onAdd: () => void
	onChange: (id: string, patch: Partial<Pick<FormPair, "key" | "value">>) => void
	onRemove: (id: string) => void
}

export default function PairEditor({
	pairs,
	keyPlaceholder,
	valuePlaceholder,
	addLabel,
	onAdd,
	onChange,
	onRemove,
}: PairEditorProps) {
	return (
		<div className="space-y-3">
			{pairs.map((pair) => (
				<div key={pair.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
					<Input
						aria-label={keyPlaceholder}
						value={pair.key}
						onChange={(event) => onChange(pair.id, { key: event.target.value })}
						placeholder={keyPlaceholder}
						className="!rounded-xl !py-2.5"
					/>
					<Input
						aria-label={valuePlaceholder}
						value={pair.value}
						onChange={(event) => onChange(pair.id, { value: event.target.value })}
						placeholder={valuePlaceholder}
						className="!rounded-xl !py-2.5"
					/>
					<button
						type="button"
						aria-label="Xóa dòng"
						onClick={() => onRemove(pair.id)}
						className="grid size-11 place-items-center rounded-xl text-on-surface-variant transition-colors hover:bg-error-container/40 hover:text-error"
					>
						<span className="material-symbols-outlined text-[20px]">delete</span>
					</button>
				</div>
			))}
			<Button type="button" variant="outline" size="sm" onClick={onAdd}>
				<span className="material-symbols-outlined text-[17px]">add</span>
				{addLabel}
			</Button>
		</div>
	)
}
