// Mock content for the orders pages: Đơn hàng, an order, Đơn bán,
// Thiết lập giao COD and Hỗ trợ. It comes from
// .superdesign/tools/build_j_orders.py and build_j_flows.py (support).

import { ADDRESS_BOOK, ME } from './common';

/** People's faces by name. */
export const FACE: Record<string, string> = {
  'Hoàng Nam': '1500648767791-00dcc994a43e',
  'Tuấn Kiệt': '1544723795-3fb6469f5b39',
  'Ngọc Hân': '1438761681033-6461ffad8d80',
  'Lan Anh': '1534528741775-53994a69daeb',
  'Quốc Bảo': '1507003211169-0a1dd7228f2d',
  'Gia Bảo': '1506794778202-cad84cf45f1d',
  'Đức Huy': '1500648767791-00dcc994a43e',
  'Minh Anh': '1544005313-94ddf0286df2',
  'Khánh Linh': ME.photo,
};

/** The buyer's home address, where o1 is delivered and where Thiết lập giao COD picks up. */
const HOME = ADDRESS_BOOK[0];
export const HOME_LINE = `${HOME.street}, ${HOME.ward}`;

// ------------------------------------------------------------- Đơn hàng --

export interface OrderRow {
  id: string;
  photo: string;
  title: string;
  who: string;
  price: number;
  /** The step in progress, 0–3; 4 when every step is done. */
  phase: number;
  icon: string;
  status: string;
  when: string;
  /** Received and not rated: the row shows five stars. */
  rate?: boolean;
  /** The status icon is the rating star. */
  star?: boolean;
  /** Cancelled or failed: the row is dimmed. */
  muted?: boolean;
}

export const BUYING: OrderRow[] = [
  { id: 'o1', photo: '1510557880182-3d4d3cba35a5', title: 'iPhone X 64GB, pin 86%', who: 'Hoàng Nam', price: 3_800_000, phase: 2,
    icon: 'local-shipping-outline-rounded', status: 'Chờ giao hàng', when: 'GHTK · đến hôm nay' },
  { id: 'o2', photo: '1632661674596-df8be070a5c5', title: 'iPhone 13 Pro 128GB Xanh Sierra, pin 88%', who: 'Tuấn Kiệt', price: 5_100_000, phase: 1,
    icon: 'hourglass-top-rounded', status: 'Chờ người bán tạo đơn', when: 'Chốt giá 09:40' },
  { id: 'o3', photo: '1505740420928-5e560c06d30e', title: 'Tai nghe chống ồn Sony WH-1000XM4, fullbox', who: 'Quốc Bảo', price: 3_100_000, phase: 3,
    icon: 'package-2-outline-rounded', status: 'Đã nhận hàng · 12/10', when: 'Nhận 12/10', rate: true },
  { id: 'o4', photo: '1526170375885-4d8ecf77b99f', title: 'Máy ảnh Polaroid OneStep 2, tặng 1 hộp film', who: 'Lan Anh', price: 1_650_000, phase: 4,
    icon: 'star-rounded', status: '5 sao cho Lan Anh', when: 'Xong 02/10', star: true },
  { id: 'o5', photo: '1580480055273-228ff5388ef8', title: 'Ghế xoay vải be chân gỗ, ngồi êm', who: 'Gia Bảo', price: 900_000, phase: 2,
    icon: 'undo-rounded', status: 'Giao không thành', when: '28/09', muted: true },
  { id: 'o6', photo: '1507035895480-2b3156c31fc8', title: 'Xe đạp fixed gear khung thép, vừa thay lốp', who: 'Ngọc Hân', price: 2_200_000, phase: 1,
    icon: 'cancel-outline-rounded', status: 'Đã hủy đơn', when: '21/09', muted: true },
];

export const ORDER_FILTERS = ['Tất cả', 'Đang mở · 2', 'Chờ đánh giá · 1', 'Đã xong', 'Không thành'];

/** Đơn COD đang mở: open orders out of the tier's limit. */
export const OPEN_COD = { open: 2, limit: 5 };

export const MONTH = {
  label: 'Tháng 10',
  rows: [
    ['Đơn đã nhận', '3'],
    ['Tiền hàng đã trả', '9.150.000 ₫'],
    ['Phí ship', '64.000 ₫'],
  ] as [string, string][],
};

// ------------------------------------------------------------- one order --

export interface OrderDetail {
  title: string;
  short: string;
  photo: string;
  heading: string;
  carrier: string;
  service: string;
  code: string;
  ref: string;
  eta: string;
  /** PhaseTrack's step and times. */
  phase: number;
  times: string[];
  /** What the listing says to check at the door. */
  events: { title: string; sub: string; when: string; now?: boolean }[];
  updated: string;
  to: { line: string; who: string; window: string };
  seller: { name: string; rating: string; sold: number };
  price: number;
  ship: number;
}

export const ORDERS: Record<string, OrderDetail> = {
  o1: {
    title: 'iPhone X 64GB, pin 86%',
    short: 'iPhone X 64GB',
    photo: '1510557880182-3d4d3cba35a5',
    heading: 'Chờ giao hàng',
    carrier: 'GHTK',
    service: 'Giao nhanh',
    code: 'S1.A1.17373471',
    ref: 'SNX 5521 0937',
    eta: 'Dự kiến hôm nay',
    phase: 2,
    times: ['Hôm qua 09:15', 'Hôm qua 10:02', 'Hôm nay', ''],
    events: [
      { title: 'Đang giao hàng', sub: 'Shipper Văn Tài · 09•• ••• 117', when: 'Hôm nay 08:05', now: true },
      { title: 'Đến kho Bình Thạnh', sub: 'GHTK', when: 'Hôm qua 21:10' },
      { title: 'Đã lấy hàng', sub: 'GHTK', when: 'Hôm qua 16:40' },
      { title: 'Người bán tạo đơn', sub: 'Hoàng Nam · GHTK Giao nhanh', when: 'Hôm qua 10:02' },
      { title: 'Chốt giá 3.800.000 ₫', sub: 'Từ 4.000.000 ₫, sau 3 lần trả giá', when: 'Hôm qua 09:15' },
    ],
    updated: 'GHTK cập nhật 08:05',
    to: { line: HOME_LINE, who: 'Khánh Linh · 09•• ••• 812', window: 'Dự kiến hôm nay, 14:00–18:00' },
    seller: { name: 'Hoàng Nam', rating: '4,7', sold: 12 },
    price: 3_800_000,
    ship: 22_000,
  },
};

// --------------------------------------------------------------- Đơn bán --

export const SALE = {
  title: 'Ghế đôn gỗ cao',
  photo: '1503602642458-232111445657',
  buyer: 'Đức Huy',
  buyerArea: 'Phường Cầu Kiệu',
  since: '09:12',
  price: 350_000,
  ship: 22_000,
  ref: 'SNX 8841 2207',
  to: { line: '45 Phan Xích Long, Phường Cầu Kiệu, TP.HCM', who: 'Đức Huy · 09•• ••• 345' },
  account: 'S55163',
  services: [
    { t: 'Giao nhanh', sub: '1–2 ngày', end: '22.000 ₫', on: true },
    { t: 'Tiết kiệm', sub: '2–4 ngày', end: '16.000 ₫' },
  ],
  pickupWays: [
    { t: 'Lấy tại nhà', sub: 'Shipper tới lấy', on: true },
    { t: 'Gửi tại bưu cục', sub: 'Bạn mang ra bưu cục gần nhất' },
  ],
  /** The GHTK warehouse, then the seller's own addresses. */
  pickupAt: [
    { t: 'Kho Bình Thạnh', sub: '12 Nơ Trang Long, Phường Bình Thạnh', on: true },
    ...ADDRESS_BOOK.map((a) => ({ t: a.label, sub: `${a.street}, ${a.ward.replace(', TP.HCM', '')}` })),
  ] as { t: string; sub: string; on?: boolean }[],
};

// ---------------------------------------------------- Thiết lập giao COD --

export const SENDER = { name: 'Nguyễn Khánh Linh', phone: '0912 345 812', shop: 'S55163' };

// ---------------------------------------------------------------- Hỗ trợ --

export const NO_ARBITRATION = 'Hệ thống không phân xử giữa người mua và người bán.';

export const TICKET_KINDS = {
  not_received: { icon: 'package-2-outline-rounded', name: 'Báo chưa nhận hàng' },
  carrier_request: { icon: 'local-shipping-outline-rounded', name: 'Xin thêm hãng' },
  other: { icon: 'chat-outline-rounded', name: 'Yêu cầu khác' },
} as const;

export const TICKETS: { kind: keyof typeof TICKET_KINDS; subject: string; last: string; when: string; open: boolean }[] = [
  { kind: 'not_received', subject: 'iPhone X 64GB, pin 86%', last: 'Bạn kiểm tra giúp mình với bảo vệ toà nhà…', when: '09:05', open: true },
  { kind: 'carrier_request', subject: 'Ninja Van', last: 'Bạn: Mình gửi Ninja Van vì gần nhà, phí rẻ hơn GHTK.', when: 'Hôm qua', open: true },
  { kind: 'other', subject: 'Lọc theo khu vực hay nhảy về Q.1 dù mình đã chọn Bình Thạnh.', last: 'Cảm ơn bạn. Lỗi này đã sửa trong bản 2.4, bạn cập nhật app giúp mình nhé.', when: 'Thứ Hai', open: false },
];

export const REPORT = 'GHTK báo đã giao lúc 14:20 hôm qua nhưng mình chưa nhận được, nhà không ai ký nhận.';

export const SUPPORT_REPLY = [
  'Chào bạn, mình đã xem lịch trình GHTK của đơn: bưu tá báo giao lúc 14:20 tại 12 Nguyễn Gia Trí, Bình Thạnh.',
  'Bạn kiểm tra giúp mình với bảo vệ toà nhà, mình cũng báo GHTK kiểm tra lại.',
];

export const SUPPORT_TRACK = [
  { title: 'Đã lấy hàng', sub: 'Hôm kia, 16:40 · Gò Vấp', ok: true },
  { title: 'Đang giao', sub: 'Hôm qua, 09:12 · Bình Thạnh', ok: true },
  { title: 'Hãng báo đã giao', sub: 'Hôm qua, 14:20 · 12 Nguyễn Gia Trí', ok: true },
  { title: 'Bạn báo chưa nhận', sub: 'Hôm nay, 08:12', ok: false },
];

export const QUICK_QUESTIONS = [
  'Tôi có phải trả tiền trước không?',
  'Mở ra thấy không đúng mô tả thì sao?',
  'Hãng báo đã giao mà tôi chưa nhận?',
  'Tôi hủy đơn được không?',
];
