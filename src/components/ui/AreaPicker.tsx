"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useProvinces, useWards } from "@/hooks/useAdminAreas";
import type { AdministrativeArea } from "@/api/generated/types.gen";

/**
 * Province then ward, in one searchable control. Hanoi has 526 wards, so it has to be
 * searchable, and matching folds diacritics — "ha noi" finds "Thành phố Hà Nội".
 *
 * The panel is a Radix popover: it portals out, so the list is not clipped by a card's
 * `overflow-hidden`, and outside-click, Escape and returning focus to the trigger come with
 * it. The listbox inside is still ours — Radix has no combobox, and the search box plus
 * diacritic folding is the whole point of this control.
 */
export interface AreaSelection {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
}

interface AreaPickerProps {
  provinceCode: string;
  wardCode: string;
  onChange: (next: AreaSelection) => void;
  /** Offer the ward level. A control that only narrows to a province leaves it off. */
  wards?: boolean;
  /** What "no area" reads as, and the label of the option that clears the picker. */
  placeholder?: string;
  /** Accessible name of the trigger. */
  label?: string;
  className?: string;
}

const EMPTY: AreaSelection = {
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
};

// Lowercased, diacritics stripped. Length-preserving on purpose, so an offset found here
// also indexes the original string.
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/** The name with the matched run marked, so a hit in a long list is findable by eye. */
function Highlighted({ name, term }: { name: string; term: string }) {
  if (!term) return <>{name}</>;
  const at = fold(name).indexOf(fold(term));
  if (at < 0) return <>{name}</>;
  const end = at + fold(term).length;
  return (
    <>
      {name.slice(0, at)}
      <mark className="bg-primary/15 text-primary font-bold rounded-sm px-0.5">
        {name.slice(at, end)}
      </mark>
      {name.slice(end)}
    </>
  );
}

export default function AreaPicker({
  provinceCode,
  wardCode,
  onChange,
  wards: offerWards = true,
  placeholder = "Toàn quốc",
  label = "Khu vực",
  className = "",
}: AreaPickerProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  // Which level the panel shows. Its own state, so "back" does not clear the selection.
  const [level, setLevel] = useState<"province" | "ward">("province");
  const [active, setActive] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const { data: provinces = [] } = useProvinces();
  // While open, the panel may show a province that is not the selected one. Closed, it
  // follows the selection, or a change from outside would leave stale wards loaded.
  const [browsing, setBrowsing] = useState(provinceCode);
  const shown = open ? browsing : provinceCode;
  const { data: wardList = [], isLoading: wardsLoading } = useWards(offerWards ? shown : "");

  const province = provinces.find((p) => p.code === provinceCode);
  const ward = wardList.find((w) => w.code === wardCode);
  const browsingProvince = provinces.find((p) => p.code === shown);

  // A ward name alone is ambiguous (many "Phường 3"), so it is shown under its province.
  const summary = !provinceCode
    ? placeholder
    : wardCode && ward
      ? `${ward.name}, ${province?.name ?? ""}`
      : (province?.name ?? placeholder);

  const source: AdministrativeArea[] = level === "ward" ? wardList : provinces;
  const matches = useMemo(() => {
    const needle = fold(term);
    if (!needle) return source;
    return source.filter((area) => fold(area.name).includes(needle));
  }, [source, term]);

  // The clear/all row is index 0 of the keyboard walk, so matches start at 1.
  const leadLabel =
    level === "ward"
      ? `Tất cả phường / xã${browsingProvince ? ` của ${browsingProvince.name}` : ""}`
      : placeholder;
  const rows = matches.length + 1;

  function commitProvince(area: AdministrativeArea) {
    onChange({
      provinceCode: area.code,
      provinceName: area.name,
      wardCode: "",
      wardName: "",
    });
    setBrowsing(area.code);
    if (offerWards) {
      // Straight on to the wards, rather than making them reopen the panel to go deeper.
      setLevel("ward");
      setTerm("");
      setActive(0);
      searchRef.current?.focus();
    } else {
      close();
    }
  }

  function commitWard(area: AdministrativeArea) {
    onChange({
      provinceCode: shown,
      provinceName: browsingProvince?.name ?? "",
      wardCode: area.code,
      wardName: area.name,
    });
    close();
  }

  /** The lead row: clears everything at province level, the ward only at ward level. */
  function commitLead() {
    if (level === "ward") {
      onChange({
        provinceCode: shown,
        provinceName: browsingProvince?.name ?? "",
        wardCode: "",
        wardName: "",
      });
    } else {
      onChange(EMPTY);
      setBrowsing("");
    }
    close();
  }

  function close() {
    setOpen(false);
    setTerm("");
  }

  function openPanel() {
    // Open where the selection already is, so narrowing further takes no extra step.
    setBrowsing(provinceCode);
    setLevel(offerWards && provinceCode ? "ward" : "province");
    setTerm("");
    setActive(0);
    setOpen(true);
  }

  function pick(index: number) {
    if (index === 0) return commitLead();
    const area = matches[index - 1];
    if (!area) return;
    if (level === "ward") commitWard(area);
    else commitProvince(area);
  }

  // Keep the active row in view while it is walked with the keyboard.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => (i + 1) % rows);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => (i - 1 + rows) % rows);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(rows - 1);
        break;
      case "Enter":
        event.preventDefault();
        pick(active);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Backspace":
        // Only when there is nothing to delete, or this fights the search box.
        if (term === "" && level === "ward") {
          event.preventDefault();
          setLevel("province");
          setActive(0);
        }
        break;
    }
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => (next ? openPanel() : close())}
    >
      <Popover.Trigger
        aria-label={label}
        className={`w-full flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 text-body-sm cursor-pointer hover:bg-surface-container-high transition-colors border border-outline-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left ${className}`}
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0" aria-hidden="true">
          location_on
        </span>
        <span className={`truncate flex-1 ${provinceCode ? "font-bold text-primary" : "text-on-surface"}`}>
          {summary}
        </span>
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          expand_more
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          // Radix moves focus to the panel on open; the search box is what should have it.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            searchRef.current?.focus();
          }}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[240px] bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden"
        >
          <div className="p-2 border-b border-outline-variant">
            {level === "ward" && (
              <button
                type="button"
                onClick={() => {
                  setLevel("province");
                  setTerm("");
                  setActive(0);
                  searchRef.current?.focus();
                }}
                className="flex items-center gap-1 mb-2 text-label-sm font-bold text-primary hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  arrow_back
                </span>
                Tỉnh / Thành phố
              </button>
            )}
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={`${listId}-${active}`}
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={
                level === "ward" ? "Tìm phường / xã..." : "Tìm tỉnh / thành phố..."
              }
              className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-1 focus:ring-primary border-none text-on-surface"
            />
          </div>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={level === "ward" ? "Phường / Xã" : "Tỉnh / Thành phố"}
            className="max-h-64 overflow-y-auto py-1"
          >
            <li
              id={`${listId}-0`}
              role="option"
              aria-selected={level === "ward" ? !wardCode : !provinceCode}
              onClick={() => pick(0)}
              onMouseEnter={() => setActive(0)}
              className={`px-3 py-2 text-body-sm cursor-pointer ${
                active === 0 ? "bg-surface-container" : ""
              } ${
                (level === "ward" ? !wardCode : !provinceCode)
                  ? "text-primary font-bold"
                  : "text-on-surface-variant"
              }`}
            >
              {leadLabel}
            </li>

            {level === "ward" && wardsLoading && (
              <li className="px-3 py-2 text-body-sm text-on-surface-variant" aria-hidden="true">
                Đang tải...
              </li>
            )}

            {matches.map((area, index) => {
              const row = index + 1;
              const selected =
                level === "ward" ? area.code === wardCode : area.code === provinceCode;
              return (
                <li
                  key={area.code}
                  id={`${listId}-${row}`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => pick(row)}
                  onMouseEnter={() => setActive(row)}
                  className={`px-3 py-2 text-body-sm cursor-pointer flex items-center justify-between gap-2 ${
                    active === row ? "bg-surface-container" : ""
                  } ${selected ? "text-primary font-bold" : "text-on-surface"}`}
                >
                  <span className="truncate">
                    <Highlighted name={area.name} term={term} />
                  </span>
                  {level === "province" && offerWards && (
                    <span
                      className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0"
                      aria-hidden="true"
                    >
                      chevron_right
                    </span>
                  )}
                </li>
              );
            })}

            {matches.length === 0 && !wardsLoading && (
              <li className="px-3 py-3 text-body-sm text-on-surface-variant">
                Không có khu vực nào khớp với &ldquo;{term}&rdquo;.
              </li>
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
