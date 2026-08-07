import type { ReactNode } from "react";

/** The one card shell these pages put a list, a tree or a toolbar inside. */
export default function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
