// ─────────────────────────────────────────────────────────────────────────────
// trust.mock.ts
// Mock data for feedback, reputation, reports, refunds, disputes.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Feedback,
  FeedbackPage,
  OrderFeedback,
  Reputation,
  Report,
  ReportPage,
  Refund,
  RefundPage,
  RefundDispute,
  RefundDisputePage,
} from '@/types/trust.type';
import { mockAccountID, mockSellerAccountID, mockAccountSummary, mockSellerAccountSummary } from './account.mock';

// ── Feedback ──────────────────────────────────────────────────────────────────

export const mockFeedback: Feedback = {
  id: 'fbk_2h9qk4mfx7bd3',
  order_id: 'ord_fv2cpg50vkrfp',
  rater: mockAccountSummary,
  ratee_id: mockSellerAccountID,
  direction: 'buyer-to-seller',
  rating: 5,
  comment: 'Shop giao hàng nhanh, đóng gói cẩn thận. Máy đúng mô tả, rất hài lòng!',
  created_at: '2025-06-23T10:00:00Z',
  published_at: '2025-06-24T10:00:00Z',
};

export const mockFeedbackFromSeller: Feedback = {
  id: 'fbk_seller0000001',
  order_id: 'ord_fv2cpg50vkrfp',
  rater: mockSellerAccountSummary,
  ratee_id: mockAccountID,
  direction: 'seller-to-buyer',
  rating: 5,
  comment: 'Khách hàng dễ chịu, thanh toán nhanh, giao dịch suôn sẻ.',
  created_at: '2025-06-23T11:00:00Z',
  published_at: '2025-06-24T10:00:00Z',
};

export const mockFeedbackPage: FeedbackPage = {
  items: [
    mockFeedback,
    {
      ...mockFeedback,
      id: 'fbk_feedback2nd01',
      order_id: 'ord_order2example1',
      rating: 4,
      comment: 'Giao hàng hơi chậm nhưng máy ổn, đúng mô tả.',
      created_at: '2025-06-10T14:00:00Z',
      published_at: '2025-06-11T14:00:00Z',
    },
    {
      ...mockFeedback,
      id: 'fbk_feedback3rd01',
      order_id: 'ord_order4example1',
      rating: 5,
      comment: 'Tuyệt vời, shop uy tín!',
      created_at: '2025-05-20T09:00:00Z',
      published_at: '2025-05-21T09:00:00Z',
    },
  ],
  next_cursor: null,
};

export const mockOrderFeedback: OrderFeedback = {
  theirs_submitted: true,
  mine: mockFeedback,
  theirs: mockFeedbackFromSeller,
};

// ── Reputation ────────────────────────────────────────────────────────────────

export const mockSellerReputation: Reputation = {
  account_id: mockSellerAccountID,
  role: 'seller',
  rating_average: 4.85,
  rating_count: 127,
  review_rating_average: 4.72,
  review_rating_count: 89,
  completed_orders: 134,
  cancelled_orders: 3,
  updated_at: '2025-06-20T00:00:00Z',
};

export const mockBuyerReputation: Reputation = {
  account_id: mockAccountID,
  role: 'buyer',
  rating_average: 4.9,
  rating_count: 12,
  review_rating_average: 0,
  review_rating_count: 0,
  completed_orders: 12,
  cancelled_orders: 0,
  updated_at: '2025-06-20T00:00:00Z',
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const mockReport: Report = {
  id: 'rpt_9c4vt6bkn1pzs',
  ref_type: 'listing',
  ref_id: 'spu_1ryaj8117v2p4',
  reason: 'counterfeit',
  detail: 'Sản phẩm có dấu hiệu giả mạo, serial number không khớp.',
  status: 'open',
  created_at: '2025-06-21T09:00:00Z',
  action_taken: null,
  resolution_note: null,
  resolved_at: null,
};

export const mockReportPage: ReportPage = {
  items: [mockReport],
  next_cursor: null,
};

// ── Refund ────────────────────────────────────────────────────────────────────

export const mockRefund: Refund = {
  id: 'rfd_z3n8kvq1wd6pt',
  order_id: 'ord_fv2cpg50vkrfp',
  buyer_id: mockAccountID,
  status: 'awaiting-seller-review',
  reason: 'Sản phẩm nhận được khác với mô tả, màn hình có vết trầy nhỏ không được đề cập.',
  attachments: ['res_4mx8jd2qr5wtc', 'res_iphone12img002'],
  review_deadline_at: '2025-06-25T09:00:00Z',
  created_at: '2025-06-23T09:00:00Z',
  rejection_reason: null,
  return_transport_id: null,
  seller_decided_at: null,
  dispute_id: null,
};

export const mockRefundPage: RefundPage = {
  items: [mockRefund],
  next_cursor: null,
};

// ── Refund Dispute ────────────────────────────────────────────────────────────

export const mockRefundDispute: RefundDispute = {
  id: 'dsp_n8kvq1wd6ptz3',
  refund_id: 'rfd_z3n8kvq1wd6pt',
  order_id: 'ord_fv2cpg50vkrfp',
  seller_id: mockSellerAccountID,
  buyer_id: mockAccountID,
  status: 'open',
  reason: 'Sản phẩm khi giao đi hoàn toàn nguyên vẹn. Có ảnh kiểm tra trước khi đóng gói.',
  attachments: ['res_4mx8jd2qr5wtc'],
  created_at: '2025-06-25T10:00:00Z',
  resolution_note: null,
  resolved_at: null,
  resolved_by_id: null,
};

export const mockRefundDisputePage: RefundDisputePage = {
  items: [mockRefundDispute],
  next_cursor: null,
};
