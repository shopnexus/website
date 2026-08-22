import type { Fact } from "../_lib/facts";

/**
 * The facts a buyer weighs, where they weigh them: directly under the price.
 *
 * Everything here was already on the listing and none of it was on screen — where the goods are
 * and how far away, when the tin was posted, the declared condition, the warranty the seller
 * typed in. On a marketplace where the counterparty is a person rather than a shop, that set
 * *is* the offer: a phone posted this morning two districts away is a different proposition
 * from the same phone posted in March on the other side of the country.
 *
 * It is a plain grid, and the plainness is the second attempt. The first was a bordered card of
 * its own with dotted leaders and an icon per row, which made a product page read like a filed
 * receipt and added a third box to a column that already had two. A shopper scanning a listing
 * is not reading a document; they are checking four things and moving on. Label above value,
 * two columns, one container — the shape every marketplace uses, because it is the one that
 * disappears.
 */
export default function QuickFacts({ facts }: { facts: readonly Fact[] }) {
  if (facts.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {facts.map((fact) => (
        <div key={fact.key} className="min-w-0">
          <dt className="font-label-sm text-on-surface-variant">{fact.label}</dt>
          <dd
            className={[
              "mt-0.5 flex items-center gap-1.5 font-body-md font-medium",
              // The one row that may carry colour: a listing sold as damaged is the fact a
              // skimming reader must not miss.
              fact.tone === "warning" ? "text-error" : "text-on-surface",
            ].join(" ")}
          >
            {fact.tone === "warning" && (
              <span className="material-symbols-outlined shrink-0 text-[18px]" aria-hidden="true">
                report
              </span>
            )}
            <span className="truncate">{fact.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
