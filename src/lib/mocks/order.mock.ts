
import type {
  Contact,
  ContactList,
  ContactID,
  CartItem,
  CartItemPage,
  DraftOrder,
  DraftOrderPage,
  DraftSPUSnapshot,
  DraftSKUSnapshot,
  Order,
  OrderPage,
  OrderItem,
  OrderItemPage,
  OrderAddressSnapshot,
  Offer,
  OfferPage,
  CheckoutResult,
} from '@/types/order.type';
import { mockAccountID, mockSellerAccountID } from './account.mock';


export const mockContactID: ContactID = 'ctc_kvq1wd6ptz3n8';

export const mockContact: Contact = {
  id: mockContactID,
  full_name: 'Nguyễn Văn An',
  phone: '+84912345678',
  phone_verified: true,
  address_type: 'home',
  is_default_delivery: true,
  is_default_pickup: false,
  country: 'VN',
  province_code: 'HN',
  province_name: 'Hà Nội',
  ward_code: 'HN001',
  ward_name: 'Phường Cầu Giấy',
  address: '15 Ngõ 45, Phố Duy Tân',
  created_at: '2024-03-16T10:00:00Z',
  address_detail: 'Tầng 3, căn 301',
  district_code: null,
  district_name: null,
  postal_code: null,
  latitude: 21.0285,
  longitude: 105.8542,
  provider_codes: { ghn: { province_id: 201, district_id: 1482, ward_code: '1A0607' } },
};

export const mockPickupContact: Contact = {
  id: 'ctc_pickup0000001',
  full_name: 'Shop Đồ Cũ Hà Nội',
  phone: '+84987654321',
  phone_verified: true,
  address_type: 'work',
  is_default_delivery: false,
  is_default_pickup: true,
  country: 'VN',
  province_code: 'HN',
  province_name: 'Hà Nội',
  ward_code: 'HN002',
  ward_name: 'Phường Đống Đa',
  address: '22 Phố Tôn Đức Thắng',
  created_at: '2023-01-10T00:00:00Z',
  provider_codes: { ghn: { province_id: 201, district_id: 1480, ward_code: '1A0600' } },
};

export const mockContactList: ContactList = {
  data: [mockContact, mockPickupContact],
};


export const mockOrderAddress: OrderAddressSnapshot = {
  full_name: mockContact.full_name,
  phone: mockContact.phone,
  country: mockContact.country,
  province_code: mockContact.province_code,
  province_name: mockContact.province_name,
  ward_code: mockContact.ward_code,
  ward_name: mockContact.ward_name,
  address: mockContact.address,
  address_detail: mockContact.address_detail,
  provider_codes: mockContact.provider_codes,
};


export const mockCartItem: CartItem = {
  id: 'crt_3n8kvq1wd6ptz',
  sku_id: 'sku_vq1wd6ptz3n8k',
  quantity: 1,
  created_at: '2025-06-20T08:00:00Z',
};

export const mockCartItemPage: CartItemPage = {
  data: [
    mockCartItem,
    { id: 'crt_item2example01', sku_id: 'sku_variant2nd0001', quantity: 2, created_at: '2025-06-20T08:05:00Z' },
  ],
  meta: { page: 1, limit: 20, total_count: 2 },
};


const mockDraftSKU: DraftSKUSnapshot = {
  id: 'sku_vq1wd6ptz3n8k',
  price: 3500000,
  attributes: { color: 'Space Gray', storage: '128GB' },
  package_details: { weight_kg: 0.18 },
  attachments: ['res_4mx8jd2qr5wtc'],
};

const mockDraftSPU: DraftSPUSnapshot = {
  id: 'spu_1ryaj8117v2p4',
  name: 'iPhone 12 128GB Space Gray - 99% like new',
  seller_id: mockSellerAccountID,
  currency: 'VND',
  price_mode: 'fixed',
  skus: [mockDraftSKU],
  shipping_paid_by: 'buyer',
};

export const mockDraftOrder: DraftOrder = {
  id: 'drf_8kvq1wd6ptz3n',
  spu_id: 'spu_1ryaj8117v2p4',
  snapshot: mockDraftSPU,
  created_at: '2025-06-20T09:00:00Z',
  valid_until: '2025-06-20T09:30:00Z',
  cancelled_at: null,
};

export const mockDraftOrderPage: DraftOrderPage = {
  data: [mockDraftOrder],
  meta: { page: 1, limit: 20, total_count: 1 },
};


export const mockOrderItem: OrderItem = {
  id: 'itm_q1wd6ptz3n8kv',
  draft_id: 'drf_8kvq1wd6ptz3n',
  buyer_id: mockAccountID,
  seller_id: mockSellerAccountID,
  sku_id: 'sku_vq1wd6ptz3n8k',
  quantity: 1,
  currency: 'VND',
  total_amount: 3500000,
  transport_option: 'ghn-express',
  address: mockOrderAddress,
  state: 'confirmed',
  payment_status: 'success',
  created_at: '2025-06-20T09:15:00Z',
  order_id: 'ord_fv2cpg50vkrfp',
  note: 'Nhờ shop kiểm tra máy trước khi gửi',
  cancelled_at: null,
  cancelled_by_id: null,
};

export const mockOrderItemPage: OrderItemPage = {
  data: [mockOrderItem],
  meta: { next_cursor: null },
};


export const mockOrder: Order = {
  id: 'ord_fv2cpg50vkrfp',
  draft_id: 'drf_8kvq1wd6ptz3n',
  buyer_id: mockAccountID,
  seller_id: mockSellerAccountID,
  transport_id: 'trp_d6ptz3n8kvq1w',
  address: mockOrderAddress,
  pickup_address: {
    full_name: mockPickupContact.full_name,
    phone: mockPickupContact.phone,
    country: mockPickupContact.country,
    province_code: mockPickupContact.province_code,
    province_name: mockPickupContact.province_name,
    ward_code: mockPickupContact.ward_code,
    ward_name: mockPickupContact.ward_name,
    address: mockPickupContact.address,
  },
  state: 'open',
  receipt_attachments: [],
  created_at: '2025-06-20T09:15:00Z',
  items: [mockOrderItem],
  note: null,
  cancelled_at: null,
  completed_at: null,
  received_at: null,
  payout_deadline_at: null,
};

export const mockOrderPage: OrderPage = {
  data: [
    mockOrder,
    { ...mockOrder, id: 'ord_order2example1', state: 'completed', completed_at: '2025-06-10T10:00:00Z' },
    { ...mockOrder, id: 'ord_order3example1', state: 'cancelled', cancelled_at: '2025-06-05T08:00:00Z' },
    { ...mockOrder, id: 'ord_order4example1', state: 'open' },
    { ...mockOrder, id: 'ord_order5example1', state: 'open', created_at: '2025-06-18T14:00:00Z' },
  ],
  meta: { next_cursor: null },
};


export const mockOffer: Offer = {
  id: 'ofr_ptz3n8kvq1wd6',
  sku_id: 'sku_vq1wd6ptz3n8k',
  buyer_id: mockAccountID,
  seller_id: mockSellerAccountID,
  author_id: mockAccountID,
  status: 'active',
  quantity: 1,
  total: 3200000,
  currency: 'VND',
  created_at: '2025-06-19T10:00:00Z',
  expires_at: '2025-06-20T10:00:00Z',
  reason: 'Mình mua nhiều lần ở shop, mong shop ưu đãi thêm ạ',
};

export const mockOfferPage: OfferPage = {
  data: [mockOffer],
  meta: { next_cursor: null },
};


export const mockCheckoutResult: CheckoutResult = {
  items: [mockOrderItem],
  payment_session: {
    id: 'pay_7bq2xn4tw9yef',
    kind: 'buyer-checkout',
    status: 'pending',
    currency: 'VND',
    total_amount: 3500000,
    amount_paid: 0,
    note: 'Checkout - ord_fv2cpg50vkrfp',
    created_at: '2025-06-20T09:15:00Z',
    expired_at: '2025-06-20T09:45:00Z',
    from_id: mockAccountID,
    to_id: mockSellerAccountID,
    paid_at: null,
  },
};
