import type { Schemas } from './api/client';
import type { Condition } from './listing';
import { parseMoney } from './format';

// The Đăng tin form as the server takes it: the posted fields, a listing to
// post, a draft to keep, and the form filled back from a draft or a listing.

export interface SellFields {
  title: string;
  description: string;
  /** A subcategory code, or empty. */
  category: string;
  condition: Condition | '';
  /** Whole đồng, or null while none is typed. */
  price: number | null;
  offers: boolean;
  province: string;
  commune: string;
  /** Upload ids in order; the first is the cover. */
  photos: string[];
  specs: Schemas['Spec'][];
}

export const TITLE_MAX = 70;
export const DESCRIPTION_MAX = 1500;
export const PHOTOS_MAX = 10;
export const SPECS_MAX = 20;
/** The web's layout of a draft's body; the app writes 1. */
const WEB_DRAFT = 100;

export const emptyFields = (): SellFields => ({
  title: '',
  description: '',
  category: '',
  condition: '',
  price: null,
  offers: true,
  province: '',
  commune: '',
  photos: [],
  specs: [],
});

const isCondition = (c: string): c is Condition => c === 'new' || c === 'like_new' || c === 'used';

/** The form as posted, from the page or from the autosave. */
export function readSellForm(form: FormData): SellFields {
  const s = (k: string) => String(form.get(k) ?? '');
  const labels = form.getAll('spec_label').map(String);
  const values = form.getAll('spec_value').map(String);
  const condition = s('condition');
  return {
    title: s('title').trim(),
    description: s('description').trim(),
    category: s('category'),
    condition: isCondition(condition) ? condition : '',
    price: parseMoney(s('price')),
    offers: form.has('allow_offers'),
    province: s('province'),
    commune: s('commune'),
    photos: [...new Set(form.getAll('photo').map(String).filter(Boolean))].slice(0, PHOTOS_MAX),
    specs: labels
      .map((label, i) => ({ label: label.trim(), value: (values[i] ?? '').trim() }))
      .filter((p) => p.label || p.value)
      .slice(0, SPECS_MAX),
  };
}

/** The listing to post or to replace with, once a condition is chosen. The server checks the rules. */
export const listingInput = (f: SellFields & { condition: Condition }): Schemas['ListingInput'] => ({
  title: f.title,
  description: f.description,
  price: f.price ?? 0,
  category_code: f.category,
  condition: f.condition,
  allow_offers: f.offers,
  commune_code: f.commune,
  photos: f.photos,
  specs: f.specs,
});

/** The draft to keep; the body holds what the server does not read. */
export const draftInput = (f: SellFields): Schemas['ListingDraftInput'] => ({
  schema_version: WEB_DRAFT,
  title: f.title.slice(0, 100),
  price: f.price,
  photos: f.photos,
  body: JSON.stringify({
    description: f.description,
    category: f.category,
    condition: f.condition,
    offers: f.offers,
    province: f.province,
    commune: f.commune,
    specs: f.specs,
  }),
});

/** A kept draft as the form, with each photo's URL. A body the web did not write keeps title, price and photos. */
export function fromDraft(d: Schemas['ListingDraft']): { fields: SellFields; urls: Record<string, string> } {
  let body: Partial<SellFields> = {};
  if (d.schema_version === WEB_DRAFT) {
    try {
      body = JSON.parse(d.body);
    } catch {
      body = {};
    }
  }
  const fields = { ...emptyFields(), ...body, title: d.title, price: d.price ?? null, photos: d.photos.map((p) => p.upload_id) };
  if (!isCondition(fields.condition)) fields.condition = '';
  return { fields, urls: Object.fromEntries(d.photos.map((p) => [p.upload_id, p.url])) };
}

/** A listing as the form, for Sửa tin. */
export function fromListing(l: Schemas['Listing']): { fields: SellFields; urls: Record<string, string> } {
  return {
    fields: {
      title: l.title,
      description: l.description,
      category: l.category_code,
      condition: l.condition,
      price: l.price,
      offers: l.allow_offers,
      province: l.location.province.code,
      commune: l.location.commune.code,
      photos: l.photos.map((p) => p.upload_id),
      specs: l.specs,
    },
    urls: Object.fromEntries(l.photos.flatMap((p) => ((p.thumb_url ?? p.url) ? [[p.upload_id, (p.thumb_url ?? p.url)!]] : []))),
  };
}

/** invalid_listing's fields, as the form says them. */
export const FIELD_TEXT: Record<string, string> = {
  title: `Tiêu đề từ 1 đến ${TITLE_MAX} ký tự.`,
  price: 'Giá từ 10.000 ₫ đến 1 tỷ ₫.',
  description: `Mô tả tối đa ${DESCRIPTION_MAX} ký tự.`,
  category_code: 'Chọn danh mục.',
  condition: 'Chọn tình trạng.',
  commune_code: 'Chọn phường, xã.',
  photos: `Thêm từ 1 đến ${PHOTOS_MAX} ảnh.`,
  specs: 'Mỗi thông số có tên và giá trị, tối đa 50 ký tự.',
  gps: 'Vị trí cách phường, xã quá xa.',
};

/** A field name from the server (specs[2].label) as the form's key (specs). */
export const fieldKey = (k: string) => k.replace(/[[.].*$/, '');
