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

function Chip({
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
        "px-3 py-1.5 rounded-full font-label-sm border transition-colors cursor-pointer",
        active
          ? "bg-primary-container text-on-primary-container border-transparent"
          : "bg-transparent text-on-surface-variant border-outline-variant hover:bg-surface-container",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
