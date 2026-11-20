import type { APIRoute } from 'astro';
import { ApiError, unwrap } from '../../lib/api/client';
import { R, localPath } from '../../lib/routes';
import { readSearch, watchInput } from '../../lib/search';
import { loginUrl } from '../../lib/session';

/**
 * "Báo khi có tin mới": saves the search in `search` and goes back to `back`, the search itself
 * by default; ?watches=full when 20 are saved already.
 */
export const POST: APIRoute = async ({ request, locals, cookies, url, redirect }) => {
  const form = await request.formData();
  const search = new URL(localPath(String(form.get('search') ?? ''), R.search), url);
  const back = new URL(localPath(String(form.get('back') ?? ''), search.pathname + search.search), url);
  if (!locals.session.token) return redirect(loginUrl(back), 303);
  const s = readSearch(search);
  if (s.q) {
    try {
      await unwrap(locals.api.POST('/v1/search/watches', { body: watchInput(s, cookies) }));
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 409) throw e;
      back.searchParams.set('watches', 'full');
    }
  }
  return redirect(back.pathname + back.search, 303);
};
