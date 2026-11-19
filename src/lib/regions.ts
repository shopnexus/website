import { apiClient, unwrap } from './api/client';

// Provinces and their communes, the same for everyone and rarely changed:
// read once per day per process, a province's communes when first asked for.

const DAY = 86_400_000;
const cache = new Map<string, { at: number; run: Promise<{ code: string; name: string }[]> }>();

function once(key: string, load: () => Promise<{ code: string; display_name: string }[]>) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < DAY) return hit.run;
  const run = load().then((items) => items.map((r) => ({ code: r.code, name: r.display_name })));
  cache.set(key, { at: Date.now(), run });
  run.catch(() => cache.delete(key));
  return run;
}

export const provinces = () => once('', async () => (await unwrap(apiClient().GET('/v1/regions'))).items);

export const communes = (province: string) =>
  once(province, async () => (await unwrap(apiClient().GET('/v1/regions/{province_code}/communes', { params: { path: { province_code: province } } }))).items);
