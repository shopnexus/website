"use client";

import type { Option } from "@/api/generated/types.gen";

/**
 * A category of pluggable choices, as the platform has it configured.
 *
 * Read-only on purpose, and it says so: these rows are an operator's configuration, not a
 * seller's, and there is no route in this API for a seller to enable a carrier. A toggle
 * here would be a switch that does nothing.
 */
export default function OptionList({
  options,
  loading,
  icon,
  emptyLabel,
}: {
  options: ReadonlyArray<Option>;
  loading: boolean;
  icon: string;
  emptyLabel: string;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-16 rounded-xl bg-surface-container-high animate-pulse" />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return <p className="font-body-sm text-on-surface-variant">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {options.map((option) => (
        <li
          key={option.id}
          className="flex items-start gap-4 p-4 bg-surface rounded-xl border border-outline-variant"
        >
          <span className="material-symbols-outlined w-11 h-11 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="font-label-md font-bold text-on-surface">{option.name}</p>
            {option.description && (
              <p className="font-body-sm text-on-surface-variant mt-0.5">{option.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
