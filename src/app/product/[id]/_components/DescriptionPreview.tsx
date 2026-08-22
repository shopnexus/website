import Link from "next/link";

/**
 * The first few lines of what the seller wrote, beside the photo.
 *
 * The middle column holds the name and the facts, and on a listing with three facts and no
 * variants that left a third of the first screen empty — the emptiness read as "this page has
 * nothing to say about this thing", which on a used-goods listing is the opposite of true. The
 * description is where the honest sellers put the scratches, and it was five hundred pixels
 * further down.
 *
 * A preview, not a copy: it clamps at four lines and hands off to the full section, which
 * keeps its own expand control. Wide screens only — below `lg` the whole description is a
 * short scroll away and showing the same paragraph twice in one screen is just noise.
 */
export default function DescriptionPreview({ description }: { description: string }) {
  if (description.trim() === "") return null;

  return (
    <div className="hidden border-t border-outline-variant pt-4 lg:block">
      <h2 className="font-label-sm uppercase tracking-wide text-on-surface-variant">
        Mô tả từ người bán
      </h2>
      <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap font-body-sm leading-relaxed text-on-surface">
        {description}
      </p>
      <Link
        href="#description"
        className="mt-2 inline-flex items-center gap-1 font-label-sm font-bold text-primary hover:underline"
      >
        Đọc đầy đủ
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          arrow_downward
        </span>
      </Link>
    </div>
  );
}
