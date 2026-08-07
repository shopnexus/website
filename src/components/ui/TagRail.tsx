import Link from "next/link";
import type { TagSlug } from "@/api/generated/types.gen";

/**
 * A listing's tags, each a link into the browse filtered by it.
 *
 * A tag's id *is* its slug, so the chip needs no lookup and the href needs no encoding
 * beyond the value itself. Written with the leading `#` because that is how people write
 * tags — the API stores `may-anh-film`, and a shopper reads `#may-anh-film`.
 */
export default function TagRail({
  tags,
  className = "",
}: {
  tags: ReadonlyArray<TagSlug>;
  className?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <ul className={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/search?tag=${encodeURIComponent(tag)}`}
            className="inline-flex items-center rounded-full border border-outline-variant bg-surface px-3 py-1.5 font-label-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
