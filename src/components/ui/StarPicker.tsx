"use client";

import { useState } from "react";

const LABELS = ["Rất tệ", "Không hài lòng", "Tạm được", "Hài lòng", "Tuyệt vời"];

/**
 * The interactive half of a star row.
 *
 * Radio inputs rather than buttons: a rating is one choice out of five, so arrow keys
 * move through it and a screen reader announces it as a group. The visible stars are
 * labels over `sr-only` inputs, which is what keeps the keyboard focus ring real.
 */
export default function StarPicker({
  value,
  onChange,
  name = "rating",
}: {
  value: number;
  onChange: (rating: number) => void;
  name?: string;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
        role="radiogroup"
        aria-label="Số sao"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className="cursor-pointer p-0.5 rounded-full focus-within:ring-2 focus-within:ring-primary"
            title={LABELS[star - 1]}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-[32px] leading-none transition-colors ${
                star <= shown ? "text-primary" : "text-outline-variant"
              }`}
              style={{ fontVariationSettings: star <= shown ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
            <span className="sr-only">
              {star} sao — {LABELS[star - 1]}
            </span>
          </label>
        ))}
      </div>
      <span className="font-label-md text-on-surface-variant">
        {shown > 0 ? LABELS[shown - 1] : "Chọn số sao"}
      </span>
    </div>
  );
}
