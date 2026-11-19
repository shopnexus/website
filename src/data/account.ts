// Mock content for Tôi, Tin nhắn and the account settings pages,
// from .superdesign/tools/build_j_account.py and the builders it imports
// (build_account.py, build_chat_cod.py).

import { crop, img } from '../lib/format';

/** The buyer's phone as the account pages show it. */
export const PHONE = '09•• ••• 812';

// ------------------------------------------------------------ Tin nhắn --
// A conversation is the pair. Khánh Linh and Tuấn Kiệt have two deals: the
// iPhone 13 Pro (agreed at 5.100.000 ₫) and the AirPods Pro 2 (offered
// 3.000.000 ₫, waiting on him). Thanh Lý 24h's conversation carries the scam warning.

const PHOTO = '1632661674596-df8be070a5c5';
const AIRPODS = '1572569511254-d8f925fe2cbb';
export const THUMB = crop(PHOTO, 200, 0.5, 0.52, 1.25);
export const SELLER = { name: 'Tuấn Kiệt', photo: '1544723795-3fb6469f5b39' };
export const SCAMMER = { name: 'Thanh Lý 24h', photo: undefined };

export interface Deal {
  id: string;
  short: string;
  title: string;
  photo: string;
  chip: string;
  meta: string;
  listed: string;
  agreed?: string;
  offer?: string;
}

export const DEALS: Deal[] = [
  {
    id: 'iphone',
    short: 'iPhone 13 Pro',
    title: 'iPhone 13 Pro 128GB, Xanh Sierra, pin 88%',
    photo: crop(PHOTO, 640, 0.5, 0.52, 1.25),
    chip: crop(PHOTO, 72, 0.5, 0.52, 1.25),
    meta: 'Như mới · Bình Thạnh · 2,1 km',
    listed: '5.200.000 ₫',
    agreed: '5.100.000 ₫',
  },
  {
    id: 'airpods',
    short: 'AirPods Pro 2',
    title: 'AirPods Pro 2, hộp sạc USB-C',
    photo: crop(AIRPODS, 640),
    chip: crop(AIRPODS, 72),
    meta: 'Như mới · Bình Thạnh · 2,1 km',
    listed: '3.200.000 ₫',
    offer: '3.000.000 ₫',
  },
];

export const SCAM_ITEM = {
  title: 'Galaxy S23 Ultra 256GB, đen',
  photo: img('1678911820864-e2c567c655d7', 640, 480),
  thumb: img('1678911820864-e2c567c655d7', 160, 160),
  meta: 'Như mới · Q.10 · 4,6 km',
  listed: '8.700.000 ₫',
};

export const SIGNALS = [
  { icon: 'account-balance-outline-rounded', text: 'Đòi chuyển cọc ngoài app' },
  { icon: 'person-add-outline-rounded', text: 'Tài khoản 2 ngày tuổi, chưa xác minh' },
  { icon: 'sell-outline-rounded', text: 'Giá thấp hơn 40% so với tin tương tự' },
];

export const REASONS = [
  { key: 'banned', label: 'Hàng cấm bán' },
  { key: 'fake', label: 'Hàng giả, hàng nhái' },
  { key: 'scam', label: 'Có dấu hiệu lừa đảo' },
  { key: 'other', label: 'Lý do khác' },
];

export interface Conversation {
  id: string;
  name: string;
  photo?: string;
  time: string;
  /** The listing the chat opens on; none for a chat without a deal. */
  item?: string;
  thumb?: string;
  /** The pair's other deals. */
  more?: number;
  preview: string;
  status?: { icon: string; text: string };
  scam?: boolean;
  unread?: number;
  /** sell: the listing is yours. */
  role?: 'buy' | 'sell' | 'none';
  /** It has a pane on this page. */
  opens?: boolean;
}

export const INBOX: Conversation[] = [
  {
    id: 'kiet',
    name: 'Tuấn Kiệt',
    photo: SELLER.photo,
    time: '14:13',
    item: 'iPhone 13 Pro 128GB',
    thumb: THUMB,
    more: 1,
    preview: 'AirPods để mình xem lại rồi báo bạn nha.',
    status: { icon: 'handshake-outline-rounded', text: '5,1 tr' },
    opens: true,
  },
  {
    id: 'scam',
    name: SCAMMER.name,
    time: '13:41',
    item: 'Galaxy S23 Ultra 256GB',
    thumb: SCAM_ITEM.thumb,
    preview: 'Bạn chuyển cọc 500k qua số tài khoản này để mình giữ máy nhé.',
    scam: true,
    unread: 1,
    opens: true,
  },
  {
    id: 'quang',
    name: 'Minh Quang',
    time: '13:22',
    item: 'Đàn guitar Yamaha F310',
    thumb: img('1525201548942-d8732f6617a0', 160, 160),
    preview: 'Đàn còn không bạn? Mai mình qua xem được không?',
    unread: 1,
    role: 'sell',
  },
  { id: 'vy', name: 'Thảo Vy', photo: '1517841905240-472988babdf9', time: '10:05', role: 'none', preview: 'Bạn còn món nào khác không? Mình ở gần Bình Thạnh.' },
  {
    id: 'huy',
    name: 'Đức Huy',
    time: '09:12',
    item: 'Ghế đôn gỗ cao',
    thumb: img('1503602642458-232111445657', 160, 160),
    preview: 'Mình chọn COD rồi nha, bạn tạo đơn giúp mình.',
    status: { icon: 'receipt-long-outline-rounded', text: 'Chờ tạo đơn' },
    role: 'sell',
  },
  {
    id: 'thu',
    name: 'Minh Thư',
    photo: '1438761681033-6461ffad8d80',
    time: 'Hôm qua',
    item: 'Bàn phím cơ 87 phím, switch đỏ',
    thumb: img('1595225476474-87563907a212', 160, 160),
    preview: 'Shipper báo chiều nay giao, mình nhận rồi báo bạn nhé.',
    status: { icon: 'local-shipping-outline-rounded', text: 'Đang giao' },
    role: 'sell',
  },
  {
    id: 'nam',
    name: 'Hoàng Nam',
    photo: '1500648767791-00dcc994a43e',
    time: 'Hôm qua',
    item: 'iPhone X 64GB, pin 86%',
    thumb: img('1510557880182-3d4d3cba35a5', 160, 160),
    preview: 'Ok bạn, chốt 3,8 tr. Bạn chọn COD đi, mình tạo đơn liền.',
    status: { icon: 'handshake-outline-rounded', text: '3,8 tr' },
  },
  {
    id: 'bao',
    name: 'Gia Bảo',
    photo: '1506794778202-cad84cf45f1d',
    time: 'Thứ Hai',
    item: 'Kệ gỗ nhỏ 3 tầng',
    thumb: img('1532372320572-cda25653a26d', 160, 160),
    preview: 'Cảm ơn bạn, kệ đẹp lắm!',
    status: { icon: 'check-circle-outline-rounded', text: '650.000 ₫' },
    role: 'sell',
  },
];
