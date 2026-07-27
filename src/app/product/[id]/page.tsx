import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { PRODUCTS, formatPrice } from "@/lib/mock-data";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.id === resolvedParams.id) || PRODUCTS[0];
  const { seller } = product;

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-24">
      {/* ── Breadcrumb ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center text-sm text-on-surface-variant font-label-md">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
          <Link href={`/search?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
          {product.subcategory && (
            <>
              <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
              <Link href="#" className="hover:text-primary transition-colors">{product.subcategory}</Link>
            </>
          )}
          <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
          <span className="text-on-surface truncate">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Column: Images ── */}
          <div className="w-full lg:w-[500px] shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden mb-4 relative aspect-[4/5]">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {/* Product Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount && (
                  <Badge variant="error">-{product.discount}%</Badge>
                )}
                <Badge variant="surface">{product.condition}</Badge>
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={["relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors", idx === 0 ? "border-primary" : "border-transparent hover:border-outline-variant"].join(" ")}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
              {product.imageCount && product.imageCount > product.images.length && (
                <button className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-transparent bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
                  <span className="font-bold">+{product.imageCount - product.images.length}</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Right Column: Info ── */}
          <div className="flex-1">
            <h1 className="font-headline-md font-bold text-on-surface mb-4">
              {product.title}
            </h1>

            <div className="bg-surface rounded-2xl p-6 border border-outline-variant mb-6 shadow-sm">
              <div className="flex items-end gap-4 mb-2">
                <span className="font-display-lg text-[40px] text-primary font-bold leading-none tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="font-price-lg text-on-surface-variant line-through mb-1">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 text-body-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
                Cam kết hoàn tiền 100% nếu hàng không đúng mô tả
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <Link href={`/shop/${seller.id}`} className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-outline-variant">
                <Image src={seller.avatar} alt={seller.name} fill className="object-cover" />
              </Link>
              <div className="flex-1 text-center sm:text-left">
                <Link href={`/shop/${seller.id}`} className="font-headline-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center justify-center sm:justify-start gap-1">
                  {seller.name}
                  {seller.isVerified && (
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </Link>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {seller.rating} ({seller.reviewCount})
                  </span>
                  <span>•</span>
                  <span>Đã bán: {seller.soldCount}+</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" icon={<span className="material-symbols-outlined">chat</span>} className="flex-1 sm:flex-none">
                  Chat
                </Button>
                <Link href={`/shop/${seller.id}`} className="flex-1 sm:flex-none">
                  <Button variant="secondary" className="w-full">
                    Xem Shop
                  </Button>
                </Link>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 mb-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Chi tiết sản phẩm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-body-md">
                <div className="flex border-b border-outline-variant border-dashed pb-2">
                  <span className="text-on-surface-variant w-1/3">Tình trạng:</span>
                  <span className="text-on-surface font-medium flex-1 text-right">{product.condition}</span>
                </div>
                {product.brand && (
                  <div className="flex border-b border-outline-variant border-dashed pb-2">
                    <span className="text-on-surface-variant w-1/3">Thương hiệu:</span>
                    <span className="text-on-surface font-medium flex-1 text-right">{product.brand}</span>
                  </div>
                )}
                {product.warranty && (
                  <div className="flex border-b border-outline-variant border-dashed pb-2">
                    <span className="text-on-surface-variant w-1/3">Bảo hành:</span>
                    <span className="text-on-surface font-medium flex-1 text-right">{product.warranty}</span>
                  </div>
                )}
                <div className="flex border-b border-outline-variant border-dashed pb-2">
                  <span className="text-on-surface-variant w-1/3">Khu vực:</span>
                  <span className="text-on-surface font-medium flex-1 text-right">{product.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Mô tả</h3>
              <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 p-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <span className="font-label-md text-on-surface-variant">Tổng thanh toán:</span>
            <span className="font-display-lg text-[24px] text-primary font-bold leading-none">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="px-6 py-3 shrink-0 h-12 rounded-xl text-on-surface">
              <span className="material-symbols-outlined mr-2">favorite</span>
              Lưu
            </Button>
            <Button variant="secondary" className="flex-1 sm:flex-none px-6 py-3 h-12 rounded-xl text-on-secondary-container">
              Thêm vào giỏ
            </Button>
            <Link href="/checkout" className="flex-1 sm:flex-none">
              <Button variant="primary" className="w-full px-8 py-3 h-12 rounded-xl font-bold">
                Mua ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
