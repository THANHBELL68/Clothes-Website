import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  User,
  Headphones,
  CheckCheck,
  Sparkles,
  Paperclip,
  Clock,
  ShieldCheck,
  ChevronDown,
  Phone,
  Mail,
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LiveChatWidget() {
  const { user } = useAuthStore();
  const {
    conversations,
    messages,
    activeConversationId,
    isWidgetOpen,
    setWidgetOpen,
    toggleWidget,
    setActiveConversation,
    initClientConversation,
    sendMessage,
    markAsRead,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const messagesEndRef = useRef(null);

  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Tìm cuộc trò chuyện hiện tại của khách
  const currentConversation = safeConversations.find((c) => {
    if (!c) return false;
    if (user?.id) {
      return String(c.customer_id) === String(user.id) && c.status === 'open';
    }
    if (activeConversationId) {
      return c.id === activeConversationId;
    }
    return false;
  });

  // Tự động khởi tạo cho thành viên đã đăng nhập
  useEffect(() => {
    if (user && isWidgetOpen && !currentConversation) {
      initClientConversation({
        customer_id: user.id,
        guest_name: user.full_name || 'Khách Hàng',
        guest_contact: user.phone || user.email || '',
      });
    }
  }, [user?.id, isWidgetOpen, currentConversation?.id]);

  // Cuộn xuống tin nhắn mới nhất
  const currentMessages = safeMessages.filter(
    (m) => m && m.conversation_id === currentConversation?.id
  );

  useEffect(() => {
    if (isWidgetOpen && currentConversation?.id) {
      if (currentConversation.unread_customer > 0) {
        markAsRead(currentConversation.id, 'customer');
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isWidgetOpen, currentMessages.length, currentConversation?.id, currentConversation?.unread_customer]);

  // Số tin nhắn chưa đọc của khách
  const unreadCount = currentConversation?.unread_customer || 0;

  // Gửi thông tin mở hội thoại cho khách vãng lai
  const handleStartGuestChat = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestContact.trim()) {
      toast.error('Vui lòng nhập họ tên và thông tin liên hệ (SĐT hoặc Email)!');
      return;
    }

    setIsSubmittingGuest(true);
    const conv = initClientConversation({
      customer_id: null,
      guest_name: guestName.trim(),
      guest_contact: guestContact.trim(),
    });

    toast.success(`Đã kết nối phiên hỗ trợ trực tuyến! Chuyên viên CSKH đang trực.`);
    setIsSubmittingGuest(false);
  };

  // Gửi tin nhắn từ phía khách hàng
  const handleSendMessage = (contentToSend) => {
    const text = contentToSend || inputMessage;
    if (!text || !text.trim() || !currentConversation) return;

    // 1. Gửi tin của khách (sender_type = 'customer')
    sendMessage({
      conversation_id: currentConversation.id,
      sender_type: 'customer',
      sender_id: user?.id || null,
      content: text,
    });

    setInputMessage('');

    // 2. Tự động phản hồi thông minh nếu CSKH chưa kịp trả lời (Simulated AI / CSKH Agent)
    const lower = text.toLowerCase();
    setTimeout(() => {
      let replyContent = '';
      if (lower.includes('size') || lower.includes('kích cỡ')) {
        replyContent =
          'Dạ về size áo kiểu Rayon (479073): Phom dáng regular fit thoải mái. Nếu bạn cao 1m55-1m65, nặng 48-55kg thì chọn Size M mặc đẹp nhất ạ!';
      } else if (lower.includes('đơn') || lower.includes('ord-') || lower.includes('giao')) {
        replyContent =
          'Dạ bạn có thể tra cứu nhanh tình trạng đơn hàng tại mục "ĐƠN HÀNG CỦA TÔI" trên thanh menu bằng Mã đơn + Số điện thoại đặt hàng ạ.';
      } else if (lower.includes('đổi') || lower.includes('trả') || lower.includes('hoàn tiền')) {
        replyContent =
          'Dạ chính sách Aether Labs hỗ trợ đổi/trả trực tuyến trong vòng 7 ngày kể từ khi nhận hàng cho mọi sản phẩm còn nguyên tem mác ạ.';
      } else if (lower.includes('qr') || lower.includes('ngân hàng') || lower.includes('chuyển khoản')) {
        replyContent =
          'Dạ phương thức Bank QR tích hợp VietQR Napas247 tự động kiểm tra số tiền và gạch nợ đơn hàng lập tức chỉ trong 3 giây!';
      } else {
        replyContent =
          'Cảm ơn bạn đã nhắn tin cho Aether Labs. Chuyên viên CSKH Phạm Chăm Sóc đã nhận được yêu cầu và sẽ hỗ trợ chi tiết cho bạn ngay ạ!';
      }

      sendMessage({
        conversation_id: currentConversation.id,
        sender_type: 'staff',
        sender_id: 3, // Phạm Chăm Sóc
        content: replyContent,
      });
    }, 1200);
  };

  // Câu hỏi mẫu gợi ý
  const QUICK_QUESTIONS = [
    'Kiểm tra thời gian giao hàng',
    'Tư vấn chọn size Áo kiểu Rayon',
    'Chính sách đổi trả trong 7 ngày',
    'Hướng dẫn thanh toán Chuyển khoản QR',
  ];

  return (
    <>
      {/* Nút bấm Floating CSKH tối giản: Chỉ còn icon tai nghe theo yêu cầu */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={toggleWidget}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-12 h-12 bg-[#080808] hover:bg-zinc-900 text-[#fafafa] border border-zinc-700 hover:border-zinc-300 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all cursor-pointer group"
          title="Hỗ trợ trực tuyến 24/7"
        >
          {/* Pulsing Emerald Dot */}
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          <Headphones className="w-5 h-5 text-zinc-200 group-hover:text-emerald-400 transition-colors" />

          {/* Badge số tin nhắn chưa đọc */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-mono font-bold text-black border border-[#080808]">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Cửa sổ Live Chat Drawer Technical Brutalism */}
      <AnimatePresence>
        {isWidgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-6 z-50 w-[92vw] sm:w-[390px] h-[540px] bg-[#0c0c0c] border border-zinc-800 text-[#fafafa] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden font-sans"
          >
            {/* Header Terminal Style */}
            <div className="p-3.5 bg-[#121212] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold tracking-wider text-white">
                      AETHER // LIVE CHAT
                    </span>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ONLINE
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 tracking-tight">
                    {user
                      ? `THÀNH VIÊN: ${user.full_name || user.phone}`
                      : currentConversation
                      ? `KHÁCH: ${currentConversation.guest_name}`
                      : 'HỆ THỐNG HỖ TRỢ TRỰC TUYẾN 24/7'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setWidgetOpen(false)}
                className="w-7 h-7 border border-zinc-800 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung Chat: Form Khách Vãng Lai hoặc Lịch Sử Tin Nhắn */}
            {!user && !currentConversation ? (
              <div className="flex-1 p-6 flex flex-col justify-center space-y-5 bg-gradient-to-b from-[#0c0c0c] to-[#121212]">
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 mx-auto bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="font-inter font-bold text-base text-white tracking-tight uppercase">
                    HỖ TRỢ TRỰC TUYẾN
                  </h3>
                  <p className="font-mono text-[11px] text-zinc-400 leading-relaxed px-2">
                    Vui lòng cung cấp Họ tên và Số điện thoại hoặc Email để chuyên viên CSKH hỗ trợ bạn ngay lập tức.
                  </p>
                </div>

                <form onSubmit={handleStartGuestChat} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase tracking-wider mb-1">
                      Họ và tên của bạn:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Minh Quân"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-[#161616] border border-zinc-800 py-2.5 pl-8 pr-3 text-white text-xs focus:outline-none focus:border-zinc-500 font-sans"
                      />
                      <User className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] uppercase tracking-wider mb-1">
                      Số điện thoại hoặc Email (guest_contact):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="VD: 0988112233 hoặc quan@gmail.com"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        className="w-full bg-[#161616] border border-zinc-800 py-2.5 pl-8 pr-3 text-white text-xs focus:outline-none focus:border-zinc-500 font-sans"
                      />
                      <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingGuest}
                    className="w-full py-3 bg-white text-black hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>BẮT ĐẦU TRÒ CHUYỆN [START CHAT]</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Thông tin liên hệ được mã hóa và bảo mật theo chính sách quyền riêng tư.</span>
                  </div>
                </form>
              </div>
            ) : (
              // Khung Lịch Sử Trò Chuyện (Thành viên hoặc Khách vãng lai đã khởi tạo)
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
                
                {/* Dải thông báo trạng thái hội thoại */}
                <div className="px-3 py-1.5 bg-[#121212]/80 border-b border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    Phiên: #{currentConversation?.id}
                  </span>
                  <span>Chuyên viên: Phạm Chăm Sóc (CSKH)</span>
                </div>

                {/* Danh sách tin nhắn */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
                  {currentMessages.map((msg) => {
                    const isMe = msg.sender_type === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                            {isMe ? 'BẠN (GUEST / CUSTOMER)' : '[CS_STAFF] PHẠM CHĂM SÓC'}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-600">
                            {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-white text-black border border-white font-sans'
                              : 'bg-[#18181b] text-zinc-200 border border-zinc-800 font-sans'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {isMe && (
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] font-mono text-zinc-500">
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>{msg.read_at ? 'Đã xem' : 'Đã gửi'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Câu hỏi gợi ý nhanh (Quick Inquiry Chips) */}
                <div className="px-3 py-2 bg-[#0e0e0e] border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="shrink-0 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-mono text-[10px] tracking-tight transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input Footer */}
                <div className="p-3 bg-[#121212] border-t border-zinc-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn hỗ trợ..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans"
                    />

                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="px-4 py-2.5 bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-500 font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">GỬI</span>
                    </button>
                  </form>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

