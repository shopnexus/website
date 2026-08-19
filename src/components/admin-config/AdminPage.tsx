import type { ReactNode } from "react";
import PageHeader from "./PageHeader";

/**
 * The one container every staff page opens with.
 *
 * It replaces eight hand-rolled wrappers that had drifted to eight different measures —
 * `max-w-4xl`, `5xl`, `6xl`, `1100px`, `1200px`, `1280px`, `1440px` — two padding scales
 * and two spacing idioms, and three unrelated header treatments, one of which drew the
 * page title at `text-4xl text-primary`, twice the size of the same title on the
 * configuration pages. Staff move between these eleven pages all day; a heading that
 * changes size when they do reads as a different product each time.
 *
 * `width` is the real decision, so it is the only knob: how much horizontal room the
 * content genuinely needs, named rather than measured at each call site.
 */
const WIDTHS = {
  /** Forms and trees. Wider than this and a label sits a hand-span from its input. */
  md: "max-w-5xl",
  /** Queues of rows. */
  lg: "max-w-[1200px]",
  /** Master–detail and wide ledgers, which have two panes to fit. */
  full: "max-w-[1440px]",
} as const;

type Width = keyof typeof WIDTHS;

/**
 * The measurements alone, for a page that supplies its own header.
 *
 * A detail view is titled by the record it shows — a ticket case leads with the case, not
 * with the word "ticket" — but it still has to line up with the queue it was opened from,
 * so it takes the container from here rather than restating the numbers.
 */
export function AdminCanvas({
  width = "lg",
  children,
}: {
  width?: Width;
  children: ReactNode;
}) {
  return (
    <div className={`p-4 md:p-6 lg:p-8 pb-12 mx-auto flex flex-col gap-6 ${WIDTHS[width]}`}>
      {children}
    </div>
  );
}

export default function AdminPage({
  width = "lg",
  eyebrow,
  title,
  consequence,
  actions,
  children,
}: {
  width?: Width;
  eyebrow: string;
  title: string;
  consequence: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AdminCanvas width={width}>
      <PageHeader eyebrow={eyebrow} title={title} consequence={consequence} actions={actions} />
      {children}
    </AdminCanvas>
  );
}
