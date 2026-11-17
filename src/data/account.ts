// Mock content for Tôi, Thông báo, Tin nhắn and the account settings pages,
// from .superdesign/tools/build_j_account.py and the builders it imports
// (build_account.py, build_chat_cod.py).

import { MONEY } from './common';
import { crop, img } from '../lib/format';
import { R } from '../lib/routes';

/** The buyer's phone as the account pages show it. */
export const PHONE = '09•• ••• 812';

/** Tôi's "Tin của bạn": a draft, two on sale, one sold. */
export const MY_LISTINGS = [
  { kind: 'draft', photo: '1586023492125-27b2c045efd7', title: 'Ghế bành bọc vải vàng mù tạt' },
  {
    kind: 'sale',
    photo: '1505740420928-5e560c06d30e',
    title: 'Tai nghe Sony WH-1000XM4, fullbox',
    price: 3_200_000,
    chats: '8',
    views: '146',
    judge: 'Cao hơn 12%',
  },
  { kind: 'sale', photo: '1585515320310-259814833e62', title: 'Máy xay sinh tố 2L, còn bảo hành', price: 450_000, chats: '3', views: '61' },
  { kind: 'sold', photo: '1593764592116-bfb2a97c642a', title: 'Fixie đen mờ size 50', price: 1_800_000 },
] as const satisfies readonly {
  kind: 'draft' | 'sale' | 'sold';
  photo: string;
  title: string;
  price?: number;
  chats?: string;
  views?: string;
  judge?: string;
}[];

export type NoteTab = 'deal' | 'price' | 'account';

export interface Note {
  tone: 'offer' | 'deal' | 'neutral';
  icon: string;
  /** May hold <b> for the person or item. */
  html: string;
  when: string;
  unread?: boolean;
  photo?: string;
  action?: { label: string; href: string };
  /** Which Thông báo tab shows it, besides Tất cả. */
  tab: NoteTab;
}

/** Thông báo, by day. 3 unread, as the account nav says. */
export const NOTES: [string, Note[]][] = [
  [
    'Hôm nay',
    [
      {
        tone: 'offer',
        icon: 'sell-outline-rounded',
        html: "<b class='font-medium'>Tuấn Kiệt</b> trả 4.900.000 ₫ cho iPhone 13 Pro 128GB",
        when: '10 phút',
        unread: true,
        photo: '1632661674596-df8be070a5c5',
        action: { label: 'Xem trong chat', href: R.messages },
        tab: 'deal',
      },
      {
        tone: 'deal',
        icon: 'local-shipping-outline-rounded',
        html: `Shipper đang tới giao <b class='font-medium'>Sony WH-1000XM4</b>. ${MONEY.cod_buyer}`,
        when: '32 phút',
        unread: true,
        photo: '1505740420928-5e560c06d30e',
        action: { label: 'Mở đơn COD', href: R.order('o1') },
        tab: 'deal',
      },
      {
        tone: 'deal',
        icon: 'inventory-2-outline-rounded',
        html: "<b class='font-medium'>Đức Huy</b> gửi yêu cầu COD cho Ghế xoay vải be. Tạo đơn trong Đơn bán.",
        when: '1 giờ',
        unread: true,
        photo: '1580480055273-228ff5388ef8',
        action: { label: 'Tạo đơn', href: R.sales },
        tab: 'deal',
      },
      {
        tone: 'offer',
        icon: 'trending-down-rounded',
        html: 'Máy ảnh Polaroid OneStep 2 bạn đã lưu giảm còn 1.590.000 ₫',
        when: '3 giờ',
        photo: '1526170375885-4d8ecf77b99f',
        tab: 'price',
      },
    ],
  ],
  [
    'Hôm qua',
    [
      {
        tone: 'deal',
        icon: 'handshake-outline-rounded',
        html: "<b class='font-medium'>Lan Anh</b> đồng ý giá 1.650.000 ₫ cho Ghế bành bọc vải",
        when: '20:14',
        photo: '1586023492125-27b2c045efd7',
        tab: 'deal',
      },
      {
        tone: 'neutral',
        icon: 'search-rounded',
        html: '12 tin mới khớp “laptop cũ cho sinh viên thiết kế”',
        when: '18:02',
        action: { label: 'Xem kết quả', href: `${R.search}?q=${encodeURIComponent('laptop cũ cho sinh viên thiết kế')}` },
        tab: 'price',
      },
      {
        tone: 'neutral',
        icon: 'star-outline-rounded',
        html: "<b class='font-medium'>Minh Thư</b> chấm bạn 5 sao cho Máy xay sinh tố 2L",
        when: '09:30',
        tab: 'account',
      },
    ],
  ],
  [
    'Tuần này',
    [
      {
        tone: 'deal',
        icon: 'payments-outline-rounded',
        html: 'GHTK đã chuyển 450.000 ₫ tiền đơn Máy xay sinh tố vào tài khoản ngân hàng bạn khai với GHTK',
        when: 'Thứ Hai',
        tab: 'deal',
      },
      // The step count is filled in by the page from PROFILE_TASKS.
      { tone: 'neutral', icon: 'checklist-rounded', html: '', when: 'Thứ Hai', action: { label: 'Xem', href: R.profileTasks }, tab: 'account' },
      {
        tone: 'neutral',
        icon: 'favorite-outline-rounded',
        html: '20 người đã lưu Fixie đen mờ size 50 của bạn',
        when: 'Chủ nhật',
        photo: '1593764592116-bfb2a97c642a',
        tab: 'price',
      },
    ],
  ],
];

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

// ------------------------------------------------------ account settings --

export const PRIVACY = [
  { icon: 'database-outline-rounded', title: 'Thông tin ShopNexus lưu', text: 'Số điện thoại, khu vực, tin bạn đăng, tin nhắn, đơn hàng và đánh giá.' },
  {
    icon: 'local-shipping-outline-rounded',
    title: 'Bên vận chuyển',
    text: 'Khi có đơn COD, bên vận chuyển nhận tên, số điện thoại và địa chỉ giao nhận của đơn đó.',
  },
  {
    icon: 'photo-camera-outline-rounded',
    title: 'Ảnh và video khi đăng tin',
    text: 'AI đọc ảnh và video bạn chọn để điền tên, tình trạng và giá. Người mua thấy ảnh nào chụp trong app.',
  },
  {
    icon: 'delete-outline-rounded',
    title: 'Xóa dữ liệu',
    text:
      'Bạn xóa tài khoản trong Tôi › Bảo mật. Tin đăng và trang của bạn được gỡ ngay. ' +
      'ShopNexus lưu ghi nhận của các đơn đã xong trong 12 tháng, vì điểm uy tín tính trên 12 tháng.',
  },
];

/** Điểm uy tín: the tiers and where they start, and the buyer's score. */
export const TIERS: [string, number][] = [
  ['Mới', 0],
  ['Tin cậy', 200],
  ['Uy tín', 500],
  ['Xuất sắc', 800],
];
export const SCORE = 386;

export const REP_HISTORY = [
  { icon: 'star-outline-rounded', text: 'Gia Bảo đánh giá 5 sao', date: '12/10', pts: 5 },
  { icon: 'sell-outline-rounded', text: 'Bán Kệ gỗ nhỏ 3 tầng', date: '12/10', pts: 10 },
  { icon: 'shopping-bag-outline-rounded', text: 'Mua Tai nghe Sony WH-1000XM4', date: '09/10', pts: 10 },
  { icon: 'star-outline-rounded', text: 'Minh Thư đánh giá 2 sao', date: '02/10', pts: -15 },
  { icon: 'bolt-rounded', text: 'Trả lời nhanh cả tháng 9', date: '30/09', pts: 20 },
  { icon: 'star-outline-rounded', text: 'Hoàng Phúc đánh giá 4 sao', date: '21/09', pts: 2 },
];

export const REP_PLUS: [string, string][] = [
  ['Giao dịch xong', '+10'],
  ['Đánh giá 5 sao', '+5'],
  ['Đánh giá 4 sao', '+2'],
  ['Tự hoàn khi có ghi nhận', '+15'],
  ['Trả lời trong 1 giờ, cả tháng', '+20'],
  ['Xác minh danh tính', '+100'],
];
