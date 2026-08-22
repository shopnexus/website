"use client";

/**
 * A one-line segmented filter. Every option is visible at once — a select would hide how
 * many ways this list can be narrowed, and on a staff table the set of filters is itself
 * information about what the rows contain.
 */
export default function FilterChips<T extends string>({
  label,
  value,
  options,
  allLabel = "Tất cả",
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: ReadonlyArray<{ value: T; label: string }>;
  allLabel?: string;
  onChange: (value: T | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={label}>
      <span className="font-label-sm uppercase tracking-[0.08em] text-on-surface-variant">
        {label}
      </span>
      <Chip active={value === undefined} onClick={() => onChange(undefined)}>
        {allLabel}
      </Chip>
      {options.map((option) => (
        <Chip
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(value === option.value ? undefined : option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

/**
 * One filter pill.
 *
 * Exported because a required choice — how many rows to read, say — is the same control
 * without the clear option, and the ledger page had grown its own copy that differed only
 * in the active colours: `bg-primary` against this one's `bg-primary-container`, so the
 * same "this is selected" spoke in two voices on neighbouring screens.
 */
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "cursor-pointer rounded-full border px-2.5 py-1 font-label-sm transition-colors",
        // A tint of the brand rather than `primary-container`, which in this palette is a
        // dark teal — so a row of filters with one of them chosen put a solid dark block at
        // the top of every table. Selection is a state of the control, not of the data, so it
        // does not read off the status scale either.
        active
          ? "border-primary/40 bg-primary/10 font-semibold text-primary"
          : "border-outline-variant bg-transparent text-on-surface-variant hover:bg-surface-container",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
