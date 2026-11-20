import { type Api, unwrap } from './api/client';
import { parseMoney } from './format';
import { errorCode } from './messages';

// The seller's answers to a buyer's offer on Trả giá: the page's form post
// and /api/offers/<deal> both run them here.

/** Runs the seller's answer to the open offer on `deal`; resolves to the server's refusal code, or '' when it went through. */
export async function answerOffer(api: Api, deal: string, answer: string, form: FormData): Promise<string> {
  const path = { params: { path: { id: deal } } };
  try {
    switch (answer) {
      case 'accept':
        await unwrap(api.POST('/v1/deals/{id}/accept', { ...path, body: { price: Number(form.get('price')) } }));
        return '';
      case 'counter':
        await unwrap(api.POST('/v1/deals/{id}/offer', { ...path, body: { amount: parseMoney(String(form.get('amount') ?? '')) ?? 0 } }));
        return '';
      case 'decline':
        await unwrap(api.POST('/v1/deals/{id}/decline', path));
        return '';
    }
    return 'move_not_allowed';
  } catch (e) {
    return errorCode(e);
  }
}
