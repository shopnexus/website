
import type { AdminAccount, AdminAccountPage, AdminReport, AdminReportPage, AdminIdentityDocument, IdentityDocumentPage } from '@/types/admin.type';
import { mockAccountID, mockSellerAccountID, mockAccountSummary, mockSellerAccountSummary, mockIdentityDocument } from './account.mock';
import { mockReport } from './trust.mock';


export const mockAdminAccount: AdminAccount = {
  id: mockAccountID,
  name: 'Nguyễn Văn An',
  role: 'user',
  status: 'active',
  email_verified: true,
  identity_verified: true,
  created_at: '2024-03-15T08:00:00Z',
  email: 'nguyenvanan@email.com',
  phone: '+84912345678',
  username: 'nguyenvanan',
  suspended_until: null,
  suspension_reason: null,
};

export const mockAdminAccountSuspended: AdminAccount = {
  id: 'acc_suspended00001',
  name: 'Lê Văn Scammer',
  role: 'user',
  status: 'suspended',
  email_verified: true,
  identity_verified: false,
  created_at: '2024-09-01T00:00:00Z',
  email: 'levanscam@email.com',
  phone: null,
  username: 'levanscam',
  suspended_until: '2025-12-31T23:59:59Z',
  suspension_reason: 'Lừa đảo người mua, bán hàng giả',
};

export const mockAdminAccountModerator: AdminAccount = {
  id: 'acc_moderator0001',
  name: 'Phạm Thị Mod',
  role: 'moderator',
  status: 'active',
  email_verified: true,
  identity_verified: true,
  created_at: '2023-06-01T00:00:00Z',
  email: 'phamthimod@shopnexus.vn',
  phone: '+84901234567',
  username: 'mod_phamthi',
};

export const mockAdminAccountPage: AdminAccountPage = {
  data: [mockAdminAccount, mockAdminAccountSuspended, mockAdminAccountModerator],
  meta: { page: 1, limit: 20, total_count: 3 },
};


export const mockAdminIdentityDocument: AdminIdentityDocument = {
  document: {
    ...mockIdentityDocument,
    id: 'idd_pending000001',
    status: 'pending',
    verified_at: null,
  },
  account: mockAccountSummary,
};

export const mockIdentityDocumentPage: IdentityDocumentPage = {
  data: [
    mockAdminIdentityDocument,
    {
      document: {
        ...mockIdentityDocument,
        id: 'idd_pending000002',
        status: 'pending',
        doc_type: 'passport',
        verified_at: null,
      },
      account: { id: 'acc_user2example001', name: 'Trần Thị Bích', avatar: null },
    },
  ],
  meta: { page: 1, limit: 20, total_count: 2 },
};


export const mockAdminReport: AdminReport = {
  report: mockReport,
  reporter: mockAccountSummary,
  open_reports_against_target: 3,
  target: {
    id: 'spu_1ryaj8117v2p4',
    name: 'iPhone 12 128GB Space Gray - 99% like new',
    seller: mockSellerAccountSummary,
    status: 'active',
  },
  resolved_by: null,
};

export const mockAdminReportPage: AdminReportPage = {
  data: [
    mockAdminReport,
    {
      ...mockAdminReport,
      report: {
        ...mockReport,
        id: 'rpt_report2nd0001',
        ref_type: 'account',
        ref_id: 'acc_suspended00001',
        reason: 'scam',
        detail: 'Tài khoản này đã lừa tiền nhiều người mua.',
        status: 'reviewing',
      },
      open_reports_against_target: 7,
      target: {
        id: 'acc_suspended00001',
        name: 'Lê Văn Scammer',
        status: 'active',
      },
    },
  ],
  meta: { page: 1, limit: 20, total_count: 2 },
};
