import type { APIRoute } from 'astro';
import { relay } from '../../../lib/api/relay';
import { communes } from '../../../lib/regions';

/** GET: a province's communes, for Địa chỉ's commune picker; browsers may keep them a day. */
export const GET: APIRoute = async ({ params, locals }) => {
  const res = await relay(locals, () => communes(params.province ?? ''), { guests: true });
  if (res.ok) res.headers.set('cache-control', 'public, max-age=86400');
  return res;
};
