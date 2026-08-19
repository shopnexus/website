"use client";

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { recordInteraction } from "@/hooks/api/useCatalog";
import type { ListingId } from "@/api/generated/types.gen";

const UNDO_WINDOW_MS = 4000;

type DismissType = "not-interested" | "hidden";

const COPY: Record<DismissType, string> = {
  "not-interested": "Đã ghi nhận, sẽ ít gợi ý sản phẩm như thế này hơn",
  hidden: "Đã ẩn tin này khỏi Gợi ý cho bạn",
};

/**
 * A card leaving the recommended feed by the reader's own choice, not the server's — so the
 * card has to feel returnable for as long as it plausibly is. `dismissing` names a card mid
 * collapse (still in the list, animating out); the interaction itself is not sent to the
 * server until the undo window closes with nobody pressing it, so changing your mind costs
 * the platform nothing to honour. `hidden` is what actually drops a card from the list this
 * hook's caller renders.
 */
export function useDismissedListings() {
  const [dismissing, setDismissing] = useState<Set<ListingId>>(new Set());
  const [hidden, setHidden] = useState<Set<ListingId>>(new Set());
  const timers = useRef(new Map<ListingId, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: ListingId, type: DismissType) => {
    setDismissing((prev) => new Set(prev).add(id));

    const toastId = toast.custom(
      (t) => (
        <UndoToast
          message={COPY[type]}
          visible={t.visible}
          onUndo={() => {
            const timer = timers.current.get(id);
            if (timer) clearTimeout(timer);
            timers.current.delete(id);
            toast.dismiss(t.id);
            setDismissing((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }}
        />
      ),
      { duration: UNDO_WINDOW_MS },
    );

    const timer = setTimeout(() => {
      timers.current.delete(id);
      recordInteraction(id, type);
      setHidden((prev) => new Set(prev).add(id));
      toast.dismiss(toastId);
    }, UNDO_WINDOW_MS);
    timers.current.set(id, timer);
  }, []);

  return { isDismissing: (id: ListingId) => dismissing.has(id), isHidden: (id: ListingId) => hidden.has(id), dismiss };
}

/**
 * The one custom toast this app renders, and its whole reason to be one: the drain bar is the
 * undo window made visible, so "you have a moment to change your mind" is felt rather than
 * read off a number. The bar is a CSS animation keyed to the toast's own visible/leaving
 * state — react-hot-toast reuses DOM nodes across renders, so the width has to restart from a
 * fresh element each time a toast opens, not from a class toggled on one that already ran.
 */
function UndoToast({
  message,
  visible,
  onUndo,
}: {
  message: string;
  visible: boolean;
  onUndo: () => void;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-surface text-on-surface rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-outline-variant/60 min-w-[280px] max-w-sm transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">
          visibility_off
        </span>
        <p className="text-body-sm flex-1 min-w-0">{message}</p>
        <button
          type="button"
          onClick={onUndo}
          className="text-label-md font-bold text-primary shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
        >
          Hoàn tác
        </button>
      </div>
      {visible && (
        <div className="h-[3px] bg-primary/15">
          <div className="h-full bg-primary animate-toast-drain" />
        </div>
      )}
    </div>
  );
}
