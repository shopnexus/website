"use client";

import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import { useCategories, useListing, useListings } from "@/hooks/api/useCatalog";
import { usePublicAccount, useReputation } from "@/hooks/api/useShop";
import { useAuthStore } from "@/stores/use-auth-store";
import { listingIsLive } from "@/lib/listing-state";
import { isStaff } from "@/lib/staff";
import { categoryPath } from "../_lib/context";
import { excludeSelf, sellerFilters, similarFilters } from "../_lib/related";
import ListingDownBanner from "./ListingDownBanner";
import ListingRail from "./ListingRail";
import ListingUnavailable from "./ListingUnavailable";
import ProductInteractiveViewer from "./ProductInteractiveViewer";
import ViewTracker from "./ViewTracker";

/**
 * The product page, fetched from the browser.
 *
 * It was a Server Component awaiting seven reads before the first byte: the listing, the whole
 * category tree, the seller's profile, the seller's reputation and both rails. Every one of those
 * is fast — measured against the gateway they are 1–13ms each, about 20ms in total — and the page
 * was still slow to *use*, because none of it is what a reader waits for. Clicking a card and
 * waiting for the server to finish all of it took ~880ms with nothing on screen: the App Router
 * holds the old page until the new one is ready, and `loading.tsx` never appeared.
 *
 * So the shell is rendered immediately and the data arrives into it. The listing is the only read
 * anything waits for; the breadcrumb, the seller's record and the two rails fill in beside it and
 * are all optional — a page missing its rails is a page, a blank one is not.
 *
 * The trade this makes, said out loud: a product page is no longer server-rendered with its
 * content, so a crawler sees the shell. For a marketplace that is a real cost on the one page
 * most worth indexing, and the fix when it matters is `generateMetadata` plus a server-rendered
 * summary — not going back to awaiting six reads that nobody was waiting for.
 */
export default function ProductPage({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useListing(id);

  // Persisted in localStorage, so it is there on the first render rather than a tick later —
  // which is what stops a seller's own hidden listing flashing "unavailable" before the store
  // has caught up.
  const me = useAuthStore((s) => s.user);

  // Everything below is secondary and every one of them is `enabled` on the listing: they are
  // requests about a listing, so there is nothing to ask until there is one.
  const { data: categories } = useCategories();
  const { data: account } = usePublicAccount(product?.seller.id);
  const { data: reputation } = useReputation(product?.seller.id, "seller");
  const similar = useListings(
    product ? similarFilters(product) : {},
    1,
    Boolean(product),
  );
  const fromSeller = useListings(
    product ? sellerFilters(product) : {},
    1,
    Boolean(product),
  );

  if (isLoading) return <ProductSkeleton />;
  if (isError || !product) return <NotFound />;

  // A listing that is not live is served to everyone by design — a cart line and an order item
  // both have to render one — and it is the client that owes the reader the difference. Its
  // seller and staff may still read it; nobody else may.
  const live = listingIsLive(product);
  if (!live && !(me?.id === product.seller.id || isStaff(me?.role))) {
    return <ListingUnavailable listing={product} />;
  }

  const crumbs = categories
    ? categoryPath(categories, product.category.id)
    : [{ id: product.category.id, name: product.category.name }];

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24">
      {/* A view is a shopper looking at something for sale. Nothing here is. */}
      {live && <ViewTracker listingId={product.id} />}
      {!live && <ListingDownBanner listing={product} />}

      <nav
        aria-label="Đường dẫn"
        className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-y-1 px-4 py-4 font-label-md text-on-surface-variant md:px-8"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          Trang chủ
        </Link>
        {crumbs.map((crumb) => (
          <span key={crumb.id} className="flex items-center">
            <Crumbline />
            <Link
              href={`/search?category=${crumb.id}`}
              className="transition-colors hover:text-primary"
            >
              {crumb.name}
            </Link>
          </span>
        ))}
        <span className="flex min-w-0 items-center">
          <Crumbline />
          <span className="truncate text-on-surface">{product.name}</span>
        </span>
      </nav>

      <ProductInteractiveViewer
        product={product}
        standing={{ account: account ?? null, reputation: reputation ?? null }}
      />

      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <ListingRail
          title="Sản phẩm tương tự"
          listings={excludeSelf(similar.data, product)}
          moreHref={`/search?category=${product.category.id}`}
          moreLabel="Xem cả danh mục"
        />
        <ListingRail
          title={`Cùng người bán · ${product.seller.name}`}
          listings={excludeSelf(fromSeller.data, product)}
          moreHref={`/shop/${product.seller.id}`}
          moreLabel="Xem gian hàng"
        />
      </div>
    </div>
  );
}

function Crumbline() {
  return (
    <span className="material-symbols-outlined mx-1.5 text-[16px]" aria-hidden="true">
      chevron_right
    </span>
  );
}

/**
 * The shape of the page, before the page.
 *
 * Deliberately the same geometry as the real thing — a 46% gallery, a card beside it, a band
 * under both — so the layout does not jump when the listing lands. A spinner would say "wait";
 * this says "here is what is coming".
 */
function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-surface-container-lowest pb-24">
      <div className="mx-auto max-w-[1200px] px-4 py-4 md:px-8">
        <Skeleton className="h-5 w-72 rounded-lg" />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-[46%] lg:max-w-[520px] lg:shrink-0">
            <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
            <div className="mt-4 flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[68px] w-[68px] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl border border-outline-variant bg-surface p-5 sm:p-6">
              <Skeleton className="h-7 w-4/5 rounded-lg" />
              <Skeleton className="mt-3 h-4 w-52 rounded-lg" />
              <Skeleton className="mt-6 h-10 w-48 rounded-lg" />
              <Skeleton className="mt-4 h-4 w-40 rounded-lg" />
              <div className="mt-6 flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="mt-8 h-[120px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * A listing that is not there.
 *
 * Its own state rather than `notFound()`: this renders in the browser, where the framework's
 * not-found is not reachable — and a listing that was deleted is a thing a reader arrived at from
 * a saved link, so the page owes them somewhere to go rather than a bare 404.
 */
function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="material-symbols-outlined text-5xl text-outline" aria-hidden="true">
        search_off
      </span>
      <h1 className="font-headline-sm font-bold text-on-surface">
        Không tìm thấy tin đăng này
      </h1>
      <p className="max-w-md font-body-md text-on-surface-variant">
        Tin có thể đã được bán, bị người bán xoá, hoặc đường dẫn không đúng.
      </p>
      <Link
        href="/search"
        className="mt-2 rounded-full bg-primary px-6 py-2.5 font-label-md text-on-primary transition-opacity hover:opacity-90"
      >
        Tìm sản phẩm khác
      </Link>
    </div>
  );
}
