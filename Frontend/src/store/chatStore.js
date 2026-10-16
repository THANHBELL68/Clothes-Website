import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock dữ liệu ban đầu cho chat_conversations và chat_messages theo CSDL PostgreSQL (shop_db)
const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    customer_id: 5,
    guest_name: 'Nguyễn Văn Khách',
    guest_contact: '0987654321',
    assigned_staff_id: 3, // Phạm Chăm Sóc (cskh)
    status: 'open',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    closed_at: null,
    last_message: 'Dạ chào anh Khách! Áo kiểu Rayon size M hiện tại kho đang còn sẵn 35 chiếc ạ.',
    unread_customer: 0,
    unread_staff: 0,
  },
  {
    id: 2,
    customer_id: null, // Khách Vãng Lai (Thỏa mãn CHECK (customer_id IS NOT NULL OR guest_contact IS NOT NULL))
    guest_name: 'Hoàng Thị Mai (Vãng Lai)',
    guest_contact: '0912345699',
    assigned_staff_id: 3,
    status: 'open',
    created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
    closed_at: null,
    last_message: 'Em là khách mới, cho em hỏi thanh toán qua mã QR VietQR thì tiền có vào tự động không ạ?',
    unread_customer: 0,
    unread_staff: 1, // CSKH chưa đọc tin này
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    conversation_id: 1,
    sender_type: 'customer',
    sender_id: 5,
    content: 'Chào shop, mình muốn hỏi áo Rayon 479073 màu trắng size M bao giờ có hàng thêm?',
    attachment_url: null,
    read_at: new Date(Date.now() - 3500 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 2,
    conversation_id: 1,
    sender_type: 'staff',
    sender_id: 3,
    content: 'Dạ chào anh Khách! Áo kiểu Rayon size M hiện tại kho đang còn sẵn 35 chiếc ạ. Anh có thể đặt ngay trên website để nhận ưu đãi freeship nhé!',
    attachment_url: null,
    read_at: new Date(Date.now() - 3400 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3450 * 1000).toISOString(),
  },
  {
    id: 3,
    conversation_id: 2,
    sender_type: 'customer',
    sender_id: null, // Khách vãng lai
    content: 'Em là khách mới, cho em hỏi thanh toán qua mã QR VietQR thì tiền có vào tự động không ạ?',
    attachment_url: null,
    read_at: null,
    created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
];

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      activeConversationId: null,
      isWidgetOpen: false,

      // Mở / Đóng Widget
      setWidgetOpen: (open) => set({ isWidgetOpen: open }),
      toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),

      // Chọn cuộc trò chuyện đang xem
      setActiveConversation: (id) => set({ activeConversationId: id }),

      // Khách hàng / Khách vãng lai khởi tạo hoặc lấy cuộc hội thoại hiện có
      initClientConversation: ({ customer_id, guest_name, guest_contact }) => {
        const state = get();
        // 1. Nếu là thành viên (có customer_id): tìm hội thoại đang mở của customer
        if (customer_id) {
          const existing = state.conversations.find(
            (c) => c.customer_id === customer_id && c.status === 'open'
          );
          if (existing) {
            set({ activeConversationId: existing.id });
            return existing;
          }
        }

        // 2. Nếu là khách vãng lai: tìm theo guest_contact
        if (!customer_id && guest_contact) {
          const existing = state.conversations.find(
            (c) => c.guest_contact === guest_contact && c.status === 'open'
          );
          if (existing) {
            set({ activeConversationId: existing.id });
            return existing;
          }
        }

        // 3. Nếu chưa có: Tạo mới theo đúng ràng buộc DB
        const newConv = {
          id: Date.now(),
          customer_id: customer_id || null,
          guest_name: guest_name || (customer_id ? 'Khách Hàng Thành Viên' : 'Khách Vãng Lai'),
          guest_contact: guest_contact || null,
          assigned_staff_id: 3, // Mặc định gán cho CSKH
          status: 'open',
          created_at: new Date().toISOString(),
          closed_at: null,
          last_message: 'Đã mở phiên hỗ trợ trực tuyến',
          unread_customer: 0,
          unread_staff: 1,
        };

        // Gửi tin nhắn chào mừng tự động từ CSKH
        const welcomeMsg = {
          id: Date.now() + 1,
          conversation_id: newConv.id,
          sender_type: 'staff',
          sender_id: 3,
          content: `Xin chào ${newConv.guest_name}! Tôi là Chuyên viên CSKH của AETHER LABS. Tôi có thể hỗ trợ gì cho bạn hôm nay?`,
          attachment_url: null,
          read_at: null,
          created_at: new Date().toISOString(),
        };

        newConv.last_message = welcomeMsg.content;

        set((s) => ({
          conversations: [newConv, ...s.conversations],
          messages: [...s.messages, welcomeMsg],
          activeConversationId: newConv.id,
        }));

        return newConv;
      },

      // Gửi tin nhắn (khách hàng hoặc nhân viên CSKH)
      sendMessage: ({ conversation_id, sender_type, sender_id, content, attachment_url = null }) => {
        if (!content || !content.trim()) return;

        const newMsg = {
          id: Date.now() + Math.random(),
          conversation_id,
          sender_type, // 'customer' | 'staff'
          sender_id: sender_id || null,
          content: content.trim(),
          attachment_url,
          read_at: null,
          created_at: new Date().toISOString(),
        };

        set((state) => {
          const updatedConversations = state.conversations.map((c) => {
            if (c.id === conversation_id) {
              return {
                ...c,
                last_message: newMsg.content,
                unread_staff: sender_type === 'customer' ? c.unread_staff + 1 : c.unread_staff,
                unread_customer: sender_type === 'staff' ? c.unread_customer + 1 : c.unread_customer,
              };
            }
            return c;
          });

          return {
            messages: [...state.messages, newMsg],
            conversations: updatedConversations,
          };
        });

        return newMsg;
      },

      // Đánh dấu đã đọc
      markAsRead: (conversation_id, reader_type) => {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id === conversation_id) {
              return {
                ...c,
                unread_staff: reader_type === 'staff' ? 0 : c.unread_staff,
                unread_customer: reader_type === 'customer' ? 0 : c.unread_customer,
              };
            }
            return c;
          }),
          messages: state.messages.map((m) => {
            if (m.conversation_id === conversation_id) {
              if (reader_type === 'staff' && m.sender_type === 'customer' && !m.read_at) {
                return { ...m, read_at: now };
              }
              if (reader_type === 'customer' && m.sender_type === 'staff' && !m.read_at) {
                return { ...m, read_at: now };
              }
            }
            return m;
          }),
        }));
      },

      // Đóng cuộc trò chuyện
      closeConversation: (conversation_id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversation_id
              ? { ...c, status: 'closed', closed_at: new Date().toISOString() }
              : c
          ),
        }));
      },
    }),
    {
      name: 'aether-live-chat-storage-v1',
    }
  )
);

