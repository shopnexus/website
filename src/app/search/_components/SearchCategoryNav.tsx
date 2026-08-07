"use client";

import type { Category } from "@/api/generated/types.gen";

/** The root categories, as the strip a browse starts from. */
export default function SearchCategoryNav({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const item = (id: string, label: string, icon: string) => {
    const isSelected = selectedId === id;
    return (
      <button
        key={id || "all"}
        type="button"
        onClick={() => onSelect(isSelected ? "" : id)}
        aria-pressed={isSelected}
        className={`flex items-center gap-2 shrink-0 font-bold text-label-md transition-colors pb-1 cursor-pointer ${
          isSelected
            ? "text-primary border-b-2 border-primary"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <nav className="flex items-center gap-6 mb-8 overflow-x-auto hide-scrollbar pb-3 border-b border-outline-variant/20">
      {item("", "Tất cả danh mục", "menu")}
      {categories.map((category) => item(category.id, category.name, "category"))}
    </nav>
  );
}
