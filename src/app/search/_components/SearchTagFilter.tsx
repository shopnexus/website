"use client";

import { useTags } from "@/hooks/api/useTags";
import type { CategoryId, TagSlug } from "@/api/generated/types.gen";

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
    <div className="pt-4 border-t border-outline-variant/10">
      <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]">
        Thẻ {categoryId ? "liên quan" : "phổ biến"}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((tag) => {
          const isSelected = selected === tag.slug;
          return (
            <button
              key={tag.slug}
              type="button"
              title={tag.description ?? undefined}
              onClick={() => onSelect(isSelected ? "" : tag.slug)}
              aria-pressed={isSelected}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors cursor-pointer ${
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
