import type { ReactNode } from "react";

/**
 * The header every configuration page opens with.
 *
 * It used to open with an eyebrow — the nav group's name — above a 22px title, above the
 * consequence. Which put the group on screen twice (the sidebar heading already says it) and
 * the page name three times (sidebar row, topbar, here), and spent about 110px doing it. The
 * eyebrow is gone and the topbar carries the trail; what is left is the one thing neither of
 * them says.
 *
 * `consequence` is not a subtitle — it is the sentence saying what a write on this page
 * reaches, because each of these surfaces changes something a shopper sees or something a
 * settled record names. Staff pages that leave that implicit are how a carrier gets deleted
 * to "tidy up".
 */
export default function PageHeader({
  title,
  consequence,
  actions,
}: {
  title: string;
  consequence: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h1 className="font-title-lg font-bold text-on-surface">{title}</h1>
        <p className="mt-1 max-w-[80ch] font-body-sm text-on-surface-variant">{consequence}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
