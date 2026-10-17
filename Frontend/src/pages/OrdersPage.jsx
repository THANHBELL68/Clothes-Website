import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Star,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  AlertTriangle,
  Upload,
  CreditCard,
  KeyRound,
  FileText,
  User,
  Phone,
} from 'lucide-react';
import AetherNavbar from '../components/AetherNavbar';
import { useOrderStore } from '../store/orderStore';
import {
  MOCK_ORDER_DETAILS,
  MOCK_ORDER_ITEMS,
  MOCK_PRODUCTS_WITH_DETAILS,
  MOCK_CATEGORIES,
  formatVND,
} from '../data/mockData';
import toast from 'react-hot-toast';

// 5 Bước trạng thái chuẩn CSDL PostgreSQL (order_status enum & order_status_histories)
const ORDER_STEPS = [
  { key: 'new', label: '01 // MỚI TẠO', desc: 'Đơn hàng mới tạo, đang chờ xác nhận' },
  { key: 'processing', label: '02 // ĐANG XỬ LÝ', desc: 'CSKH đã duyệt đơn' },
  { key: 'packing', label: '03 // ĐÓNG GÓI', desc: 'Thủ kho đang soạn & đóng gói' },
  { key: 'shipping', label: '04 // ĐANG GIAO', desc: 'Đã giao cho đơn vị vận chuyển' },
  { key: 'completed', label: '05 // HOÀN THÀNH', desc: 'Khách hàng đã nhận hàng' },
];

export default function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Đọc query params: ?code=ORD-...&phone=...
  const queryParams = new URLSearchParams(location.search);
  const initialCode = queryParams.get('code') || '';
  const initialPhone = queryParams.get('phone') || '';

  // Order store
  const storeOrders = useOrderStore((state) => state.orders);
  const cancelOrderStore = useOrderStore((state) => state.cancelOrder);
  const submitReturnRequestStore = useOrderStore((state) => state.submitReturnRequest);
  const submitReviewStore = useOrderStore((state) => state.submitReview);

  // User đăng nhập
  const [user, setUser] = useState(null);
  const isMember = Boolean(user);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shop_auth_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }, []);

  // Chế độ xem: 'my_orders' (Thành viên) hoặc 'guest_tracking' (Khách vãng lai tra cứu)
  const [activeTab, setActiveTab] = useState(initialCode ? 'guest_tracking' : isMember ? 'my_orders' : 'guest_tracking');

  // Form tra cứu khách vãng lai (order_code + customer_phone)
  const [trackingForm, setTrackingForm] = useState({
    order_code: initialCode,
    customer_phone: initialPhone,
  });

  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(Boolean(initialCode));

  // Gộp danh sách đơn hàng mẫu và đơn từ store
  const allOrdersList = useMemo(() => {
    const formattedStoreOrders = storeOrders.map((o) => ({
      order_id: o.id,
      order_code: o.code,
      user_id: user?.id || null,
      is_buy_now: false,
      status: o.status,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      note: o.note || null,
      created_at: o.created_at,
      updated_at: o.created_at,
      customer_name: o.receiver_name,
      customer_phone: o.receiver_phone,
      customer_email: o.receiver_email || null,
      recipient_name: o.receiver_name,
      recipient_phone: o.receiver_phone,
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Dịch Vọng Hậu',
      street_address: o.shipping_address,
      subtotal: o.subtotal,
      voucher_id: o.coupon?.id || null,
      voucher_code: o.coupon?.code || null,
      voucher_discount: o.coupon_discount || 0,
      points_used: o.points_used || 0,
      points_discount: o.points_discount || 0,
      shipping_fee: o.shipping_fee || 0,
      total_amount: o.total,
      shipping_carrier_id: 1,
      shipping_carrier_name: 'Giao Hàng Nhanh (GHN)',
      tracking_code: 'GHN' + String(o.id).slice(-8) + 'VN',
      shipped_at: o.status === 'shipping' || o.status === 'completed' ? o.created_at : null,
      delivered_at: o.status === 'completed' ? o.created_at : null,
      cancel_reason: o.cancel_reason || null,
      cancelled_by: null,
      cancelled_at: o.cancelled_at || null,
      item_count: o.items?.length || 1,
      items: o.items || [],
      return_request: o.return_request || null,
    }));

    return [...formattedStoreOrders, ...MOCK_ORDER_DETAILS];
  }, [storeOrders, user]);

  // Xử lý tra cứu đơn hàng linh hoạt theo mã đơn hoặc số điện thoại
  const performSearch = (targetCode, targetPhone) => {
    const code = (targetCode !== undefined ? targetCode : trackingForm.order_code).trim().toUpperCase();
    const phone = (targetPhone !== undefined ? targetPhone : trackingForm.customer_phone).trim().replace(/[\s\-\.]/g, '');

    if (!code && !phone) {
      toast.error('Vui lòng nhập Mã đơn hàng hoặc Số điện thoại để tra cứu!');
      return;
    }

    setSearchAttempted(true);

    const found = allOrdersList.find((ord) => {
      const ordCode = (ord.order_code || ord.code || '').toUpperCase();
      const ordPhone1 = (ord.customer_phone || '').replace(/[\s\-\.]/g, '');
      const ordPhone2 = (ord.recipient_phone || '').replace(/[\s\-\.]/g, '');

      // Nếu có cả 2: khớp mã đơn và khớp số điện thoại
      if (code && phone) {
        const matchCode = ordCode === code || ordCode.endsWith(code) || code.endsWith(ordCode);
        const matchPhone = ordPhone1 === phone || ordPhone2 === phone || ordPhone1.endsWith(phone) || phone.endsWith(ordPhone1);
        return matchCode && matchPhone;
      }
      // Nếu chỉ có mã đơn
      if (code) {
        return ordCode === code || ordCode.endsWith(code);
      }
      // Nếu chỉ có số điện thoại
      if (phone) {
        return ordPhone1 === phone || ordPhone2 === phone || ordPhone1.endsWith(phone);
      }
      return false;
    });

    if (found) {
      setTrackedOrder(found);
      toast.success(`Đã tìm thấy đơn hàng [${found.order_code}]!`);
    } else {
      setTrackedOrder(null);
      toast.error('Không tìm thấy đơn hàng nào khớp với thông tin đã nhập!');
    }
  };

  const handleTrackOrder = (e) => {
    if (e) e.preventDefault();
    performSearch();
  };

  // Tự động tìm kiếm ngay khi có query params từ Checkout hoặc URL
  useEffect(() => {
    if (initialCode || initialPhone) {
      performSearch(initialCode, initialPhone);
    }
  }, [initialCode, initialPhone]);

  // =========================================================================
  // XÁC THỰC MÃ OTP CHO KHÁCH VÃNG LAI TRƯỚC KHI HỦY HOẶC ĐỔI TRẢ
  // =========================================================================
  const [otpModal, setOtpModal] = useState({
    open: false,
    order: null,
    actionType: null, // 'cancel' | 'return'
    pendingData: null,
    generatedOtp: '889922',
  });
  const [enteredOtp, setEnteredOtp] = useState('');

  // =========================================================================
  // MODAL HỦY ĐƠN HÀNG (order_cancellations)
  // =========================================================================
  const [cancelModal, setCancelModal] = useState({ open: false, order: null });
  const [cancelReason, setCancelReason] = useState('Khách hàng muốn thay đổi kích cỡ / màu sắc');
  const [customReason, setCustomReason] = useState('');

  const openCancelModal = (order) => {
    if (order.status !== 'new' && order.status !== 'processing') {
      toast.error('Đơn hàng đã được xuất kho, không thể hủy!');
      return;
    }

    // Nếu là khách vãng lai -> Bắt buộc xác thực OTP trước
    if (!isMember || order.user_id === null) {
      const gen = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpModal({
        open: true,
        order,
        actionType: 'cancel',
        pendingData: null,
        generatedOtp: gen,
      });
      return;
    }

    setCancelModal({ open: true, order });
  };

  const handleConfirmCancel = () => {
    const order = cancelModal.order;
    if (!order) return;

    const finalReason = customReason.trim() ? `${cancelReason}: ${customReason}` : cancelReason;

    // Trigger DB quy định: Thêm dòng vào order_cancellations tự đổi status sang 'cancelled'
    cancelOrderStore(order.order_id, finalReason);

    setCancelModal({ open: false, order: null });
    setCustomReason('');
    toast.success(`Đã hủy thành công đơn hàng [${order.order_code}]!`);

    // Cập nhật lại trackedOrder nếu đang tra cứu
    if (trackedOrder && trackedOrder.order_id === order.order_id) {
      setTrackedOrder({ ...trackedOrder, status: 'cancelled', cancel_reason: finalReason });
    }
  };

  // =========================================================================
  // MODAL YÊU CẦU ĐỔI / TRẢ HÀNG (return_requests, return_request_items, refunds)
  // =========================================================================
  const [returnModal, setReturnModal] = useState({ open: false, order: null });
  const [returnForm, setReturnForm] = useState({
    type: 'exchange', // 'exchange' | 'refund'
    reason: 'wrong_size', // 'wrong_size' | 'defective' | 'changed_mind' | 'other'
    description: '',
    exchange_variant_id: 'AT01-TRANG-M',
    bank_name: 'Vietcombank',
    bank_account_no: '',
    bank_account_name: '',
    media_url: '',
  });

  const openReturnModal = (order) => {
    if (order.status !== 'completed') {
      toast.error('Chỉ đơn hàng đã hoàn thành mới được yêu cầu đổi trả!');
      return;
    }

    // Kiểm tra trong hạn 7 ngày (return.window_days = 7)
    const orderDate = new Date(order.created_at).getTime();
    const daysDiff = (Date.now() - orderDate) / (1000 * 3600 * 24);
    if (daysDiff > 7) {
      toast.error('Đơn hàng đã quá hạn 7 ngày đổi/trả theo quy định!');
      return;
    }

    // Khách vãng lai: Yêu cầu OTP trước
    if (!isMember || order.user_id === null) {
      const gen = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpModal({
        open: true,
        order,
        actionType: 'return',
        pendingData: null,
        generatedOtp: gen,
      });
      return;
    }

    setReturnModal({ open: true, order });
  };

  const handleConfirmReturn = () => {
    const order = returnModal.order;
    if (!order) return;

    if (returnForm.type === 'refund') {
      if (!returnForm.bank_account_no.trim() || !returnForm.bank_account_name.trim()) {
        toast.error('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng để hoàn tiền!');
        return;
      }
    }

    submitReturnRequestStore(order.order_id, {
      type: returnForm.type,
      reason: returnForm.reason,
      description: returnForm.description,
      exchangeVariantId: returnForm.type === 'exchange' ? returnForm.exchange_variant_id : null,
      refundDetails:
        returnForm.type === 'refund'
          ? {
              bank_name: returnForm.bank_name,
              bank_account_no: returnForm.bank_account_no,
              bank_account_name: returnForm.bank_account_name,
            }
          : null,
    });

    setReturnModal({ open: false, order: null });
    toast.success(
      `Đã gửi yêu cầu ${returnForm.type === 'exchange' ? 'đổi hàng' : 'hoàn tiền'} thành công. Nhân viên CSKH sẽ xử lý trong 24h!`,
      { duration: 5000 }
    );
  };

  // Xác nhận OTP thành công cho khách vãng lai
  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== otpModal.generatedOtp) {
      toast.error('Mã OTP không chính xác!');
      return;
    }

    const { order, actionType } = otpModal;
    setOtpModal({ open: false, order: null, actionType: null, pendingData: null, generatedOtp: '' });
    setEnteredOtp('');

    if (actionType === 'cancel') {
      setCancelModal({ open: true, order });
    } else if (actionType === 'return') {
      setReturnModal({ open: true, order });
    }
  };

  // =========================================================================
  // MODAL ĐÁNH GIÁ SẢN PHẨM
  // =========================================================================
  const [reviewModal, setReviewModal] = useState({ open: false, order: null, item: null });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    content: '',
    media_url: '',
  });

  const handleConfirmReview = () => {
    if (!reviewModal.order) return;
    submitReviewStore(reviewModal.order.order_id, reviewModal.item?.id || 1, {
      rating: reviewForm.rating,
      comment: reviewForm.content,
    });

    setReviewModal({ open: false, order: null, item: null });
    toast.success('Đã gửi đánh giá sản phẩm thành công! Cảm ơn bạn.');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#fafafa] font-inter selection:bg-[#fafafa] selection:text-[#080808] pb-24">
      
      {/* Top Navbar */}
      <AetherNavbar
        categories={MOCK_CATEGORIES}
        cartCount={0}
        onOpenCart={() => {}}
        onOpenSearch={() => {}}
        onScrollToSection={() => {}}
      />

      {/* Header Bar */}
      <div className="pt-14 border-b border-zinc-800 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase block">
              ORDER MANAGEMENT // THEO DÕI ĐƠN HÀNG
            </span>
            <h1 className="font-inter font-black text-2xl sm:text-3xl text-white tracking-tight mt-1">
              Theo Dõi & Quản Lý Đơn Hàng
            </h1>
          </div>

          {/* 2 Tabs: Đơn hàng thành viên vs Tra cứu khách vãng lai */}
          <div className="flex items-center border border-zinc-800 bg-black p-1 font-mono text-xs">
            {isMember && (
              <button
                onClick={() => setActiveTab('my_orders')}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'my_orders'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ĐƠN CỦA TÔI ({allOrdersList.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('guest_tracking')}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'guest_tracking'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              TRA CỨU VÃNG LAI (GUEST)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* =====================================================================
            TAB 1: FORM TRA CỨU CHO KHÁCH VÃNG LAI (MÃ ĐƠN + SỐ ĐIỆN THOẠI)
        ====================================================================== */}
        {activeTab === 'guest_tracking' && (
          <div className="space-y-8">
            <div className="border border-zinc-800 bg-[#080808] p-6 sm:p-8 max-w-2xl mx-auto space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase block">
                  TRA CỨU DÀNH RIÊNG CHO KHÁCH VÃNG LAI
                </span>
                <h3 className="font-inter font-bold text-lg text-white">
                  Nhập mã đơn hàng và số điện thoại đã đặt
                </h3>
              </div>

              <form onSubmit={handleTrackOrder} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">
                      MÃ ĐƠN HÀNG
                    </label>
                    <input
                      type="text"
                      placeholder="VD: ORD-20261016-001"
                      value={trackingForm.order_code}
                      onChange={(e) =>
                        setTrackingForm({ ...trackingForm, order_code: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs uppercase placeholder:text-zinc-700 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">
                      SỐ ĐIỆN THOẠI ĐẶT HÀNG
                    </label>
                    <input
                      type="tel"
                      placeholder="VD: 0912345678"
                      value={trackingForm.customer_phone}
                      onChange={(e) =>
                        setTrackingForm({ ...trackingForm, customer_phone: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs placeholder:text-zinc-700 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>TRA CỨU ĐƠN HÀNG</span>
                </button>
              </form>
            </div>

            {/* Kết quả tra cứu đơn hàng vãng lai */}
            {searchAttempted && (
              <div>
                {trackedOrder ? (
                  <OrderCard
                    order={trackedOrder}
                    onOpenCancel={openCancelModal}
                    onOpenReturn={openReturnModal}
                    onOpenReview={(item) =>
                      setReviewModal({ open: true, order: trackedOrder, item })
                    }
                  />
                ) : (
                  <div className="p-12 text-center border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-500">
                    KHÔNG TÌM THẤY ĐƠN HÀNG PHÙ HỢP. VUI LÒNG KIỂM TRA LẠI MÃ ĐƠN VÀ SĐT.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: DANH SÁCH ĐƠN HÀNG CỦA THÀNH VIÊN
        ====================================================================== */}
        {activeTab === 'my_orders' && (
          <div className="space-y-6">
            {allOrdersList.length === 0 ? (
              <div className="p-16 text-center border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-500 space-y-3">
                <p>BẠN CHƯA CÓ ĐƠN HÀNG NÀO TRONG HỆ THỐNG.</p>
                <Link
                  to="/#catalog"
                  className="inline-block px-4 py-2 border border-zinc-700 text-white tracking-widest uppercase hover:bg-zinc-900"
                >
                  [ XEM SẢN PHẨM // CATALOG ]
                </Link>
              </div>
            ) : (
              allOrdersList.map((ord) => (
                <OrderCard
                  key={ord.order_id}
                  order={ord}
                  onOpenCancel={openCancelModal}
                  onOpenReturn={openReturnModal}
                  onOpenReview={(item) =>
                    setReviewModal({ open: true, order: ord, item })
                  }
                />
              ))
            )}
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: BẮT BUỘC NHẬP LÝ DO HỦY ĐƠN (order_cancellations.reason)
      ========================================================================== */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCancelModal({ open: false, order: null })}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-[#080808] border border-zinc-800 p-6 text-white z-10 space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                HỦY ĐƠN HÀNG // {cancelModal.order?.order_code}
              </span>
              <button
                onClick={() => setCancelModal({ open: false, order: null })}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed">
              Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi xác nhận, đơn hàng sẽ được hủy và hoàn tiền lại theo quy định nếu đã thanh toán.
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest block">
                CHỌN LÝ DO HỦY ĐƠN (*):
              </label>

              {[
                'Khách hàng muốn thay đổi kích cỡ / màu sắc',
                'Thay đổi địa chỉ giao hàng',
                'Tìm thấy sản phẩm giá tốt hơn',
                'Không còn nhu cầu mua nữa',
                'Lý do khác',
              ].map((r) => (
                <label key={r} className="flex items-center gap-2 p-2 border border-zinc-800 bg-zinc-950 cursor-pointer">
                  <input
                    type="radio"
                    name="cancel_reason"
                    checked={cancelReason === r}
                    onChange={() => setCancelReason(r)}
                    className="accent-white"
                  />
                  <span>{r}</span>
                </label>
              ))}

              <textarea
                placeholder="Ghi chú chi tiết thêm lý do hủy (nếu có)..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white text-xs placeholder:text-zinc-700 focus:outline-none focus:border-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, order: null })}
                className="flex-1 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold tracking-wider uppercase shadow-md"
              >
                XÁC NHẬN HỦY ĐƠN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: XÁC THỰC MÃ OTP CHO KHÁCH VÃNG LAI
      ========================================================================== */}
      {otpModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setOtpModal({ open: false, order: null, actionType: null, pendingData: null, generatedOtp: '' })}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-[#080808] border border-zinc-800 p-6 text-white z-10 space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                XÁC THỰC OTP KHÁCH VÃNG LAI
              </span>
              <button
                onClick={() => setOtpModal({ open: false, order: null, actionType: null, pendingData: null, generatedOtp: '' })}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Để bảo mật đơn hàng của khách vãng lai, hệ thống gửi mã xác nhận 6 số đến số điện thoại{' '}
              <strong className="text-white">{otpModal.order?.customer_phone}</strong> trước khi thực hiện thao tác {otpModal.actionType === 'cancel' ? 'hủy đơn' : 'đổi trả'}.
            </p>

            {/* Mã demo hiển thị cho môi trường test */}
            <div className="p-3 border border-amber-500/40 bg-amber-950/20 text-center space-y-1">
              <span className="text-[10px] text-zinc-400 block">MÃ OTP DEMO HỆ THỐNG:</span>
              <span className="text-xl font-bold tracking-widest text-amber-300">
                {otpModal.generatedOtp}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase">NHẬP MÃ OTP 6 CHỮ SỐ (*)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Nhập 6 số..."
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-center text-white text-lg font-bold tracking-widest focus:outline-none focus:border-white"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full py-3 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-bold tracking-wider uppercase transition-colors"
            >
              XÁC THỰC & TIẾP TỤC
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: YÊU CẦU ĐỔI / TRẢ HÀNG (return_requests)
      ========================================================================== */}
      {returnModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setReturnModal({ open: false, order: null })}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-xl bg-[#080808] border border-zinc-800 p-6 text-white z-10 space-y-4 font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-sky-400 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                YÊU CẦU ĐỔI / TRẢ // {returnModal.order?.order_code}
              </span>
              <button
                onClick={() => setReturnModal({ open: false, order: null })}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chọn Loại: Đổi Hàng vs Hoàn Tiền */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 uppercase">HÌNH THỨC YÊU CẦU (*)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, type: 'exchange' })}
                  className={`p-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    returnForm.type === 'exchange'
                      ? 'border-white bg-zinc-900 text-white ring-1 ring-white/50'
                      : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  ĐỔI HÀNG (EXCHANGE)
                </button>

                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, type: 'refund' })}
                  className={`p-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    returnForm.type === 'refund'
                      ? 'border-white bg-zinc-900 text-white ring-1 ring-white/50'
                      : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  HOÀN TIỀN (REFUND)
                </button>
              </div>
            </div>

            {/* Lý do đổi trả */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-zinc-400 uppercase">LÝ DO YÊU CẦU (*)</label>
              <select
                value={returnForm.reason}
                onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs focus:outline-none focus:border-white"
              >
                <option value="wrong_size">Mặc không vừa kích cỡ</option>
                <option value="defective">Sản phẩm bị lỗi sản xuất / lỗi vải</option>
                <option value="changed_mind">Đổi ý / Không ưng ý phom dáng</option>
                <option value="other">Lý do khác</option>
              </select>
            </div>

            {/* NẾU LÀ ĐỔI HÀNG: Dropdown chọn biến thể mới */}
            {returnForm.type === 'exchange' && (
              <div className="space-y-1 text-xs p-3 border border-zinc-800 bg-zinc-950">
                <label className="text-[10px] text-amber-300 uppercase block font-bold">
                  CHỌN SẢN PHẨM / BIẾN THỂ MỚI MUỐN ĐỔI (*):
                </label>
                <select
                  value={returnForm.exchange_variant_id}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, exchange_variant_id: e.target.value })
                  }
                  className="w-full bg-black border border-zinc-700 p-2 text-white text-xs"
                >
                  <option value="AKN-479073-00-S">Nữ Áo Kiểu Rayon - Size S / Trắng (SKU: AKN-479073-00-S)</option>
                  <option value="AKN-479073-00-M">Nữ Áo Kiểu Rayon - Size M / Trắng (SKU: AKN-479073-00-M)</option>
                  <option value="AKN-479073-10-M">Nữ Áo Kiểu Rayon - Size M / Beige (SKU: AKN-479073-10-M)</option>
                  <option value="AKM-486116-69-M">Nam Áo Khoác Lông Cừu - Size M / Navy (SKU: AKM-486116-69-M)</option>
                  <option value="AKM-486116-69-L">Nam Áo Khoác Lông Cừu - Size L / Navy (SKU: AKM-486116-69-L)</option>
                  <option value="AKM-486116-09-L">Nam Áo Khoác Lông Cừu - Size L / Đen (SKU: AKM-486116-09-L)</option>
                </select>
              </div>
            )}

            {/* NẾU LÀ HOÀN TIỀN: Form tài khoản ngân hàng */}
            {returnForm.type === 'refund' && (
              <div className="space-y-3 p-3 border border-zinc-800 bg-zinc-950 text-xs">
                <span className="text-[10px] text-amber-300 uppercase block font-bold">
                  THÔNG TIN TÀI KHOẢN NHẬN HOÀN TIỀN:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400">TÊN NGÂN HÀNG</label>
                    <input
                      type="text"
                      value={returnForm.bank_name}
                      onChange={(e) => setReturnForm({ ...returnForm, bank_name: e.target.value })}
                      className="w-full bg-black border border-zinc-800 p-2 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400">SỐ TÀI KHOẢN (*)</label>
                    <input
                      type="text"
                      placeholder="Số tài khoản..."
                      value={returnForm.bank_account_no}
                      onChange={(e) =>
                        setReturnForm({ ...returnForm, bank_account_no: e.target.value })
                      }
                      className="w-full bg-black border border-zinc-800 p-2 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">TÊN CHỦ TÀI KHOẢN (*)</label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A..."
                    value={returnForm.bank_account_name}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, bank_account_name: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-black border border-zinc-800 p-2 text-white text-xs uppercase"
                  />
                </div>
              </div>
            )}

            {/* Mô tả chi tiết & Đính kèm ảnh */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-zinc-400 uppercase">MÔ TẢ CHI TIẾT TÌNH TRẠNG</label>
              <textarea
                placeholder="Mô tả cụ thể lý do đổi hoặc lỗi của sản phẩm..."
                value={returnForm.description}
                onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-zinc-400 uppercase">ĐÍNH KÈM ẢNH/VIDEO MINH CHỨNG</label>
              <input
                type="text"
                placeholder="Dán link ảnh hoặc tải lên minh chứng..."
                value={returnForm.media_url}
                onChange={(e) => setReturnForm({ ...returnForm, media_url: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setReturnModal({ open: false, order: null })}
                className="flex-1 py-2.5 border border-zinc-800 text-zinc-400 hover:text-white"
              >
                HỦY
              </button>
              <button
                onClick={handleConfirmReturn}
                className="flex-1 py-2.5 bg-white text-black font-bold tracking-wider uppercase hover:bg-zinc-200 shadow-md"
              >
                GỬI YÊU CẦU ĐỔI TRẢ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ĐÁNH GIÁ SẢN PHẨM (reviews & review_media)
      ========================================================================== */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setReviewModal({ open: false, order: null, item: null })}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-[#080808] border border-zinc-800 p-6 text-white z-10 space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" />
                ĐÁNH GIÁ SẢN PHẨM
              </span>
              <button
                onClick={() => setReviewModal({ open: false, order: null, item: null })}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-zinc-400">SẢN PHẨM:</div>
              <div className="font-bold text-white">{reviewModal.item?.product_name || 'Áo thun basic'}</div>
            </div>

            {/* Chọn số sao */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-zinc-400 uppercase">CHẤT LƯỢNG (1 - 5 SAO)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: st })}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        st <= reviewForm.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Nội dung nhận xét */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-zinc-400 uppercase">NHẬN XÉT CỦA BẠN (*)</label>
              <textarea
                rows={3}
                placeholder="Chia sẻ cảm nhận về chất vải, độ cản gió, phom dáng..."
                value={reviewForm.content}
                onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-white text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="p-2 border border-zinc-900 bg-zinc-950 text-[10px] text-zinc-500">
              * Đánh giá của bạn sẽ được kiểm duyệt và hiển thị công khai trên trang sản phẩm.
            </div>

            <button
              onClick={handleConfirmReview}
              className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              GỬI ĐÁNH GIÁ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// COMPONENT ORDER CARD VỚI TIẾN TRÌNH 5 BƯỚC & NÚT HÀNH ĐỘNG
// ============================================================================
function OrderCard({ order, onOpenCancel, onOpenReturn, onOpenReview }) {
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';
  const canCancel = order.status === 'new' || order.status === 'processing';

  // Xác định bước tiến trình hiện tại (0..4)
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="border border-zinc-800 bg-[#080808] font-mono text-xs overflow-hidden">
      
      {/* Header Đơn Hàng */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base text-white">{order.order_code}</span>
            <span className={`px-2 py-0.5 border text-[10px] tracking-wider uppercase ${
              isCancelled
                ? 'border-rose-500/50 bg-rose-950/20 text-rose-400'
                : isCompleted
                ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                : 'border-amber-500/50 bg-amber-950/20 text-amber-300'
            }`}>
              {order.status?.toUpperCase()}
            </span>
          </div>

          <div className="text-[10px] text-zinc-500 flex items-center gap-3">
            <span>NGÀY ĐẶT: {new Date(order.created_at).toLocaleString('vi-VN')}</span>
            <span>//</span>
            <span>PT THANH TOÁN: {order.payment_method?.toUpperCase()}</span>
          </div>
        </div>

        {/* Nút hành động chính */}
        <div className="flex items-center gap-2">
          {/* Nút HỦY ĐƠN: Chỉ khi 'new' hoặc 'processing' */}
          {canCancel && (
            <button
              onClick={() => onOpenCancel(order)}
              className="px-3 py-1.5 border border-rose-500/50 bg-rose-950/20 text-rose-300 hover:border-rose-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              [ HỦY ĐƠN HÀNG ]
            </button>
          )}

          {/* Nút ĐỔI TRẢ & ĐÁNH GIÁ: Chỉ khi 'completed' */}
          {isCompleted && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenReturn(order)}
                className="px-3 py-1.5 border border-sky-500/50 bg-sky-950/20 text-sky-300 hover:border-sky-400 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                [ YÊU CẦU ĐỔI / TRẢ (7 NGÀY) ]
              </button>

              <button
                onClick={() => onOpenReview(order.items?.[0])}
                className="px-3 py-1.5 border border-amber-500/50 bg-amber-950/20 text-amber-300 hover:border-amber-400 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                [ VIẾT ĐÁNH GIÁ ]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          TIẾN TRÌNH ĐƠN HÀNG 5 BƯỚC (order_status_histories)
      ======================================================================== */}
      {!isCancelled ? (
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-950/30">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 relative">
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`p-3 border transition-colors space-y-1 ${
                    isCurrent
                      ? 'border-white bg-zinc-900 shadow-md ring-1 ring-white/40'
                      : isPast
                      ? 'border-emerald-500/40 bg-emerald-950/10 text-emerald-300'
                      : 'border-zinc-900 bg-black text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold">{step.label}</span>
                    {isPast && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Thông tin vận đơn (order_shipments) */}
          {order.tracking_code && (
            <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>ĐƠN VỊ VẬN CHUYỂN: <strong className="text-white">{order.shipping_carrier_name || 'GHN'}</strong></span>
                <span>//</span>
                <span>MÃ VẬN ĐƠN: <strong className="text-amber-300">{order.tracking_code}</strong></span>
              </div>

              {order.delivered_at && (
                <span className="text-emerald-400">
                  GIAO THÀNH CÔNG: {new Date(order.delivered_at).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Thông báo Đơn Đã Hủy từ order_cancellations */
        <div className="p-4 border-b border-zinc-800 bg-rose-950/20 text-rose-300 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <div className="font-bold">ĐƠN HÀNG ĐÃ ĐƯỢC HỦY</div>
            <div className="text-[11px] text-zinc-400">
              LÝ DO HỦY: {order.cancel_reason || 'Khách hàng thay đổi ý định'}
            </div>
          </div>
        </div>
      )}

      {/* Thông tin người nhận và địa chỉ */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-400">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase block mb-1">
            NGƯỜI NHẬN & ĐỊA CHỈ GIAO HÀNG:
          </span>
          <div className="text-white font-bold">{order.recipient_name} - {order.recipient_phone}</div>
          <div className="text-[11px] leading-relaxed mt-0.5">
            {order.street_address}, {order.ward}, {order.district}, {order.province}
          </div>
        </div>

        <div className="sm:text-right space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase block mb-1">
            CHI TIẾT THANH TOÁN:
          </span>
          <div>TIỀN HÀNG: {formatVND(order.subtotal)}</div>
          {order.voucher_discount > 0 && (
            <div className="text-emerald-400">VOUCHER: -{formatVND(order.voucher_discount)}</div>
          )}
          {order.points_discount > 0 && (
            <div className="text-emerald-400">ĐIỂM: -{formatVND(order.points_discount)}</div>
          )}
          <div>PHÍ SHIP: {order.shipping_fee === 0 ? 'MIỄN PHÍ' : formatVND(order.shipping_fee)}</div>
          <div className="text-base font-bold text-white pt-1">
            TỔNG TIỀN: {formatVND(order.total_amount)}
          </div>
        </div>
      </div>

    </div>
  );
}
