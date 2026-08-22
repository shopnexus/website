"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface MenuSelectOption {
  value: string;
  label: string;
  /**
   * Shown greyed and unselectable, with the reason as its title. An option that is not
   * available is still worth listing: "sắp xếp theo gần nhất" that vanished until a position
   * was shared is a feature nobody discovers.
   */
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Pick one of a few, in the app's own vocabulary.
 *
 * A native `<select>` is the right control and the wrong one to look at here: it is drawn by
 * the operating system, so it arrives in a different typeface at a different size with a
 * different focus ring, and this page had three of them sitting among controls that all agree
 * with each other. It also cannot show which option is chosen anywhere except in the closed
 * trigger, and cannot say *why* an option is unavailable.
 *
 * Not a replacement for `<select>` everywhere — a form with twenty options in it should keep
 * the native one, which is searchable by typing and better on a phone. This is for the handful:
 * a sort order, a radius, a saved address.
 *
 * `Select` already exists and is a different thing: it always offers a placeholder row that
 * clears the value, which is right for an optional filter and wrong for a setting that is
 * always set to something.
 */
export default function MenuSelect({
  options,
  value,
  onChange,
  label,
  className = "",
  align = "end",
}: {
  options: readonly MenuSelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Names the control for a screen reader — the trigger only shows the current choice. */
  label: string;
  className?: string;
  align?: "start" | "end";
}) {
  const current = options.find((option) => option.value === value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-md text-on-surface transition-colors hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:border-primary ${className}`}
      >
        <span className="truncate">{current?.label ?? label}</span>
        <span
          className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant transition-transform duration-200 data-[state=open]:rotate-180"
          aria-hidden="true"
        >
          expand_more
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          align={align}
          className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden rounded-xl border border-outline-variant bg-surface p-1 shadow-lg"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenu.RadioItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                title={option.disabled ? option.disabledReason : undefined}
                className="flex cursor-pointer items-center gap-2 rounded-lg py-2 pl-2 pr-3 font-body-sm text-on-surface outline-none transition-colors data-[disabled]:cursor-not-allowed data-[highlighted]:bg-surface-container data-[disabled]:text-outline"
              >
                {/* The tick lives in a fixed slot rather than appearing only when set, so the
                    labels line up whether or not a row is the chosen one. */}
                <span className="grid w-4 shrink-0 place-items-center">
                  <DropdownMenu.ItemIndicator>
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      check
                    </span>
                  </DropdownMenu.ItemIndicator>
                </span>
                <span className="truncate">{option.label}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
