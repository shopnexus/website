import { starSlots } from "@/lib/reviews";

/**
 * A row of five stars. Read-only — the interactive picker on the review composer is its
 * own component, because a control needs hover, keyboard focus and a name, and a badge
 * beside a price needs none of that.
 */
export default function StarRating({
  rating,
  size = 18,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={["inline-flex items-center gap-0.5 text-primary", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={`${rating} trên 5 sao`}
    >
      {starSlots(rating).map((filled, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`material-symbols-outlined leading-none ${filled ? "" : "text-outline-variant"}`}
          style={{ fontSize: size, fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </span>
  );
}
