"use client";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className = "",
}: QuantitySelectorProps){
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={["inline-flex items-center border border-outline-variant rounded-md overflow-hidden bg-surface h-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className="px-2.5 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">remove</span>
      </button>
      
      <div className="w-10 h-full flex items-center justify-center border-x border-outline-variant font-label-md text-on-surface">
        {value}
      </div>
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max}
        className="px-2.5 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  );
}
