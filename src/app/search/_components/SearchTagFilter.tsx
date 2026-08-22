"use client";

import { useTags } from "@/hooks/api/useTags";
import type { CategoryId, TagSlug } from "@/api/generated/types.gen";
import { HEADING, SECTION } from "./filter-styles";

/**
 * Browse by tag.
 *
 * With a category selected the list is asked for tags *near* it — the API ranks the
 * vocabulary by closeness to a seed, which is what makes this the tags of the thing being
 * browsed rather than the platform's twenty most common. `near` excludes the seed itself,
 * so nothing here repeats the category above it.
 */
export default function SearchTagFilter({
  selected,
  categoryId,
  onSelect,
}: {
  selected: TagSlug;
  categoryId: string;
  onSelect: (tag: TagSlug) => void;
}) {
  const { data: tags = [], isLoading } = useTags({
    limit: 18,
    near: categoryId ? [categoryId as CategoryId] : undefined,
  });

  // The tag in force may not be in the ranked list; it still has to be removable.
  const shown = selected && !tags.some((tag) => tag.slug === selected)
    ? [{ slug: selected, description: null, score: null }, ...tags]
    : tags;

  if (isLoading || shown.length === 0) return null;

  return (
    <div className={SECTION}>
      <h3 className={HEADING}>Thẻ {categoryId ? "liên quan" : "phổ biến"}</h3>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((tag) => {
          const isSelected = selected === tag.slug;
          return (
            <button
              key={tag.slug}
              type="button"
              title={tag.description ?? `#${tag.slug}`}
              onClick={() => onSelect(isSelected ? "" : tag.slug)}
              aria-pressed={isSelected}
              // Tags are seller-written, so one of them is eventually forty characters of
              // scraped slug. Truncated rather than wrapped: a chip that runs to three lines
              // is a paragraph pretending to be a control, and the title attribute already
              // carries the whole thing.
              className={`max-w-full cursor-pointer truncate rounded-full border px-2.5 py-1 font-label-sm transition-colors ${
                isSelected
                  ? "border-transparent bg-primary-container text-on-primary-container"
                  : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
              }`}
            >
              #{tag.slug}
            </button>
          );
        })}
      </div>
    </div>
  );
}
