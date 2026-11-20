import { type Api, type Schemas, unwrap } from './client';
import type { ListingStep } from '../my-listings';
import { fromListing, listingInput } from '../sell';

// Runs a step of Tin của bạn on one of the seller's listings and answers the
// listing as it is after (none after delete). price replaces the price and
// keeps the rest; relist posts the listing again with copies of its photos.

export interface StepInput {
  price?: number;
  /** The Idempotency-Key of a price change or a relist, kept for a retry. */
  key: string;
}

export async function runListingStep(api: Api, step: ListingStep, id: string, { price, key }: StepInput): Promise<Schemas['Listing'] | undefined> {
  const path = { params: { path: { id } } };
  const header = { 'Idempotency-Key': key };
  switch (step) {
    case 'hide':
      return unwrap(api.POST('/v1/listings/{id}/hide', path));
    case 'unhide':
      return unwrap(api.POST('/v1/listings/{id}/unhide', path));
    case 'mark-sold':
      return unwrap(api.POST('/v1/listings/{id}/mark-sold', path));
    case 'unmark-sold':
      return unwrap(api.POST('/v1/listings/{id}/unmark-sold', path));
    case 'delete':
      await unwrap(api.DELETE('/v1/listings/{id}', path));
      return undefined;
    case 'price': {
      const body = listingInput({ ...(await current(api, id)), price: price ?? null });
      return unwrap(api.PUT('/v1/listings/{id}', { params: { path: { id }, header }, body }));
    }
    case 'relist': {
      const fields = await current(api, id);
      const copies = await unwrap(api.POST('/v1/listings/{id}/photo-copies', { params: { path: { id }, header } }));
      const body = listingInput({ ...fields, photos: copies.items.map((p) => p.upload_id) });
      return unwrap(api.POST('/v1/listings', { params: { header }, body }));
    }
  }
}

/** The listing as the form it was posted with. */
async function current(api: Api, id: string) {
  const l = await unwrap(api.GET('/v1/listings/{id}', { params: { path: { id } } }));
  return { ...fromListing(l).fields, condition: l.condition };
}
