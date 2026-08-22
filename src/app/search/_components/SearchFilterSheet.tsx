"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { SearchState } from "../_hooks/useSearchFilters";
import { FilterControls } from "./SearchFilterPanel";

/**
 * The filters on a phone, where the rail used to stack above the results — a screenful to
 * scroll past before seeing a match.
 *
 * Radix's dialog rather than a hand-rolled overlay, the same choice `ui/Modal` made: focus
 * trapping, restoring focus on close, Escape and the body scroll lock are the hard parts, and
 * mine had only the last two. Not `ui/Modal` itself, which is a centred card with no footer
 * slot — this is full-height and needs the sticky "see the results" bar.
 *
 * Every control applies immediately, so the footer closes rather than commits.
 */
export default function SearchFilterSheet({
  search,
  open,
  onClose,
}: {
  search: SearchState;
  open: boolean;
  onClose: () => void;
}) {
  const { totalCount, listings, hasNextPage } = search.feed;
  const found =
    totalCount !== null
      ? `${totalCount} kết quả`
      : `${hasNextPage ? `hơn ${listings.length}` : listings.length} kết quả`;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col rounded-t-2xl bg-surface md:hidden"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-outline-variant px-4 py-3">
            <Dialog.Title className="font-headline font-bold text-headline-sm text-on-surface">
              Bộ lọc
            </Dialog.Title>
            <div className="flex items-center gap-3">
              {search.hasAnyFilter && (
                <button
                  type="button"
                  onClick={search.clearAll}
                  className="text-primary font-label-sm font-bold hover:underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
              <Dialog.Close
                aria-label="Đóng bộ lọc"
                className="material-symbols-outlined cursor-pointer rounded-full text-on-surface-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                close
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FilterControls search={search} />
          </div>

          <div className="shrink-0 border-t border-outline-variant px-4 py-3">
            <Dialog.Close className="w-full cursor-pointer rounded-full bg-primary py-3 text-label-lg text-on-primary transition-opacity hover:opacity-90">
              Xem {found}
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
