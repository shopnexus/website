import type { ReactNode } from "react";
import Link from "next/link";

/**
 * What a list says when it has nothing in it.
 *
 * An empty screen is an invitation to act, so it names the one thing to do next rather than
 * only reporting absence. It also stays compact: the sparse account pages used to leave most
 * of the viewport blank below one card, which read as a page that had failed to load.
 */
interface EmptyStateProps {
  /** A Material Symbols ligature — `favorite`, `inbox`, `storefront`. */
  icon: string;
  /** What is not here, in the user's words. Not "no data". */
  title: string;
  /** One sentence: why it is empty, or what fills it. */
  description?: string;
  /** The way out. A link when it navigates, a button when it acts here. */
  action?: { label: string; href: string } | ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  // A plain object with an href is the shorthand; anything else is a node to render as-is.
  const link =
    action && typeof action === "object" && "href" in action
      ? (action as { label: string; href: string })
      : null;

  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-12">
      <span
        className="material-symbols-outlined text-[32px] text-on-surface-variant mb-3"
        aria-hidden="true"
      >
        {icon}
      </span>
      <p className="text-title-md text-on-surface">{title}</p>
      {description && (
        <p className="text-body-sm text-on-surface-variant mt-1.5 max-w-[46ch]">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {link ? (
            <Link
              href={link.href}
              className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-on-primary text-label-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {link.label}
            </Link>
          ) : (
            (action as ReactNode)
          )}
        </div>
      )}
    </div>
  );
}
