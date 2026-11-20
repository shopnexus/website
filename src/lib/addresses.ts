import { type Api, ApiError, type Schemas, idempotencyKey, unwrap } from './api/client';
import { phoneText } from './format';
import { ADDRESS_KIND, identity } from './profile';
import type { Viewer } from './session';

// On the server: the address form's values, its save and its refusals, for
// Địa chỉ's page post and the /api/addresses call the dialogs send.

export type AddressKind = keyof typeof ADDRESS_KIND;
export const kindOf = (k: string): AddressKind => (k in ADDRESS_KIND ? (k as AddressKind) : 'other');

/** The form as typed: a saved address, the posted values after a failed save, or a new one. */
export interface AddressDraft {
  id?: string;
  kind: AddressKind;
  name: string;
  phone: string;
  street: string;
  province: string;
  commune: string;
  isDefault: boolean;
}

/** A new address starts with the account's name and phone; the first one is the default. */
export function newDraft(v: Viewer, count: number): AddressDraft {
  const phone = identity(v.identities, 'phone');
  return { kind: 'home', name: v.named ? v.name : '', phone: phone ? phoneText(phone) : '', street: '', province: '', commune: '', isDefault: count === 0 };
}

export const savedDraft = (a: Schemas['Address']): AddressDraft => ({
  id: a.id,
  kind: kindOf(a.kind),
  name: a.name,
  phone: phoneText(a.phone),
  street: a.street,
  province: a.province_code,
  commune: a.commune_code,
  isDefault: a.is_default,
});

export function postedDraft(form: FormData): AddressDraft {
  const get = (k: string) => String(form.get(k) ?? '');
  return {
    id: get('id') || undefined,
    kind: kindOf(get('kind')),
    name: get('name'),
    phone: get('phone'),
    street: get('street'),
    province: get('province'),
    commune: get('commune'),
    isDefault: form.has('is_default'),
  };
}

/** Creates the draft, or updates it when it has an ID; `key` makes a repeated create one address. */
export function saveAddress(api: Api, d: AddressDraft, key: string) {
  const body = { name: d.name, phone: d.phone, street: d.street, commune_code: d.commune, kind: d.kind, is_default: d.isDefault };
  return unwrap(
    d.id
      ? api.PUT('/v1/addresses/{id}', { params: { path: { id: d.id } }, body })
      : api.POST('/v1/addresses', { params: { header: { 'Idempotency-Key': key || idempotencyKey() } }, body }),
  );
}

const FIELD_TEXT: Record<string, string> = {
  name: 'Tên người nhận từ 1 đến 50 ký tự.',
  phone: 'Số di động Việt Nam chưa đúng.',
  street: 'Số nhà, đường từ 1 đến 200 ký tự.',
  commune_code: 'Chọn phường, xã.',
};

/** What the form shows for a failed save: a sentence, and a line under each field the server marked. */
export interface AddressRefusal {
  error: string;
  fields: Record<string, string>;
}

export function addressRefusal(e: unknown): AddressRefusal {
  const code = e instanceof ApiError ? e.code : '';
  if (code === 'invalid_address') {
    const marked = (e as ApiError).fields;
    return { error: 'Kiểm tra lại các mục được đánh dấu.', fields: Object.fromEntries(Object.keys(marked).map((k) => [k, FIELD_TEXT[k] ?? 'Mục này chưa đúng.'])) };
  }
  const error =
    code === 'address_limit_reached'
      ? 'Bạn đã có 10 địa chỉ. Xóa bớt một địa chỉ để thêm mới.'
      : code === 'try_again'
        ? 'Địa chỉ vừa đổi ở nơi khác. Thử lưu lại.'
        : 'Chưa lưu được. Thử lại sau ít phút.';
  return { error, fields: {} };
}
