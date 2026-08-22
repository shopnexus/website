import TagRail from "@/components/ui/TagRail";
import { PRICE_MODE_VI } from "@/lib/dictionaries";
import { formatLocation } from "../_lib/facts";
import type { SpecEntry } from "../_lib/facts";
import type { ListingDetail } from "@/api/generated/types.gen";

/**
 * Every specification, whatever the seller called it.
 *
 * The old table hardcoded two keys — `brand` and `warranty_remaining` — so a seller who
 * filled in eight rows in the posting flow had six of them silently dropped, and the AI
 * suggestion that fills that form in produced fields no buyer ever saw. This renders the
 * whole object, plus the shipping weight and dimensions the carrier is quoted from and the
 * full address the ledger shows only the district of.
 */
export default function SpecTable({
  product,
  specifications,
  packaging,
}: {
  product: ListingDetail;
  specifications: readonly SpecEntry[];
  packaging: readonly SpecEntry[];
}) {
  return (
    <section id="specifications" className="scroll-mt-32">
      <h2 className="font-headline-sm font-bold text-on-surface">Thông số & chi tiết</h2>

      <div className="mt-3 max-w-[980px] overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        {/* Condition, where the goods are and when the tin went up are beside the price, where a
            buyer weighs them. Repeating them here would be the same four facts twice. What is
            left for this group is the detail that does not fit up there. */}
        <Group title="Tin đăng">
          <Row label="Danh mục" value={product.category.name} />
          <Row label="Hình thức giá" value={PRICE_MODE_VI[product.price_mode]} />
          {product.location && (
            <Row label="Địa chỉ đầy đủ" value={formatLocation(product.location)} />
          )}
        </Group>

        {specifications.length > 0 && (
          <Group title="Thông số sản phẩm">
            {specifications.map((entry) => (
              <Row key={entry.key} label={entry.label} value={entry.value} />
            ))}
          </Group>
        )}

        {packaging.length > 0 && (
          <Group
            title="Đóng gói & vận chuyển"
            note="Phí vận chuyển được tính từ các số liệu này."
          >
            {packaging.map((entry) => (
              <Row key={entry.key} label={entry.label} value={entry.value} />
            ))}
          </Group>
        )}

        {product.tags.length > 0 && (
          <Group title="Từ khoá" plain>
            <div className="px-4 py-2.5 sm:px-5">
              <TagRail tags={product.tags} />
            </div>
          </Group>
        )}
      </div>
    </section>
  );
}

function Group({
  title,
  note,
  plain = false,
  children,
}: {
  title: string;
  note?: string;
  /** Renders the body as-is. The tag rail is not label/value pairs, so it is not a `dl`. */
  plain?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <div className="bg-surface-container-low px-4 py-2 sm:px-5">
        <h3 className="font-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
          {title}
        </h3>
        {note && <p className="mt-0.5 font-body-sm text-on-surface-variant">{note}</p>}
      </div>
      {/* Two columns from `md` up. One column of label/value pairs across 980px leaves the value
          stranded half a page from the thing it describes; the pair is the unit, so the pairs
          wrap rather than the rows stretching. */}
      {plain ? children : <dl className="md:grid md:grid-cols-2">{children}</dl>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-outline-variant px-4 py-2.5 last:border-b-0 sm:px-5 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
      <dt className="w-28 shrink-0 font-body-sm text-on-surface-variant sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1 font-body-sm font-medium text-on-surface">{value}</dd>
    </div>
  );
}
