import { ApiError, type Schemas } from './api/client';
import { CHAT_ERRORS } from './chat-errors';
import { dayLabel, hm, left, money, phoneText } from './format';

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

/** A step of the order: done, the one it is at now, or one to come. */
export interface Step {
  title: string;
  sub?: string;
  /** When it happened; empty for a step to come, or one with no time. */
  when: string;
  state: 'done' | 'now' | 'next';
}

/** The order's steps, oldest first: the request, the waybill, the pickup, the delivery and the receipt; a failed or
 * cancelled order ends at that instead of the steps it did not reach. */
export function orderSteps(o: Order, role: Role, other: string): Step[] {
  const buyer = role === 'buyer';
  const sh = o.shipment;
  const carrier = sh ? CARRIER[sh.carrier] : 'Hãng';
  const t = (iso?: string) => (iso ? at(iso) : '');
  const all = [
    { title: buyer ? 'Bạn gửi yêu cầu COD' : `${other} gửi yêu cầu COD`, sub: money(o.price), when: t(o.requested_at) },
    { title: buyer ? 'Người bán tạo vận đơn' : 'Bạn tạo vận đơn', sub: sh ? `${carrier} · ${sh.tracking_code}` : undefined, when: t(o.shipped_at) },
    { title: sh?.picked_up_at ? `${carrier} đã lấy hàng` : `${carrier} lấy hàng`, when: t(sh?.picked_up_at) },
    { title: sh?.delivered_at ? `${carrier} báo đã giao` : buyer ? `${carrier} giao tới bạn` : `Giao tới ${other}`, when: t(sh?.delivered_at) },
    {
      title:
        o.status === 'completed'
          ? o.completed_by === 'system'
            ? 'Đơn tự hoàn tất'
            : buyer
              ? 'Bạn đã nhận hàng'
              : `${other} đã nhận hàng`
          : buyer
            ? 'Bạn nhận hàng, trả tiền'
            : `${other} nhận hàng, trả tiền`,
      when: o.status === 'completed' ? t(o.closed_at) : '',
    },
  ];
  // How far it got: the last step reached, by the order's and the parcel's status.
  const parcel = { pending_pickup: 1, in_transit: 2, delivered: 3, failed: sh?.picked_up_at ? 2 : 1 };
  const reached = o.status === 'pending' ? 0 : o.status === 'completed' ? 4 : sh ? parcel[sh.status] : 0;
  const steps: Step[] = all.slice(0, reached + 1).map((s) => ({ ...s, state: 'done' }));
  if (o.status === 'failed') steps.push({ title: 'Giao không thành', when: t(o.closed_at), state: 'done' });
  else if (o.status === 'cancelled') steps.push({ title: 'Đã hủy đơn', sub: cancelText(o, role, other), when: t(o.closed_at), state: 'done' });
  else steps.push(...all.slice(reached + 1).map((s) => ({ ...s, state: 'next' as const })));
  steps[o.status === 'failed' || o.status === 'cancelled' ? steps.length - 1 : reached].state = 'now';
  return steps;
}

/** What the viewer does next, or waits for: a title, a line or two, and confirm when the move is "Đã nhận hàng". */
export interface NextStep {
  title: string;
  lines: { icon: string; text: string }[];
  confirm?: boolean;
}

/** The order's next step from the viewer's side; null when it has none to show (a closed order, a parcel on its way to
 * the seller's buyer). The deadlines are the server's timers (due_at). */
export function nextStep(o: Order, role: Role, other: string): NextStep | null {
  const sh = o.shipment;
  const carrier = sh ? CARRIER[sh.carrier] : '';
  const due = o.due_at ? at(o.due_at) : '';
  const remaining = o.due_at ? left(o.due_at) : '';
  const countdown = remaining ? [{ icon: 'schedule-outline-rounded', text: `Còn ${remaining}` }] : [];
  const autoComplete = due ? [{ icon: 'schedule-outline-rounded', text: `Đơn tự hoàn tất ${due}` }] : [];
  if (role === 'buyer') {
    const cash = sh?.fee !== undefined ? `Chuẩn bị ${money(o.price + sh.fee)} tiền mặt` : `Chuẩn bị ${money(o.price)} + phí ship`;
    if (o.status === 'pending') return { title: cash, lines: due ? [{ icon: 'schedule-outline-rounded', text: `${other} gửi hàng trước ${due}` }] : [] };
    if (o.status !== 'shipped') return null;
    if (sh?.status === 'delivered') {
      const told = sh.delivered_at ? [{ icon: 'local-shipping-outline-rounded', text: `${carrier} báo đã giao ${at(sh.delivered_at)}` }] : [];
      return { title: 'Xác nhận đã nhận hàng', lines: [...told, ...autoComplete], confirm: true };
    }
    return { title: cash, lines: [{ icon: 'visibility-outline-rounded', text: 'Mở hàng kiểm tra trước khi trả tiền' }], confirm: true };
  }
  if (o.status === 'pending') return { title: due ? `Tạo vận đơn trước ${due}` : 'Tạo vận đơn', lines: countdown };
  if (o.status !== 'shipped' || !sh) return null;
  if (sh.status === 'pending_pickup') {
    // A copied address names its street; a carrier's pickup point, its name.
    const from = sh.pickup?.commune_code ? sh.pickup.street : sh.pickup?.name;
    const place = from ? [{ icon: 'location-on-outline-rounded', text: `Lấy tại ${from}` }] : [];
    return { title: due ? `Đưa hàng cho ${carrier} trước ${due}` : `Đưa hàng cho ${carrier}`, lines: [...countdown, ...place] };
  }
  if (sh.status === 'delivered') return { title: `Chờ ${other} xác nhận đã nhận`, lines: autoComplete };
  return null;
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

