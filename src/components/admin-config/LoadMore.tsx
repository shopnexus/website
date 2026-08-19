"use client";

import Button from "@/components/ui/Button";

/**
 * One "load more" for every staff queue.
 *
 * There were four of these, and they disagreed about everything a user can see: centred or
 * full-width, `size="sm"` or the default, and — on two neighbouring pages — "Đang tải..."
 * against "Đang tải…", three dots against an ellipsis.
 */
export default function LoadMore({
  isFetching,
  onClick,
}: {
  isFetching: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-center">
      <Button variant="outline" size="sm" disabled={isFetching} onClick={onClick}>
        {isFetching ? "Đang tải..." : "Tải thêm"}
      </Button>
    </div>
  );
}
