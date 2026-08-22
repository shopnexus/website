"use client";

import { blankPair, type AttributePair } from "@/lib/variant-attributes";

const field =
  "w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-sm";

/**
 * The pairs that name a variant — "Màu sắc: Đen", "Kích cỡ: L".
 *
 * Editable here because the name is how a seller finds a row: with eighteen variants on one
 * listing, price alone identifies nothing, and two rows may not share a set anyway.
 */
export default function AttributeEditor({
  pairs,
  onChange,
  idPrefix,
}: {
  pairs: AttributePair[];
  onChange: (next: AttributePair[]) => void;
  idPrefix: string;
}) {
  const patch = (id: string, part: Partial<AttributePair>) =>
    onChange(pairs.map((pair) => (pair.id === id ? { ...pair, ...part } : pair)));

  return (
    <div className="space-y-2">
      {pairs.map((pair, index) => (
        <div key={pair.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            aria-label={`Tên thuộc tính ${index + 1}`}
            id={`${idPrefix}-key-${pair.id}`}
            value={pair.key}
            onChange={(event) => patch(pair.id, { key: event.target.value })}
            placeholder="Màu sắc"
            className={field}
          />
          <input
            aria-label={`Giá trị thuộc tính ${index + 1}`}
            value={pair.value}
            onChange={(event) => patch(pair.id, { value: event.target.value })}
            placeholder="Đen"
            className={field}
          />
          <button
            type="button"
            aria-label={`Xóa thuộc tính ${pair.key || index + 1}`}
            onClick={() => onChange(pairs.filter((row) => row.id !== pair.id))}
            className="grid size-9 place-items-center rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...pairs, blankPair()])}
        className="inline-flex items-center gap-1 text-label-md text-primary hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          add
        </span>
        Thêm thuộc tính
      </button>
    </div>
  );
}
