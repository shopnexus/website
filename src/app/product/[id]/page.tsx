import ProductPage from "./_components/ProductPage";

/**
 * The route, and nothing else.
 *
 * The segment is either handle the page accepts: the public slug every link on this site builds,
 * or the bare opaque id — which is what an order item or a ticket has to link by, having no slug
 * to build one from. The API resolves both, so neither needs a redirect here.
 *
 * No data is read on this side. It used to await seven requests before the first byte and the
 * page was still slow to *use*: the router holds the previous screen until the server is done, so
 * a click cost ~880ms of nothing on screen for about 20ms of actual API work. Everything is
 * fetched from the browser now — see `ProductPage`, which also names what that trades away.
 */
export default async function ProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductPage id={id} />;
}
