"use client";

import { useMemo } from "react";
import type { Variant } from "@/api/generated/types.gen";

/** A variant's attributes are `unknown`-valued on the wire; only the strings are selectable. */
export function attributesOf(variant: Variant): Record<string, string> {
  return Object.fromEntries(
    Object.entries(variant.attributes).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
}

/**
 * The classification chips, moved to where the price is.
 *
 * They used to sit in a panel of their own above the price, so choosing a size and reading
 * what it costs were two places on the page: the number changed off-screen. A picker is part
 * of the offer, not a description of it.
 *
 * A combination that does not exist is dimmed rather than disabled, and pressing it keeps the
 * value just chosen while the rest of the selection follows whatever variant carries it —
 * which is what lets somebody who wants the red one find out which sizes it comes in, instead
 * of having to clear their way back to it.
 */
export default function VariantPicker({
  variants,
  selected,
  selectedAttributes,
  onSelect,
}: {
  variants: readonly Variant[];
  selected: Variant;
  selectedAttributes: Record<string, string>;
  onSelect: (key: string, value: string) => void;
}) {
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((variant) => {
      Object.keys(attributesOf(variant)).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [variants]);

  if (attributeKeys.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {attributeKeys.map((key) => {
        const values = Array.from(
          new Set(
            variants
              .map((variant) => attributesOf(variant)[key])
              .filter((value): value is string => Boolean(value)),
          ),
        );
        return (
          <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
            <span className="shrink-0 pt-1.5 font-label-sm uppercase tracking-wide text-on-surface-variant sm:w-24">
              {key}
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label={key}>
              {values.map((value) => {
                const isSelected = selectedAttributes[key] === value;
                const combination = { ...selectedAttributes, [key]: value };
                const exists = variants.some((variant) =>
                  Object.entries(combination).every(
                    ([attribute, wanted]) => attributesOf(variant)[attribute] === wanted,
                  ),
                );
                const soldOut =
                  exists &&
                  variants
                    .filter((variant) =>
                      Object.entries(combination).every(
                        ([attribute, wanted]) => attributesOf(variant)[attribute] === wanted,
                      ),
                    )
                    .every((variant) => variant.stock.available <= 0);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSelect(key, value)}
                    aria-pressed={isSelected}
                    className={[
                      "relative rounded-xl border px-3.5 py-2 font-body-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary-container text-on-primary-container"
                        : "border-outline-variant text-on-surface hover:border-primary",
                      !exists && !isSelected ? "opacity-45" : "",
                      soldOut && !isSelected ? "line-through decoration-outline" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {selected.stock.available <= 0 && (
        <p className="font-body-sm text-error">Phân loại đang chọn đã hết hàng.</p>
      )}
    </div>
  );
}
