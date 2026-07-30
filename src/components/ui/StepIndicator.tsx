interface StepIndicatorProps {
  steps: string[];
  /** 0-indexed current step. Pass `steps.length` to mark all complete. */
  currentStep: number;
  className?: string;
}

export default function StepIndicator({
  steps,
  currentStep,
  className = "",
}: StepIndicatorProps) {
  return (
    <div
      className={[
        "flex items-center justify-center w-full max-w-xl mx-auto mb-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative z-10 w-24">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors",
                  isActive || isCompleted
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant",
                ].join(" ")}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[16px]">
                    check
                  </span>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={[
                  "text-xs font-semibold whitespace-nowrap text-center transition-colors",
                  isActive ? "text-primary" : "text-on-surface-variant",
                ].join(" ")}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 relative -top-3">
                <div
                  className={[
                    "h-full transition-colors",
                    isCompleted ? "bg-primary" : "bg-outline-variant",
                  ].join(" ")}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
