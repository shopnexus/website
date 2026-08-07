"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Copied" as a self-clearing flag.
 *
 * The timer is held in a ref and cleared on unmount because these chips sit in rows that
 * a filter change unmounts mid-flight — a setState after that is a React warning and a
 * leak, and a staff table re-filters constantly.
 */
export function useCopyKey(resetAfterMs = 1400) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (value: string) => {
      // Insecure origins and older browsers have no clipboard API; the chip then just
      // does nothing rather than throwing into the console on every click.
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(value);
      setCopiedKey(value);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedKey(null), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { copiedKey, copy };
}
