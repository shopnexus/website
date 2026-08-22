"use client";

import Tabs from "@/components/ui/Tabs";

/**
 * The status strip above a queue.
 *
 * Every staff queue is sliced by status and by nothing else at the top level, so the slice
 * lives in one place across all four of them: above the list, as tabs. Two queues used to
 * put the same choice inside the list header as pill buttons with their own active colours,
 * which made "waiting on me" look like a different kind of control depending on which desk
 * you were sitting at.
 */
export default function QueueTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: ReadonlyArray<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}) {
  // Not `fullWidth`. Four labels of two words each were being stretched across the whole
  // panel, ~280px per tab, so the strip read as four buttons rather than as one control.
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest px-1">
      <Tabs tabs={[...tabs]} activeTabId={active} onChange={(id) => onChange(id as T)} />
    </div>
  );
}
