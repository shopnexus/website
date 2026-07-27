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
}

export default function Chip({
  variant = "filter",
  selected = false,
  onClick,
  children,
  className = "",
  icon,
  onRemove,
}: ChipProps){
  const baseStyles = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-pointer border";
  
  let dynamicStyles = "";

  if (selected) {
    dynamicStyles = "bg-primary-container text-on-primary-container border-transparent";
  } else {
    dynamicStyles = "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low";
  }

  const paddingStyles = variant === "category" ? "px-4 py-2" : "px-3 py-1.5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[baseStyles, dynamicStyles, paddingStyles, className].filter(Boolean).join(" ")}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px] mr-1.5">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {onRemove && (
        <span
          className="material-symbols-outlined text-[16px] ml-1.5 hover:text-on-surface"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          close
        </span>
      )}
    </button>
  );
}
