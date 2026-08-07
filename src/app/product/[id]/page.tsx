import Link from "next/link";
import { getListingsById } from "@/api/generated/sdk.gen";
import type { ListingId } from "@/api/generated/types.gen";
import { notFound } from "next/navigation";
import ListingRail from "./_components/ListingRail";
import ProductInteractiveViewer from "./_components/ProductInteractiveViewer";
import ProductReviews from "./_components/ProductReviews";
import { fetchSellerListings, fetchSimilarListings } from "./_lib/related";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // A Server Component calling the generated SDK directly: no hook, no query client. The
  // runtime config reads the access token from next/headers on this side, so an
  // authenticated view (a seller's own hidden listing) still resolves.
  const { data, error } = await getListingsById({ path: { id: id as ListingId } });
  if (error || !data) notFound();

  const product = data.data;

  // Both rails are ordinary searches, so they are fetched together and on the server —
  // the page is already awaiting the listing, and two more reads beside it cost one round
  // trip rather than two client renders with a spinner in each.
  const [similar, fromSeller] = await Promise.all([
    fetchSimilarListings(product),
    fetchSellerListings(product),
  ]);

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-24">
      <div className="max-w-[1024px] mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center text-sm text-on-surface-variant font-label-md">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
          <Link href={`/search?category=${product.category.id}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
          <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
          <span className="text-on-surface truncate">{product.name}</span>
        </nav>
      </div>

      <ProductInteractiveViewer product={product} />

      <div className="max-w-[1024px] mx-auto px-4 md:px-8">
        <ProductReviews product={product} />

        <ListingRail
          title="Sản phẩm tương tự"
          listings={similar}
          moreHref={`/search?category=${product.category.id}`}
          moreLabel="Xem cả danh mục"
        />
        <ListingRail
          title={`Cùng người bán · ${product.seller.name}`}
          listings={fromSeller}
          moreHref={`/shop/${product.seller.id}`}
          moreLabel="Xem gian hàng"
        />
      </div>
    </div>
  );
}
