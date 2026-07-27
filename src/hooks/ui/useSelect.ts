import { useState, useCallback } from "react";

export function useSelect(initialValue?: string, onChange?: (value: string) => void) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((newValue: string) => {
    onChange?.(newValue);
    setIsOpen(false);
  }, [onChange]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggleOpen,
    close,
    handleSelect,
  };
}
