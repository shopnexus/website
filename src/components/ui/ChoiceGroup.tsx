"use client";

export interface Choice<T extends string> {
  value: T;
  label: string;
  /** Tint for the selected state. `danger` marks the destructive answer. */
  tone?: "primary" | "danger";
}

/**
 * A mutually exclusive choice that reads as a choice.
 *
 * Two staff dialogs built this out of `<button aria-pressed>` and then gave the submit
 * button the *same label* as the selected option — so "Xác thực" appeared twice, the first
 * one only setting a draft. People pressed that one, nothing was sent, and there was
 * nothing on screen to say why. `aria-pressed` was also the wrong role: a toggle is
 * independently on or off, while these are one-of-two.
 *
 * So: radio semantics, and the selected option carries a tick — its state is never colour
 * alone. The submit button beside it must use a *different, fuller* verb; that is the half
 * of the fix a component cannot enforce.
 */
export default function ChoiceGroup<T extends string>({
  label,
  value,
  choices,
  onChange,
  disabled = false,
}: {
  label: string;
  value: T;
  choices: ReadonlyArray<Choice<T>>;
  onChange: (next: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-label-md text-on-surface">{label}</span>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {choices.map((choice) => {
          const selected = choice.value === value;
          const danger = choice.tone === "danger";
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(choice.value)}
              className={[
                "flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                selected
                  ? danger
                    ? "bg-error text-on-error border-error"
                    : "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                {selected ? "radio_button_checked" : "radio_button_unchecked"}
              </span>
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
