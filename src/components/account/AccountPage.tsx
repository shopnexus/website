import type { ReactNode } from "react";

/**
 * The frame every /account page sits in.
 *
 * Before this, each page invented its own: four max-widths, three paddings and five h1
 * treatments from 16px to 48px, so the title jumped to a different x-position on every
 * sidebar click. One frame means the heading lands in the same place every time.
 */
interface AccountPageProps {
  /** The page's one h1. Same size on every page — the sidebar already says where you are. */
  title: string;
  /** One sentence on what this page is for. Omit when the title is self-evident. */
  description?: string;
  /** Actions belonging to the page as a whole, beside the title. */
  actions?: ReactNode;
  /**
   * How wide the CONTENT may run. A form is capped because a 1200px-wide input is
   * unreadable and unfillable; a grid or table gets the full column. The heading is not
   * affected — it sits at the same x on every page either way.
   */
  width?: "form" | "wide";
  children: ReactNode;
}

export default function AccountPage({
  title,
  description,
  actions,
  width = "form",
  children,
}: AccountPageProps) {
  // One frame for every page, so the title lands at the same x whatever the page holds, and
  // 1440 to match the storefront and the navbar — at 1152 a 1920 screen left a dead band on
  // the right while the product table truncated names to fit.
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="min-w-0">
          <h1 className="text-headline-md text-on-surface text-balance">{title}</h1>
          {description && (
            <p className="text-body-sm text-on-surface-variant mt-1.5 max-w-[62ch]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>

      <div className={width === "form" ? "max-w-4xl" : ""}>{children}</div>
    </div>
  );
}
