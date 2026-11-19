import { type Api, ApiError, type Schemas, unwrap } from './api/client';
import { isId } from './listing';
import { isCarrier } from './orders';

// The seller's shipment for a pending order, and a manual code's correction:
// the form's fields as query keys, so a reload or a re-read keeps them, and
// the carrier reads (pickup points, fees, a code's preview) they need.

type Linked = Schemas['LinkedCarrier'];

/** Each linked carrier's services, as the app offers them. */
export const SERVICES: Record<Linked, { key: 'standard' | 'express'; name: string; days: string }[]> = {
  ghtk: [
    { key: 'express', name: 'Giao nhanh', days: '1–2 ngày' },
    { key: 'standard', name: 'Tiết kiệm', days: '2–4 ngày' },
  ],
  ghn: [{ key: 'standard', name: 'Giao chuẩn', days: '2–3 ngày' }],
};

/** The form as typed. via: a linked carrier, or manual for a code made on a carrier's own app. */
export interface ShipInput {
  via: Linked | 'manual';
  /** In kg, as typed: "2", "1,5". */
  weight: string;
  way: 'home' | 'post_office';
  /** saved, point:<id>, address:<id>, or empty for the carrier's default point. */
  from: string;
  service: string;
  /** manual: the carrier and the code. */
  carrier: string;
  code: string;
}

/** The query keys the form sends, with nothing else. */
export const SHIP_KEYS = ['via', 'weight', 'way', 'from', 'service', 'carrier', 'code'] as const;

/** The form from a query or a post, with the defaults for what is missing. */
export function shipInput(get: (k: string) => string | null, linked: Linked[], saved: boolean): ShipInput {
  const v = get('via');
  const via = v === 'manual' || linked.includes(v as Linked) ? (v as ShipInput['via']) : (linked[0] ?? 'manual');
  const services = via === 'manual' ? [] : SERVICES[via];
  const service = services.find((s) => s.key === get('service'))?.key ?? services[0]?.key ?? '';
  const c = get('carrier') ?? '';
  return {
    via,
    weight: (get('weight') ?? '2').trim().slice(0, 10),
    way: get('way') === 'post_office' ? 'post_office' : 'home',
    from: get('from') ?? (saved ? 'saved' : ''),
    service,
    carrier: linked.includes(c as Linked) ? c : (linked[0] ?? ''),
    code: (get('code') ?? '').trim().slice(0, 50),
  };
}

/** Grams from kg as typed, "," or "."; undefined outside 1 g to 20 kg. */
export function grams(kg: string) {
  const n = Number(kg.replace(',', '.'));
  const g = Math.round(n * 1000);
  return Number.isFinite(n) && g >= 1 && g <= 20_000 ? g : undefined;
}

type From = Schemas['LinkedShipmentDraft']['pickup_from'];

/** The pickup the form names, for a draft and a quote. */
export function pickupFrom(from: string): From {
  if (from === 'saved') return { saved_pickup: true };
  if (from.startsWith('point:')) return { carrier_pickup_id: from.slice(6, 60) };
  if (from.startsWith('address:') && isId(from.slice(8))) return { address_id: from.slice(8) };
  return undefined;
}

/** The body of createShipment. A weight out of range goes as 0, so the server names the field. */
export function draft(i: ShipInput): Schemas['ShipmentDraft'] {
  if (i.via === 'manual') return { mode: 'manual', carrier: i.carrier, tracking_code: i.code };
  return { mode: 'linked', carrier: i.via, service: i.service, weight_grams: grams(i.weight) ?? 0, pickup: i.way, pickup_from: pickupFrom(i.from) };
}

/** A carrier read that may be refused: its data, or the server's code. */
type Read<T> = { ok: T } | { error: string };

const read = <T>(run: Promise<T>): Promise<Read<T>> =>
  run.then((ok) => ({ ok })).catch((e) => ({ error: e instanceof ApiError ? e.code : 'unknown' }));

export interface ShipReads {
  pickups: Read<Schemas['PickupPoint'][]> | null;
  /** Each service's fee, by key. */
  fees: Record<string, Read<number>>;
  preview: Read<Schemas['ShipmentPreview']> | null;
}

/** What the form shows for its input: the pickup points, each service's fee and a manual code's preview. */
export async function shipReads(api: Api, order: string, i: ShipInput, withPickups = true): Promise<ShipReads> {
  if (i.via === 'manual') {
    const preview =
      i.code && isCarrier(i.carrier)
        ? await read(unwrap(api.GET('/v1/shipments/lookup', { params: { query: { carrier: i.carrier, code: i.code } } })))
        : null;
    return { pickups: null, fees: {}, preview };
  }
  const via = i.via;
  const g = grams(i.weight);
  const from = pickupFrom(i.from);
  const [pickups, ...fees] = await Promise.all([
    withPickups ? read(unwrap(api.GET('/v1/carrier-accounts/{carrier}/pickups', { params: { path: { carrier: via } } })).then((r) => r.items)) : null,
    ...SERVICES[via].map((s) =>
      g
        ? read(
            unwrap(
              api.GET('/v1/shipments/quote', {
                params: { query: { order_id: order, carrier: via, service: s.key, weight_grams: g, ...from } },
              }),
            ).then((q) => q.fee),
          )
        : Promise.resolve<Read<number>>({ error: 'invalid_shipment' }),
    ),
  ]);
  return { pickups, fees: Object.fromEntries(SERVICES[via].map((s, n) => [s.key, fees[n]])), preview: null };
}
