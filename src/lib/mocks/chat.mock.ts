// ─────────────────────────────────────────────────────────────────────────────
// chat.mock.ts
// Mock data for conversation, message, unread counts.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Conversation,
  ConversationPage,
  Message,
  MessagePage,
  ChatUnreadCount,
} from '@/types/chat.type';
import { mockAccountID, mockSellerAccountSummary, mockAccountSummary } from './account.mock';
import { mockResource } from './common.mock';

// ── Messages ──────────────────────────────────────────────────────────────────

export const mockTextMessage: Message = {
  id: 'msg_buyer0000001a',
  conversation_id: 'cnv_6ptz3n8kvq1wd',
  type: 'user',
  body: 'Cho mình hỏi máy còn bảo hành không ạ?',
  status: 'read',
  attachments: [],
  metadata: {},
  created_at: '2025-06-20T08:00:00Z',
  sender_id: mockAccountID,
  edited_at: null,
  deleted_at: null,
};

export const mockSellerReplyMessage: Message = {
  id: 'msg_seller000001a',
  conversation_id: 'cnv_6ptz3n8kvq1wd',
  type: 'user',
  body: 'Chào bạn! Máy còn bảo hành chính hãng 18 tháng nữa bạn nhé 😊',
  status: 'delivered',
  attachments: [],
  metadata: {},
  created_at: '2025-06-20T08:05:00Z',
  sender_id: mockSellerAccountSummary.id,
  edited_at: null,
  deleted_at: null,
};

export const mockImageMessage: Message = {
  id: 'msg_image0000001a',
  conversation_id: 'cnv_6ptz3n8kvq1wd',
  type: 'user',
  body: '',
  status: 'read',
  attachments: [mockResource],
  metadata: {},
  created_at: '2025-06-20T08:10:00Z',
  sender_id: mockSellerAccountSummary.id,
  edited_at: null,
  deleted_at: null,
};

export const mockSystemMessage: Message = {
  id: 'msg_system000001a',
  conversation_id: 'cnv_6ptz3n8kvq1wd',
  type: 'system',
  body: 'Đơn hàng ord_fv2cpg50vkrfp đã được xác nhận',
  status: 'delivered',
  attachments: [],
  metadata: { order_id: 'ord_fv2cpg50vkrfp', deep_link: '/orders/ord_fv2cpg50vkrfp' },
  created_at: '2025-06-20T09:15:00Z',
  sender_id: null,
};

export const mockMessagePage: MessagePage = {
  data: [mockTextMessage, mockSellerReplyMessage, mockImageMessage, mockSystemMessage],
  meta: { next_cursor: null },
};

// ── Conversations ─────────────────────────────────────────────────────────────

export const mockConversation: Conversation = {
  id: 'cnv_6ptz3n8kvq1wd',
  counterparty: mockSellerAccountSummary,
  last_message_at: '2025-06-20T09:15:00Z',
  unread: 2,
  created_at: '2025-06-20T08:00:00Z',
  last_message: mockSystemMessage,
};

export const mockConversationPage: ConversationPage = {
  data: [
    mockConversation,
    {
      id: 'cnv_conv2example01',
      counterparty: { id: 'acc_user2example001', name: 'Trần Thị Bích', avatar: null },
      last_message_at: '2025-06-19T18:30:00Z',
      unread: 0,
      created_at: '2025-06-19T18:00:00Z',
      last_message: {
        ...mockTextMessage,
        id: 'msg_conv2last0001',
        conversation_id: 'cnv_conv2example01',
        body: 'Ok bạn nhé, mình chờ!',
        created_at: '2025-06-19T18:30:00Z',
        sender_id: 'acc_user2example001',
        status: 'read',
      },
    },
    {
      id: 'cnv_conv3example01',
      counterparty: { id: 'acc_user3example001', name: 'Lê Minh Tuấn', avatar: null },
      last_message_at: '2025-06-18T14:00:00Z',
      unread: 1,
      created_at: '2025-06-18T13:00:00Z',
      last_message: {
        ...mockTextMessage,
        id: 'msg_conv3last0001',
        conversation_id: 'cnv_conv3example01',
        body: 'Giá có thể bớt thêm không ạ?',
        created_at: '2025-06-18T14:00:00Z',
        sender_id: 'acc_user3example001',
        status: 'delivered',
      },
    },
    {
      id: 'cnv_conv4example01',
      counterparty: mockAccountSummary,
      last_message_at: '2025-06-17T11:00:00Z',
      unread: 0,
      created_at: '2025-06-17T10:00:00Z',
      last_message: null,
    },
    {
      id: 'cnv_conv5example01',
      counterparty: { id: 'acc_user4example001', name: 'Phạm Quỳnh Anh', avatar: mockResource },
      last_message_at: '2025-06-16T09:00:00Z',
      unread: 3,
      created_at: '2025-06-16T09:00:00Z',
      last_message: {
        ...mockSellerReplyMessage,
        id: 'msg_conv5last0001',
        conversation_id: 'cnv_conv5example01',
        body: 'Shop có ship COD không ạ?',
        created_at: '2025-06-16T09:00:00Z',
      },
    },
  ],
  meta: { next_cursor: null },
};

// ── Unread Counts ─────────────────────────────────────────────────────────────

export const mockChatUnreadCount: ChatUnreadCount = {
  unread: 6,
  conversations: 3,
};
