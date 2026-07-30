
import type { Resource, ResourceID, Option, OptionList, UploadTicket } from '@/types/common.type';

export const mockResourceID: ResourceID = 'res_4mx8jd2qr5wtc';

export const mockResource: Resource = {
  id: 'res_4mx8jd2qr5wtc',
  provider: 's3',
  mime: 'image/jpeg',
  size: 204800,
  metadata: { width: 800, height: 600, cdn_path: '/uploads/res_4mx8jd2qr5wtc.jpg' },
  created_at: '2025-06-01T08:00:00Z',
  completed_at: '2025-06-01T08:00:05Z',
  checksum: 'sha256:abc123',
  url: 'https://picsum.photos/seed/res_4mx8jd2qr5wtc/500/500',
  url_expires_at: '2025-06-01T09:00:00Z',
};

export const mockAvatarResource: Resource = {
  id: 'res_avatarexample1',
  provider: 's3',
  mime: 'image/png',
  size: 51200,
  metadata: { width: 200, height: 200 },
  created_at: '2025-01-10T10:00:00Z',
  completed_at: '2025-01-10T10:00:02Z',
  url: 'https://picsum.photos/seed/res_avatarexample1/500/500',
  url_expires_at: '2025-06-01T09:00:00Z',
};

export const mockUploadTicket: UploadTicket = {
  resource: { ...mockResource, completed_at: null, url: null, url_expires_at: null },
  upload_url: 'https://s3.ap-southeast-1.amazonaws.com/shopnexus/uploads/res_4mx8jd2qr5wtc?X-Amz-Signature=xxx',
  upload_expires_at: '2025-06-01T08:15:00Z',
};

export const mockTransportOption: Option = {
  id: 'ghn-express',
  type: 'transport',
  provider: 'ghn',
  name: 'GHN Express',
  description: 'Giao hàng nhanh trong 1-2 ngày',
  priority: 10,
  is_enabled: true,
  data: { supported_currencies: ['VND'], max_weight_kg: 50 },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockPaymentOption: Option = {
  id: 'vnpay-qr',
  type: 'payment',
  provider: 'vnpay',
  name: 'VNPay QR',
  description: 'Quét mã QR qua ứng dụng ngân hàng',
  priority: 5,
  is_enabled: true,
  data: { supported_currencies: ['VND'] },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockOptionList: OptionList = {
  data: [mockTransportOption, mockPaymentOption],
};
