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
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
      <Tabs
        tabs={[...tabs]}
        activeTabId={active}
        onChange={(id) => onChange(id as T)}
        fullWidth
      />
    </div>
  );
}
