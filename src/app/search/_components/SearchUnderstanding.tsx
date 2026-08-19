"use client";

import type { SearchState } from "../_hooks/useSearchFilters";

/**
 * What the search made of a typed query, and the phrases that actually widened the
 * ranking.
 *
 * `understood` is model-written prose, rendered as plain text and never as HTML — it
 * stays hidden whenever the model had nothing usable to add: a browse with no query
 * answers both fields empty, and a query the model could not read still gets its base
 * retrieval rather than a claimed understanding it never reached. `probes` always
 * includes the shopper's own words alongside whatever was corrected or expanded, so only
 * the phrases that differ from what they typed are shown as chips — echoing their own
 * words back as a "correction" would be exactly the coincidence this feature exists to
 * explain away.
 */
export default function SearchUnderstanding({ search }: { search: SearchState }) {
  const { understood, probes } = search.feed;
  const own = search.query.trim().toLowerCase();
  const corrected = probes.filter((probe) => probe.trim().toLowerCase() !== own);

  if (!understood && corrected.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      {understood && (
        <p className="flex items-start gap-2 text-body-sm text-on-surface-variant">
          <span
            className="material-symbols-outlined text-base text-primary shrink-0"
            aria-hidden="true"
          >
            auto_awesome
          </span>
          <span>{understood}</span>
        </p>
      )}

      {corrected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-sm text-on-surface-variant">Cũng tìm theo:</span>
          {corrected.map((probe) => (
            <span
              key={probe}
              className="rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1 text-label-sm text-on-surface-variant"
            >
              {probe}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
