"use client";

import type { ReactNode } from "react";

type ChipVariant = "filter" | "category" | "action";

interface ChipProps {
  variant?: ChipVariant;
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  icon?: string;
  onRemove?: () => void;
  /** Accessible name of the × — "Bỏ lọc theo danh mục" beats a bare "close". */
  removeLabel?: string;
}

export default function Chip({
  variant = "filter",
  selected = false,
  onClick,
  children,
  className = "",
  icon,
  onRemove,
  removeLabel = "Bỏ lọc này",
}: ChipProps){
  const baseStyles = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-pointer border";
  
  let dynamicStyles = "";

  if (selected) {
    dynamicStyles = "bg-primary-container text-on-primary-container border-transparent";
  } else {
    dynamicStyles = "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low";
  }

  const paddingStyles = variant === "category" ? "px-4 py-2" : "px-3 py-1.5";
  const shell = [baseStyles, dynamicStyles, paddingStyles, className].filter(Boolean).join(" ");

  const body = (
    <>
      {icon && (
        <span className="material-symbols-outlined text-[18px] mr-1.5" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </>
  );

  // Two controls in a span, not a button inside a button: the × was a nested `<span onClick>`,
  // so a filter added with the keyboard could only be removed with a mouse.
  if (onRemove) {
    return (
      <span className={`${shell} gap-0 pr-1.5`}>
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          >
            {body}
          </button>
        ) : (
          <span className="inline-flex items-center">{body}</span>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="material-symbols-outlined text-[16px] ml-1.5 cursor-pointer rounded-full hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          close
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={shell}>
      {body}
    </button>
  );
}
