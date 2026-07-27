"use client";

import { useRef } from "react";
import { useSelect } from "@/hooks/ui/useSelect";
import { useClickOutside } from "@/hooks/ui/useClickOutside";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon,
  className = "",
}: SelectProps) {
  const { isOpen, toggleOpen, close, handleSelect } = useSelect(value, onChange);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, close);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full h-full flex items-center justify-between bg-transparent outline-none font-label-md text-on-surface cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap pl-2 pr-3 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md transition-shadow"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
      </button>

      <div 
        className={`absolute top-full mt-2 left-0 w-full min-w-[200px] bg-surface border border-outline-variant rounded-2xl shadow-lg shadow-black/5 z-50 overflow-hidden origin-top transition-all duration-200 ease-out ${
          isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <ul className="max-h-60 overflow-y-auto py-1">
          <li
            className={`px-4 py-3 font-label-md cursor-pointer transition-colors ${
              !value ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container-high"
            }`}
            onClick={() => handleSelect("")}
          >
            {placeholder}
          </li>
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`px-4 py-3 font-label-md cursor-pointer transition-colors ${
                value === opt.value
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface hover:bg-surface-container-high"
              }`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
