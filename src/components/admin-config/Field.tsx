import type { ReactNode } from "react";

/**
 * A labelled form control. `hint` carries the rule the server enforces, shown before the
 * request rather than after the 400 — a staff form whose constraints are only discoverable
 * by failing is one people stop using.
 */
export default function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-label-md text-on-surface block mb-1.5">{label}</span>
      {children}
      {error ? (
        <span className="font-body-sm text-error block mt-1">{error}</span>
      ) : (
        hint && <span className="font-body-sm text-on-surface-variant block mt-1">{hint}</span>
      )}
    </label>
  );
}
