"use client";

import { useEffect, useState } from "react";

/**
 * Where you are in the lower half of the page, and one press to anywhere else in it.
 *
 * Restructuring moved the description, the specifications and the reviews below the fold, so
 * the page got long enough to get lost in — and "đánh giá" is what a lot of readers come for.
 * The nav sticks under the site header and marks the section currently in view.
 *
 * The active section comes from an IntersectionObserver rather than from the scroll position:
 * pressing a link sets the hash, and a scroll handler racing the smooth scroll it starts
 * lights up every section on the way past.
 */
export interface Section {
  id: string;
  label: string;
  /** Rendered after the label — a review count, when there is one. */
  count?: number;
}

export default function SectionNav({ sections }: { sections: readonly Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost section currently intersecting wins, so scrolling up marks the one
        // being entered rather than the one being left.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // The band starts below the header and this nav — 68px plus its own height — so a
      // section counts as "here" once its heading has cleared them, not once its last
      // paragraph has left.
      { rootMargin: "-128px 0px -66% 0px", threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Nội dung tin đăng"
      className="sticky top-[68px] z-30 mb-8 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur"
    >
      <ul className="hide-scrollbar flex gap-1 overflow-x-auto">
        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 font-label-md transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
              >
                {section.label}
                {section.count != null && section.count > 0 && (
                  <span className="font-label-sm tabular-nums text-on-surface-variant">
                    ({section.count})
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
