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

      <div className="mt-4 overflow-hidden rounded-3xl border border-outline-variant bg-surface">
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
          <Group title="Từ khoá">
            <div className="px-5 py-3 sm:px-6">
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
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <div className="bg-surface-container-low px-5 py-2.5 sm:px-6">
        <h3 className="font-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
          {title}
        </h3>
        {note && <p className="mt-0.5 font-body-sm text-on-surface-variant">{note}</p>}
      </div>
      <dl className="flex flex-col">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-outline-variant px-5 py-3 last:border-b-0 sm:px-6">
      <dt className="w-32 shrink-0 font-body-sm text-on-surface-variant sm:w-44">{label}</dt>
      <dd className="min-w-0 flex-1 font-body-md text-on-surface">{value}</dd>
    </div>
  );
}
