import type { APIRoute } from 'astro';
import { ApiError, unwrap } from '../lib/api/client';
import { R } from '../lib/routes';
import { readSearch, watchInput } from '../lib/search';
import { loginUrl } from '../lib/session';

/** "Báo khi có tin mới": saves the search in `tim` and goes back to it; ?bao=day when 20 are saved already. */
export const POST: APIRoute = async ({ request, locals, cookies, url, redirect }) => {
  const raw = String((await request.formData()).get('tim') ?? '');
  const back = new URL(raw.startsWith('/') && !raw.startsWith('//') ? raw : R.search, url);
  if (!locals.session.token) return redirect(loginUrl(back), 303);
  const s = readSearch(back);
  if (s.q) {
    try {
      await unwrap(locals.api.POST('/v1/search/watches', { body: watchInput(s, cookies) }));
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 409) throw e;
      back.searchParams.set('bao', 'day');
    }
  }
  return redirect(back.pathname + back.search, 303);
};
