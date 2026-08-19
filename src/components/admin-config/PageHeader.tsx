import type { ReactNode } from "react";

/**
 * The header every configuration page opens with.
 *
 * `consequence` is not a subtitle — it is the sentence saying what a write on this page
 * reaches, because each of these surfaces changes something a shopper sees or something a
 * settled record names. Staff pages that leave that implicit are how a carrier gets
 * deleted to "tidy up".
 */
export default function PageHeader({
  eyebrow,
  title,
  consequence,
  actions,
}: {
  eyebrow: string;
  title: string;
  consequence: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="font-label-sm uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">
          {eyebrow}
        </p>
        <h1 className="font-headline-md text-on-surface">{title}</h1>
        <p className="font-body-sm text-on-surface-variant mt-1.5 max-w-2xl">{consequence}</p>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
