/** A fresh Idempotency-Key, for a write the server may see twice. No server imports, so page scripts use it too. */
export const idempotencyKey = () => crypto.randomUUID();
