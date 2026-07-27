import type { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "error" | "success" | "outline" | "surface" | "glass";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  icon?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  error: "bg-error text-on-error",
  success: "bg-[#10b981] text-white", 
  outline: "bg-transparent text-on-surface border border-outline-variant",
  surface: "bg-surface-container-high text-on-surface",
  glass: "bg-black/50 text-white backdrop-blur-md", 
};

export default function Badge({
  variant = "surface",
  children,
  className = "",
  icon,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-sm px-1.5 py-0.5 text-[11px] font-semibold transition-colors",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && (
        <span
          className="material-symbols-outlined text-[12px] mr-1"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
