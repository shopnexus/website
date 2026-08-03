import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import { getListingsById } from "@/api/generated/sdk.gen";
import type { ListingDetail, ListingId } from "@/api/generated/types.gen";
import { notFound } from "next/navigation";
import ProductBottomBar from "./_components/ProductBottomBar";
import StartChatButton from "./_components/StartChatButton";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/**
 * The price on the card is the featured variant's, falling back to the cheapest — the same
 * rule the listing feed sorts by, so a product page never contradicts the card that led
 * to it.
 */
function displayPrice(product: ListingDetail): number {
  const featured = product.variants.find((v) => v.is_featured);
  if (featured) return featured.price;
  return product.variants.reduce(
    (min, v) => (min === null || v.price < min ? v.price : min),
    null as number | null,
  ) ?? 0;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // A Server Component calling the generated SDK directly: no hook, no query client. The
  // runtime config reads the access token from next/headers on this side, so an
  // authenticated view (a seller's own hidden listing) still resolves.
  const { data, error } = await getListingsById({ path: { id: id as ListingId } });
  if (error || !data) notFound();

  const product = data.data;
  const { seller } = product;
  const price = displayPrice(product);

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center text-sm text-on-surface-variant font-label-md">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
          <Link href={`/search?category=${product.category.id}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
          <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
          <span className="text-on-surface truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[500px] shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden mb-4 relative aspect-[4/5]">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center">No Image</div>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge variant="surface">{LISTING_CONDITION_VI[product.condition as keyof typeof LISTING_CONDITION_VI] || product.condition}</Badge>
              </div>
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    className={["relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors", idx === 0 ? "border-primary" : "border-transparent hover:border-outline-variant"].join(" ")}
                  >
                    <Image src={img?.url || ''} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-headline-md font-bold text-on-surface mb-4">
              {product.name}
            </h1>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant mb-6 shadow-sm">
              <div className="flex items-end gap-4 mb-2">
                <span className="font-display-lg text-[40px] text-primary font-bold leading-none tracking-tight">
                  {formatPrice(price)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
                Cam kết hoàn tiền 100% nếu hàng không đúng mô tả
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <Link href={`/shop/${seller.id}`} className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-outline-variant">
                {seller.avatar?.url ? (
                  <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary-container flex items-center justify-center text-xl font-bold">
                    {seller.name.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex-1 text-center sm:text-left">
                <Link href={`/shop/${seller.id}`} className="font-headline-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-1">
                  {seller.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <StartChatButton sellerId={seller.id} currentPath={`/product/${product.id}`} />
                <Link href={`/shop/${seller.id}`} className="flex-1 sm:flex-none">
                  <Button variant="secondary" className="w-full">
                    Xem Shop
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Chi tiết sản phẩm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-body-md">
                <div className="flex border-b border-outline-variant border-dashed pb-2">
                  <span className="text-on-surface-variant w-1/3">Tình trạng:</span>
                  <span className="text-on-surface font-medium flex-1 text-right">{LISTING_CONDITION_VI[product.condition as keyof typeof LISTING_CONDITION_VI] || product.condition}</span>
                </div>
                {Boolean(product.specifications?.brand) && (
                  <div className="flex border-b border-outline-variant border-dashed pb-2">
                    <span className="text-on-surface-variant font-label-md w-[120px]">Thương hiệu</span>
                    <span className="text-on-surface font-medium flex-1 text-right">{String(product.specifications.brand)}</span>
                  </div>
                )}
                {Boolean(product.specifications?.warranty_remaining) && (
                  <div className="flex border-b border-outline-variant border-dashed pb-2">
                    <span className="text-on-surface-variant font-label-md w-[120px]">Bảo hành</span>
                    <span className="text-on-surface font-medium flex-1 text-right">{String(product.specifications.warranty_remaining)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Mô tả</h3>
              <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductBottomBar product={product} price={price} />
    </div>
  );
}
