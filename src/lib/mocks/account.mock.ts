
import type {
  AccountID,
  AccountSummary,
  AccountSummaryPage,
  Me,
  Profile,
  PublicAccount,
  AuthResult,
  Device,
  DeviceList,
  IdentityDocument,
  IdentityDocumentList,
  Notification,
  NotificationPage,
  NotificationPreference,
  NotificationPreferenceList,
} from '@/types/account.type';
import { mockAvatarResource } from './common.mock';


export const mockAccountID: AccountID = 'acc_62mxefynht57b';
export const mockSellerAccountID: AccountID = 'acc_seller1234567';


export const mockProfile: Profile = {
  name: 'Nguyễn Văn An',
  country: 'VN',
  locale: 'vi-VN',
  timezone: 'Asia/Ho_Chi_Minh',
  created_at: '2024-03-15T08:00:00Z',
  avatar: mockAvatarResource,
  date_of_birth: '1995-07-20',
  description: 'Mình bán hàng secondhand uy tín tại Hà Nội, giao hàng nhanh trong ngày.',
  gender: 'male',
};


export const mockMe: Me = {
  id: mockAccountID,
  role: 'user',
  status: 'active',
  email_verified: true,
  has_password: true,
  identity_verified: true,
  profile: mockProfile,
  created_at: '2024-03-15T08:00:00Z',
  email: 'nguyenvanan@email.com',
  phone: '+84912345678',
  username: 'nguyenvanan',
};


export const mockAccountSummary: AccountSummary = {
  id: mockAccountID,
  name: 'Nguyễn Văn An',
  avatar: mockAvatarResource,
};

export const mockSellerAccountSummary: AccountSummary = {
  id: mockSellerAccountID,
  name: 'Shop Đồ Cũ Hà Nội',
  avatar: {
    ...mockAvatarResource,
    id: 'res_shopavatar00001',
    url: 'https://picsum.photos/seed/res_shopavatar00001/500/500',
  },
};

export const mockAccountSummaryPage: AccountSummaryPage = {
  data: [
    mockAccountSummary,
    mockSellerAccountSummary,
    { id: 'acc_user2example001', name: 'Trần Thị Bích', avatar: null },
    { id: 'acc_user3example001', name: 'Lê Minh Tuấn', avatar: null },
    { id: 'acc_user4example001', name: 'Phạm Quỳnh Anh', avatar: mockAvatarResource },
  ],
  meta: { page: 1, limit: 20, total_count: 5 },
};


export const mockPublicAccount: PublicAccount = {
  id: mockSellerAccountID,
  name: 'Shop Đồ Cũ Hà Nội',
  identity_verified: true,
  follower_count: 1204,
  created_at: '2023-01-10T00:00:00Z',
  avatar: mockSellerAccountSummary.avatar ?? undefined,
  description: 'Chuyên bán đồ điện tử cũ, laptop, điện thoại đã qua sử dụng còn mới 90-99%.',
};


export const mockAuthResult: AuthResult = {
  access_token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhY2NfNjJteGVmeW5odDU3YiJ9.mocktoken',
  refresh_token: 'rt_mockrefreshtoken1234567890abcdef',
  expires_in: 3600,
  account: mockMe,
};


export const mockDevice: Device = {
  id: 'dvc_ynht57b62mxef',
  platform: 'web',
  push_token_suffix: '...xk9m',
  last_seen_at: '2025-06-20T14:30:00Z',
  created_at: '2024-03-15T08:05:00Z',
};

export const mockDeviceList: DeviceList = {
  data: [
    mockDevice,
    {
      id: 'dvc_mobile12345678',
      platform: 'android',
      push_token_suffix: '...p3n7',
      last_seen_at: '2025-06-19T22:00:00Z',
      created_at: '2024-06-01T10:00:00Z',
    },
  ],
};


export const mockIdentityDocument: IdentityDocument = {
  id: 'idd_57b62mxefynht',
  doc_type: 'national-id',
  provider: 'vnpt-kyc',
  status: 'verified',
  created_at: '2024-04-01T09:00:00Z',
  verified_at: '2024-04-01T09:15:00Z',
  expires_at: '2030-01-01T00:00:00Z',
  rejection_reason: null,
};

export const mockIdentityDocumentList: IdentityDocumentList = {
  data: [mockIdentityDocument],
};


export const mockNotifications: Notification[] = [
  {
    category: 'order',
    title: 'Đơn hàng của bạn đã được xác nhận',
    payload: { order_id: 'ord_fv2cpg50vkrfp', deep_link: '/orders/ord_fv2cpg50vkrfp' },
    created_at: '2025-06-20T10:00:00Z',
    read_at: null,
  },
  {
    category: 'chat',
    title: 'Shop Đồ Cũ Hà Nội đã nhắn tin cho bạn',
    payload: { conversation_id: 'cnv_6ptz3n8kvq1wd', deep_link: '/chat/cnv_6ptz3n8kvq1wd' },
    created_at: '2025-06-20T09:30:00Z',
    read_at: '2025-06-20T09:45:00Z',
  },
  {
    category: 'social',
    title: 'Nguyễn Văn An đã theo dõi bạn',
    payload: { account_id: mockAccountID },
    created_at: '2025-06-19T18:00:00Z',
    read_at: null,
  },
  {
    category: 'system',
    title: 'Tài khoản của bạn đã được xác minh danh tính',
    payload: {},
    created_at: '2025-06-18T12:00:00Z',
    read_at: '2025-06-18T12:30:00Z',
  },
  {
    category: 'promotion',
    title: 'Voucher 50K đang chờ bạn',
    payload: { voucher_code: 'SUMMER50K', deep_link: '/promotions' },
    created_at: '2025-06-17T08:00:00Z',
    read_at: null,
  },
];

export const mockNotificationPage: NotificationPage = {
  data: mockNotifications,
  meta: { next_cursor: null },
};


export const mockNotificationPreferences: NotificationPreference[] = [
  { category: 'order', channel: 'in-app', is_enabled: true, is_default: true },
  { category: 'order', channel: 'push', is_enabled: true, is_default: true },
  { category: 'order', channel: 'email', is_enabled: true, is_default: false },
  { category: 'chat', channel: 'in-app', is_enabled: true, is_default: true },
  { category: 'chat', channel: 'push', is_enabled: true, is_default: true },
  { category: 'chat', channel: 'email', is_enabled: false, is_default: false },
  { category: 'promotion', channel: 'in-app', is_enabled: true, is_default: true },
  { category: 'promotion', channel: 'push', is_enabled: false, is_default: false },
  { category: 'promotion', channel: 'email', is_enabled: true, is_default: false },
  { category: 'system', channel: 'in-app', is_enabled: true, is_default: true },
  { category: 'social', channel: 'in-app', is_enabled: true, is_default: true },
];

export const mockNotificationPreferenceList: NotificationPreferenceList = {
  data: mockNotificationPreferences,
};
