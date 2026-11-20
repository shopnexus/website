import { ApiError, type Schemas } from './api/client';
import { CHAT_ERRORS } from './chat-errors';
import { dayLabel, money, phoneText } from './format';
import { hm } from './messages';

// Đơn mua, Đơn bán, one order, Giao COD and Hỗ trợ: the server's orders,
// shipments, carriers and tickets as the pages word them.

export type Order = Schemas['Order'];
export type OrderItem = Schemas['OrderItem'];
export type Role = 'buyer' | 'seller';

/** The carriers by code, as people name them. */
export const CARRIER: Record<Schemas['Carrier'], string> = {
  ghtk: 'GHTK',
  ghn: 'GHN',
  spx: 'SPX Express',
  jt: 'J&T Express',
  viettel_post: 'Viettel Post',
};

/** The two carriers a seller can link. */
export const LINKED: Schemas['LinkedCarrier'][] = ['ghtk', 'ghn'];

export const isCarrier = (c: string): c is Schemas['Carrier'] => c in CARRIER;

/** Where the parcel is, as its carrier reports it. */
export const SHIPMENT_STATUS: Record<Schemas['ShipmentStatus'], string> = {
  pending_pickup: 'Chờ lấy hàng',
  in_transit: 'Đang giao',
  delivered: 'Đã giao',
  failed: 'Giao không thành',
};

/** Why a pending order was cancelled. other: the other person's name. */
export function cancelText(o: Pick<Order, 'cancel_reason' | 'cancelled_by'>, role: Role, other: string) {
  switch (o.cancel_reason) {
    case 'seller_timeout':
      return 'Người bán chưa tạo đơn';
    case 'pickup_timeout':
      return 'Hãng chưa lấy hàng';
    case 'shipped_to_another':
      return 'Người bán đã gửi cho người khác';
    case 'listing_closed':
      return 'Tin đã đóng';
    default:
      return o.cancelled_by === role ? 'Bạn hủy' : `${other} hủy`;
  }
}

export interface OrderState {
  icon: string;
  /** The line under the title: what is happening, from the viewer's side. */
  label: string;
  /** Still moving: pending or shipped. */
  open: boolean;
  /** The step on the four-step track (Chốt giá, Tạo đơn, Nhận hàng, Đánh giá); 4 when all are done. */
  phase: number;
}

/** An order's state as the viewer sees it. other: the other person's name; stars: the viewer's review of them. */
export function orderState(o: Pick<Order, 'status' | 'shipment' | 'closed_at'>, role: Role, other: string, stars?: number): OrderState {
  const buyer = role === 'buyer';
  const day = o.closed_at ? dayLabel(o.closed_at) : '';
  switch (o.status) {
    case 'pending':
      return { icon: 'hourglass-top-rounded', label: buyer ? 'Chờ người bán tạo đơn' : `${other} chờ bạn tạo đơn`, open: true, phase: 1 };
    case 'shipped': {
      const s = o.shipment?.status;
      const icon = 'local-shipping-outline-rounded';
      if (buyer) return { icon, label: 'Chờ giao hàng', open: true, phase: 2 };
      if (s === 'in_transit') return { icon, label: `Đang giao cho ${other}`, open: true, phase: 2 };
      if (s === 'delivered') return { icon: 'package-2-outline-rounded', label: `Đã giao cho ${other}`, open: true, phase: 2 };
      return { icon, label: `Chờ ${o.shipment ? CARRIER[o.shipment.carrier] : 'hãng'} lấy hàng`, open: true, phase: 2 };
    }
    case 'completed':
      if (!buyer) return { icon: 'check-circle-outline-rounded', label: `${other} đã nhận hàng · ${day}`, open: false, phase: 4 };
      return stars
        ? { icon: 'star-rounded', label: `${stars} sao cho ${other}`, open: false, phase: 4 }
        : { icon: 'package-2-outline-rounded', label: `Đã nhận hàng · ${day}`, open: false, phase: 3 };
    case 'failed':
      return { icon: 'undo-rounded', label: 'Giao không thành', open: false, phase: 2 };
    default:
      return { icon: 'cancel-outline-rounded', label: 'Đã hủy đơn', open: false, phase: 1 };
  }
}

/** The day and hour an event happened: "Hôm nay 14:05", "02/10 09:12". */
export const at = (iso: string) => `${dayLabel(iso)} ${hm(iso)}`;

/** The row's short date: when it was asked for, shipped or closed. */
export function orderWhen(o: Pick<Order, 'requested_at' | 'shipped_at' | 'closed_at'>) {
  return dayLabel(o.closed_at ?? o.shipped_at ?? o.requested_at);
}

/** The recipient as one line, and the person with the phone. */
export function recipientLines(r: Schemas['Recipient']) {
  const line = [r.street, r.commune, r.province].filter(Boolean).join(', ');
  const who = [r.name, r.phone ? phoneText(r.phone) : ''].filter(Boolean).join(' · ');
  return { line, who };
}

/** The carrier's own tracking page for a code, when it has one. */
export function trackUrl(carrier: Schemas['Carrier'], code: string) {
  const c = encodeURIComponent(code);
  switch (carrier) {
    case 'ghtk':
      return `https://i.ghtk.vn/${c}`;
    case 'ghn':
      return `https://donhang.ghn.vn/?order_code=${c}`;
    case 'viettel_post':
      return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/?code=${c}`;
    default:
      return undefined;
  }
}

/** A step of the order's timeline, newest first. */
export interface TimelineStep {
  title: string;
  sub?: string;
  when: string;
}

/** The order's steps from its dates, newest first. */
export function timeline(o: Order, role: Role, other: string): TimelineStep[] {
  const steps: TimelineStep[] = [{ title: role === 'buyer' ? 'Bạn gửi yêu cầu COD' : `${other} gửi yêu cầu COD`, sub: money(o.price), when: at(o.requested_at) }];
  if (o.shipped_at && o.shipment) {
    steps.push({ title: role === 'seller' ? 'Bạn tạo đơn' : 'Người bán tạo đơn', sub: `${CARRIER[o.shipment.carrier]} · ${o.shipment.tracking_code}`, when: at(o.shipped_at) });
  }
  if (o.shipment?.delivered_at) steps.push({ title: 'Hãng báo đã giao', when: at(o.shipment.delivered_at) });
  if (o.closed_at) {
    const title =
      o.status === 'completed'
        ? o.completed_by === 'system'
          ? 'Đơn tự hoàn tất'
          : role === 'buyer'
            ? 'Bạn đã nhận hàng'
            : `${other} đã nhận hàng`
        : o.status === 'failed'
          ? 'Giao không thành'
          : `Đã hủy đơn · ${cancelText(o, role, other)}`;
    steps.push({ title, when: at(o.closed_at) });
  }
  return steps.reverse();
}

// ---------------------------------------------------------------- errors --

const ERRORS: Record<string, string> = {
  ...CHAT_ERRORS,
  order_not_found: 'Không tìm thấy đơn này.',
  move_not_allowed: 'Đơn đã đổi trạng thái. Xem lại đơn nhé.',
  pickup_not_configured: 'Địa chỉ lấy hàng đã lưu không còn. Chọn lại trong Thiết lập giao COD.',
  carrier_not_linked: 'Bạn chưa liên kết tài khoản ở hãng này.',
  carrier_relink_needed: 'Liên kết với hãng đã hết hạn. Liên kết lại trong Thiết lập giao COD.',
  carrier_unavailable: 'Chưa tạo vận đơn được lúc này. Thử lại sau.',
  carrier_address_unknown: 'Hãng chưa nhận ra địa chỉ người nhận hoặc nơi lấy hàng.',
  carrier_refused: 'Hãng từ chối vận đơn này.',
  carrier_login_failed: 'Hãng không nhận thông tin đăng nhập này. Kiểm tra lại nhé.',
  carrier_account_not_found: 'Tài khoản này đã gỡ liên kết.',
  shipments_open: 'Còn đơn đang giao qua hãng này. Gỡ liên kết sau khi đơn xong.',
  shipment_not_found: 'Hãng không tìm thấy mã vận đơn này.',
  invalid_shipment: 'Thông tin vận đơn chưa đúng. Kiểm tra lại nhé.',
  invalid_shipping_settings: 'Số điện thoại chưa đúng.',
  order_not_delivered: 'Đánh giá được khi đơn đã xong.',
  review_locked: 'Đánh giá đã hiện nên không đổi được nữa.',
  review_closed: 'Người kia đã trả lời nên đánh giá không đổi được nữa.',
  review_not_found: 'Bạn chưa có đánh giá cho đơn này.',
  invalid_review: 'Chọn từ 1 đến 5 sao, lời nhận xét tối đa 500 ký tự.',
  invalid_upload: 'Có ảnh chưa dùng được. Bỏ ảnh đó rồi gửi lại nhé.',
  try_again: 'Vừa có thay đổi ở nơi khác. Thử lại nhé.',
  ticket_not_allowed: 'Báo chưa nhận được khi đơn đang giao, hoặc trong 7 ngày sau khi đơn tự hoàn tất.',
  too_many_tickets: 'Bạn đã gửi 10 yêu cầu trong 24 giờ. Thử lại sau nhé.',
  invalid_ticket: 'Yêu cầu chưa đủ thông tin.',
  ticket_not_found: 'Không tìm thấy yêu cầu này.',
  conversation_not_found: 'Không tìm thấy yêu cầu này.',
};

/** A server code as a sentence; an unknown one is the general failure. */
export const orderError = (code: string) => ERRORS[code] ?? 'Chưa làm được. Thử lại sau ít phút.';

/** A refusal's code for ?error=: the server's when it is a 4xx or one these pages word (carrier_unavailable is a 503), else unknown. */
export const orderCode = (e: unknown) => (e instanceof ApiError && (e.status < 500 || e.code in ERRORS) ? e.code : 'unknown');

// --------------------------------------------------------------- support --

export const TICKET_KIND: Record<Schemas['TicketKind'], { icon: string; name: string }> = {
  not_received: { icon: 'package-2-outline-rounded', name: 'Báo chưa nhận hàng' },
  carrier_request: { icon: 'local-shipping-outline-rounded', name: 'Xin thêm hãng' },
  other: { icon: 'chat-outline-rounded', name: 'Yêu cầu khác' },
};

/** The line under a ticket's name: its order, its carrier, or its first words. */
export function ticketSubject(t: Schemas['TicketListItem']) {
  return t.ticket.order?.title ?? t.ticket.carrier_name ?? t.first_message?.text ?? '';
}

