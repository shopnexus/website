/** A fresh Idempotency-Key, for a write the server may see twice. No server imports, so page scripts use it too. */
export const idempotencyKey = () => crypto.randomUUID();

/** A UUIDv7 (time first), for an id the site mints itself, such as a draft's. */
export function uuidv7() {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let t = Date.now();
  for (let i = 5; i >= 0; i--, t = Math.floor(t / 256)) b[i] = t % 256;
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
