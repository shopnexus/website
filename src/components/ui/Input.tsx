import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: string;
  rightElement?: ReactNode;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftIcon,
      rightElement,
      error,
      fullWidth = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <div
        className={[
          "relative flex flex-col",
          fullWidth ? "w-full" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={[
"w-full rounded-2xl border bg-surface-container-lowest text-body-md text-on-surface outline-none transition-all duration-300 shadow-sm",
              "focus:bg-surface focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-md",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-container",
              error
                ? "border-error focus:border-error focus:ring-error/20 text-error"
                : "border-outline hover:border-primary",
              leftIcon ? "pl-11" : "pl-4",
              rightElement ? "pr-12" : "pr-4",
              "py-3",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-error text-body-xs mt-1 ml-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
