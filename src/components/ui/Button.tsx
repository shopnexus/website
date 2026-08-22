"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "error";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:brightness-110 hover:shadow-md hover:shadow-primary/20 active:scale-95 shadow-sm",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 hover:shadow-sm active:scale-95",
  outline:
    "bg-transparent border border-outline text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-95",
  ghost:
    "bg-transparent text-on-surface-variant hover:text-primary hover:bg-primary/5 active:scale-95",
  error:
    "bg-error text-on-error hover:brightness-110 hover:shadow-md hover:shadow-error/20 active:scale-95 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1",
  md: "px-4 py-2 text-sm gap-1.5",
  lg: "px-6 py-3 text-base gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
