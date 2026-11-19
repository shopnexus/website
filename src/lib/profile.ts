import { type Schemas, unwrap } from './api/client';
import { phoneText } from './format';

// What Tôi and Hoàn thiện hồ sơ say about the server's profile steps and
// addresses.

export type TaskKey = Schemas['ProfileTask']['key'];

/** Each profile step's icon and title. */
export const TASK: Record<TaskKey, { icon: string; title: string }> = {
  avatar: { icon: 'account-circle-outline-rounded', title: 'Ảnh đại diện' },
  bio: { icon: 'edit-note-rounded', title: 'Giới thiệu bản thân' },
  address: { icon: 'home-outline-rounded', title: 'Địa chỉ nhận hàng' },
  phone: { icon: 'phone-android-outline-rounded', title: 'Số điện thoại' },
};

/** The reputation view, read once per request: the account nav and the page that shows it share it. */
export function reputation(locals: App.Locals) {
  locals.reputation ??= unwrap(locals.api.GET('/v1/screens/reputation'));
  return locals.reputation;
}

/** An address kind's icon and label. */
export const ADDRESS_KIND: Record<Schemas['AddressKind'], { icon: string; label: string }> = {
  home: { icon: 'home-outline-rounded', label: 'Nhà' },
  work: { icon: 'work-outline-rounded', label: 'Công ty' },
  other: { icon: 'location-on-outline-rounded', label: 'Khác' },
};

/** The account's phone or email, or undefined. */
export const identity = (identities: Schemas['Identity'][], kind: Schemas['Identity']['kind']) => identities.find((i) => i.kind === kind)?.value;

/** The account's phone identity, masked, or undefined. */
export const phoneOf = (identities: Schemas['Identity'][]) => {
  const p = identity(identities, 'phone');
  return p && phoneText(p, true);
};
