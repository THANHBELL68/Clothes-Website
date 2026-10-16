import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  QrCode,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Tag,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  Truck,
  Building,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import AetherNavbar from '../components/AetherNavbar';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { MOCK_VOUCHERS, MOCK_CATEGORIES, formatVND } from '../data/mockData';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra cờ is_buy_now
  const isBuyNow = new URLSearchParams(location.search).get('buy_now') === 'true';

  // Lấy dữ liệu giỏ hàng hoặc dữ liệu Buy Now
  const cartItemsStore = useCartStore((state) => state.items);
  const clearCartStore = useCartStore((state) => state.clearCart);
  const createOrderInStore = useOrderStore((state) => state.createOrder);

  // Buy now item từ sessionStorage nếu có
  const [buyNowItem, setBuyNowItem] = useState(null);

  useEffect(() => {
    if (isBuyNow) {
      try {
        const raw = sessionStorage.getItem('aether_buy_now_item');
        if (raw) setBuyNowItem(JSON.parse(raw));
      } catch {
        setBuyNowItem(null);
      }
    }
  }, [isBuyNow]);

  const itemsToCheckout = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      return [buyNowItem];
    }
    return cartItemsStore;
  }, [isBuyNow, buyNowItem, cartItemsStore]);

  // Thông tin user đăng nhập (nếu có)
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

  // Sổ địa chỉ thành viên (customer_addresses)
  const memberAddresses = useMemo(() => {
    if (!user) return [];
    return [
      {
        id: 1,
        label: 'Nhà riêng',
        recipient_name: user.full_name || 'Nguyễn Văn Khách',
        recipient_phone: user.phone || '0912345678',
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Dịch Vọng Hậu',
        street_address: 'Số 12 Duy Tân, Tòa nhà FPT',
        is_default: true,
      },
      {
        id: 2,
        label: 'Công ty',
        recipient_name: user.full_name || 'Nguyễn Văn Khách',
        recipient_phone: user.phone || '0912345678',
        province: 'Hà Nội',
        district: 'Đống Đa',
        ward: 'Láng Thượng',
        street_address: 'Tầng 5, 91 Chùa Láng',
        is_default: false,
      },
    ];
  }, [user]);

  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Form thông tin khách vãng lai / địa chỉ tùy chỉnh (order_customers & order_shipping_addresses)
  const [guestForm, setGuestForm] = useState({
    customer_name: user?.full_name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    recipient_name: user?.full_name || '',
    recipient_phone: user?.phone || '',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
    street_address: '',
    note: '',
  });

  // =========================================================================
  // TIỀN, VOUCHER, ĐIỂM THƯỞNG & SHIP (order_amounts & system_settings)
  // =========================================================================

  // 1. Tạm tính subtotal
  const subtotal = useMemo(() => {
    return itemsToCheckout.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );
  }, [itemsToCheckout]);

  // 2. Voucher (vouchers.code)
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) return;

    const found = MOCK_VOUCHERS.find((v) => v.code === code && v.is_active);
    if (!found) {
      toast.error(`Mã voucher "${code}" không hợp lệ hoặc đã hết hạn!`);
      return;
    }

    if (subtotal < found.min_order_value) {
      toast.error(
        `Đơn hàng cần tối thiểu ${formatVND(found.min_order_value)} để áp dụng mã ${code}!`
      );
      return;
    }

    setAppliedVoucher(found);
    toast.success(`Đã áp dụng voucher [${code}]!`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
  };

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discount_type === 'percent') {
      const calculated = (subtotal * appliedVoucher.discount_value) / 100;
      if (appliedVoucher.max_discount_amount) {
        return Math.min(calculated, appliedVoucher.max_discount_amount);
      }
      return calculated;
    }
    return appliedVoucher.discount_value; // fixed_amount
  }, [appliedVoucher, subtotal]);

  // 3. Phí giao hàng (shipping_fee theo system_settings: mặc định 30.000₫, miễn phí từ 500.000₫)
  const shippingFee = useMemo(() => {
    if (subtotal >= 500000) return 0;
    return 30000;
  }, [subtotal]);

  // 4. Điểm thưởng loyalty_points (CHỈ THÀNH VIÊN; KHÁCH VÃNG LAI BẮT BUỘC = 0 THEO TRIGGER DB)
  const [pointsToUse, setPointsToUse] = useState(0);

  const maxPointsCanUse = useMemo(() => {
    if (!isMember || !user) return 0;
    const currentPoints = user.loyalty_points || 0;
    const remainingBeforePoints = Math.max(0, subtotal - voucherDiscount);
    // 1 điểm = 1.000 VNĐ (loyalty.point_value_vnd)
    const pointsNeededForTotal = Math.floor(remainingBeforePoints / 1000);
    return Math.min(currentPoints, pointsNeededForTotal);
  }, [isMember, user, subtotal, voucherDiscount]);

  const pointsDiscount = useMemo(() => {
    if (!isMember) return 0;
    return pointsToUse * 1000;
  }, [isMember, pointsToUse]);

  // 5. Tổng tiền khớp CHECK constraint: total_amount = subtotal + shipping_fee - voucher_discount - points_discount
  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + shippingFee - voucherDiscount - pointsDiscount);
  }, [subtotal, shippingFee, voucherDiscount, pointsDiscount]);

  // Phương thức thanh toán (payment_method: 'cod' | 'bank_qr')
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Mã đơn hàng ngẫu nhiên hiển thị trên QR
  const sampleOrderCode = useMemo(() => {
    return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  }, []);

  // Xử lý bấm Đặt Hàng (Transaction 6 bảng)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmOrder = () => {
    if (itemsToCheckout.length === 0) {
      toast.error('Không có mặt hàng nào để thanh toán!');
      navigate('/');
      return;
    }

    // Lấy thông tin người nhận và địa chỉ
    let customerName = '';
    let customerPhone = '';
    let customerEmail = '';
    let recipientName = '';
    let recipientPhone = '';
    let province = '';
    let district = '';
    let ward = '';
    let streetAddress = '';

    if (isMember && !useCustomAddress) {
      const chosen = memberAddresses.find((a) => a.id === selectedAddressId) || memberAddresses[0];
      customerName = user.full_name || chosen.recipient_name;
      customerPhone = user.phone || chosen.recipient_phone;
      customerEmail = user.email || '';
      recipientName = chosen.recipient_name;
      recipientPhone = chosen.recipient_phone;
      province = chosen.province;
      district = chosen.district;
      ward = chosen.ward;
      streetAddress = chosen.street_address;
    } else {
      if (!guestForm.customer_name.trim()) {
        toast.error('Vui lòng nhập họ và tên người đặt hàng!');
        return;
      }
      if (!guestForm.customer_phone.trim()) {
        toast.error('Vui lòng nhập số điện thoại người đặt hàng!');
        return;
      }
      if (!guestForm.street_address.trim()) {
        toast.error('Vui lòng nhập địa chỉ giao hàng cụ thể!');
        return;
      }
      customerName = guestForm.customer_name;
      customerPhone = guestForm.customer_phone;
      customerEmail = guestForm.customer_email;
      recipientName = guestForm.recipient_name || guestForm.customer_name;
      recipientPhone = guestForm.recipient_phone || guestForm.customer_phone;
      province = guestForm.province;
      district = guestForm.district;
      ward = guestForm.ward;
      streetAddress = guestForm.street_address;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. orders: Thông tin chung
      // 2. order_customers: Người đặt
      // 3. order_shipping_addresses: Địa chỉ
      // 4. order_amounts: Tiền, voucher, điểm, phí ship
      // 5. order_items: Danh sách món
      // 6. payments: Thanh toán
      const createdOrder = createOrderInStore({
        items: itemsToCheckout,
        address: {
          receiver_name: recipientName,
          phone: recipientPhone,
          province,
          district,
          ward,
          street: streetAddress,
        },
        paymentMethod,
        coupon: appliedVoucher,
        pointsUsed: isMember ? pointsToUse : 0, // Trigger chặn guest dùng điểm
        subtotal,
        shippingFee,
        couponDiscount: voucherDiscount,
        pointsDiscount,
        total: totalAmount,
      });

      // Trừ điểm thưởng của thành viên nếu có dùng
      if (isMember && pointsToUse > 0) {
        const updatedUser = {
          ...user,
          loyalty_points: Math.max(0, (user.loyalty_points || 0) - pointsToUse),
        };
        localStorage.setItem('shop_auth_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      // Xóa giỏ hàng nếu là đặt giỏ thường
      if (!isBuyNow) {
        clearCartStore();
      } else {
        sessionStorage.removeItem('aether_buy_now_item');
      }

      setIsSubmitting(false);
      toast.success(`Đặt hàng thành công! Mã đơn: ${createdOrder.code}`, {
        duration: 5000,
        style: {
          background: '#080808',
          color: '#fafafa',
          border: '1px solid #27272a',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
        },
      });

      navigate(`/orders?code=${createdOrder.code}&phone=${encodeURIComponent(customerPhone)}`);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#fafafa] font-inter selection:bg-[#fafafa] selection:text-[#080808] pb-24">
      
      {/* Top Navbar */}
      <AetherNavbar
        categories={MOCK_CATEGORIES}
        cartCount={cartItemsStore.length}
        onOpenCart={() => {}}
        onOpenSearch={() => {}}
        onScrollToSection={() => {}}
      />

      {/* Header Bar */}
      <div className="pt-14 border-b border-zinc-800 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase block">
              TRANSACTION CHECKOUT // 6-TABLE POSTGRESQL SCHEMA
            </span>
            <h1 className="font-inter font-black text-2xl sm:text-3xl text-white tracking-tight mt-1">
              {isBuyNow ? 'Mua Ngay (Buy Now)' : 'Thanh Toán Đơn Hàng'}
            </h1>
          </div>

          <div className="font-mono text-xs text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MÃ HÓA GIAO DỊCH 256-BIT</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Cột Swiss Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ===================================================================
              CỘT TRÁI (7 COLS): THÔNG TIN NGƯỜI ĐẶT, ĐỊA CHỈ & PHƯƠNG THỨC TT
          ==================================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. KHÁCH HÀNG & ĐỊA CHỈ NHẬN (order_customers & order_shipping_addresses) */}
            <div className="border border-zinc-800 bg-[#080808]">
              <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span className="font-bold text-white uppercase">
                    01 // THÔNG TIN NGƯỜI ĐẶT & ĐỊA CHỈ GIAO HÀNG
                  </span>
                </div>
                
                {isMember ? (
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> THÀNH VIÊN ({user.phone})
                  </span>
                ) : (
                  <span className="text-zinc-500 font-mono text-[10px]">
                    KHÁCH VÃNG LAI (GUEST)
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                
                {/* Nếu là thành viên: Cho chọn từ Sổ Địa Chỉ customer_addresses */}
                {isMember && !useCustomAddress ? (
                  <div className="space-y-3 font-mono text-xs">
                    <span className="text-zinc-400 uppercase tracking-widest text-[10px] block">
                      CHỌN TỪ SỔ ĐỊA CHỈ CỦA BẠN (customer_addresses):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {memberAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 border transition-all cursor-pointer space-y-1.5 ${
                              isSelected
                                ? 'border-white bg-zinc-950 shadow-md ring-1 ring-white/30'
                                : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white uppercase flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-zinc-400" />
                                {addr.label}
                              </span>
                              {addr.is_default && (
                                <span className="text-[9px] px-1.5 py-0.5 border border-amber-500/50 text-amber-300">
                                  MẶC ĐỊNH
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-200 font-bold">{addr.recipient_name} - {addr.recipient_phone}</div>
                            <div className="text-zinc-500 text-[11px] leading-relaxed">
                              {addr.street_address}, {addr.ward}, {addr.district}, {addr.province}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setUseCustomAddress(true)}
                      className="text-zinc-400 hover:text-white underline text-[11px] pt-1 block"
                    >
                      + Nhập địa chỉ nhận hàng khác cho đơn này
                    </button>
                  </div>
                ) : (
                  /* Form nhập tay cho Khách vãng lai hoặc Địa chỉ mới */
                  <div className="space-y-4 font-mono text-xs">
                    {isMember && (
                      <button
                        onClick={() => setUseCustomAddress(false)}
                        className="text-zinc-400 hover:text-white underline text-[11px] block"
                      >
                        ← Quay lại chọn từ sổ địa chỉ đã lưu
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[10px] uppercase">
                          HỌ VÀ TÊN NGƯỜI ĐẶT (*)
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn Khách"
                          value={guestForm.customer_name}
                          onChange={(e) =>
                            setGuestForm({
                              ...guestForm,
                              customer_name: e.target.value,
                              recipient_name: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[10px] uppercase">
                          SỐ ĐIỆN THOẠI (*)
                        </label>
                        <input
                          type="tel"
                          placeholder="0912345678"
                          value={guestForm.customer_phone}
                          onChange={(e) =>
                            setGuestForm({
                              ...guestForm,
                              customer_phone: e.target.value,
                              recipient_phone: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px] uppercase">
                        EMAIL (ĐỂ NHẬN HÓA ĐƠN & THEO DÕI ĐƠN)
                      </label>
                      <input
                        type="email"
                        placeholder="khachhang@example.com"
                        value={guestForm.customer_email}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, customer_email: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[10px] uppercase">TỈNH / TP</label>
                        <input
                          type="text"
                          value={guestForm.province}
                          onChange={(e) => setGuestForm({ ...guestForm, province: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[10px] uppercase">QUẬN / HUYỆN</label>
                        <input
                          type="text"
                          value={guestForm.district}
                          onChange={(e) => setGuestForm({ ...guestForm, district: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 text-[10px] uppercase">PHƯỜNG / XÃ</label>
                        <input
                          type="text"
                          value={guestForm.ward}
                          onChange={(e) => setGuestForm({ ...guestForm, ward: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px] uppercase">
                        ĐỊA CHỈ NHẬN HÀNG CỤ THỂ (*)
                      </label>
                      <input
                        type="text"
                        placeholder="Số nhà, tên tòa nhà, tên đường..."
                        value={guestForm.street_address}
                        onChange={(e) =>
                          setGuestForm({ ...guestForm, street_address: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px] uppercase">
                        GHI CHÚ GIAO HÀNG (note)
                      </label>
                      <input
                        type="text"
                        placeholder="Giao hàng trong giờ hành chính, gọi điện trước khi đến..."
                        value={guestForm.note}
                        onChange={(e) => setGuestForm({ ...guestForm, note: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 2. PHƯƠNG THỨC THANH TOÁN (payment_method: cod | bank_qr) */}
            <div className="border border-zinc-800 bg-[#080808]">
              <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span className="font-bold text-white uppercase">
                    02 // PHƯƠNG THỨC THANH TOÁN (payment_method)
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4 font-mono text-xs">
                
                {/* Tùy chọn 1: COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-white bg-zinc-950 ring-1 ring-white/30'
                      : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>THANH TOÁN KHI NHẬN HÀNG (COD)</span>
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      Thanh toán tiền mặt cho nhân viên giao hàng khi nhận và kiểm tra hàng.
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                    {paymentMethod === 'cod' && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </div>

                {/* Tùy chọn 2: BANK QR */}
                <div
                  onClick={() => setPaymentMethod('bank_qr')}
                  className={`p-4 border transition-all cursor-pointer space-y-3 ${
                    paymentMethod === 'bank_qr'
                      ? 'border-white bg-zinc-950 ring-1 ring-white/30'
                      : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>CHUYỂN KHOẢN NGÂN HÀNG VIETQR (BANK_QR)</span>
                      </div>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">
                        Quét mã QR qua app ngân hàng bất kỳ để thanh toán tự động không cần nhập thông tin.
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'bank_qr' ? 'border-white bg-white text-black' : 'border-zinc-700'}`}>
                      {paymentMethod === 'bank_qr' && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>

                  {/* Hiển thị Mã QR chuyển khoản từ payments.qr_content */}
                  {paymentMethod === 'bank_qr' && (
                    <div className="p-4 border border-zinc-800 bg-black flex flex-col sm:flex-row items-center gap-5 mt-2">
                      <div className="w-36 h-36 border border-zinc-700 bg-white p-2 shrink-0 flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AETHER_PAY_${totalAmount}_${sampleOrderCode}`}
                          alt="VietQR Chuyển Khoản"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1.5 text-[11px] flex-1">
                        <div className="text-zinc-400">NGÂN HÀNG: <strong className="text-white">VIETCOMBANK (VCB)</strong></div>
                        <div className="text-zinc-400">SỐ TÀI KHOẢN: <strong className="text-amber-300 text-sm">9988776655</strong></div>
                        <div className="text-zinc-400">CHỦ TÀI KHOẢN: <strong className="text-white">AETHER LABS CORP</strong></div>
                        <div className="text-zinc-400">NỘI DUNG: <strong className="text-emerald-400">AETHER {sampleOrderCode}</strong></div>
                        <div className="text-zinc-400">SỐ TIỀN: <strong className="text-white font-bold">{formatVND(totalAmount)}</strong></div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>

          {/* ===================================================================
              CỘT PHẢI (5 COLS): ĐƠN HÀNG, VOUCHER, ĐIỂM LOYALTY & TỔNG TIỀN
          ==================================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tóm tắt mặt hàng trong đơn (order_items) */}
            <div className="border border-zinc-800 bg-[#080808]">
              <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 font-mono text-xs font-bold text-white uppercase flex justify-between">
                <span>03 // MẶT HÀNG ĐẶT MUA ({itemsToCheckout.length})</span>
                {isBuyNow && <span className="text-amber-400">[ MUA NGAY ]</span>}
              </div>

              <div className="p-4 divide-y divide-zinc-900 max-h-72 overflow-y-auto space-y-3 font-mono">
                {itemsToCheckout.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex gap-3 text-xs">
                    <div className="w-14 h-16 border border-zinc-800 bg-zinc-950 shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-zinc-500">{item.sku || 'SKU'}</div>
                        <div className="font-bold text-white line-clamp-1">{item.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          SIZE: {item.size} // MÀU: {item.color}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1">
                        <span className="text-zinc-400">x{item.quantity}</span>
                        <span className="font-bold text-white">
                          {formatVND((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Khối Voucher & Loyalty (order_amounts & Trigger DB) */}
            <div className="border border-zinc-800 bg-[#080808] p-5 space-y-4 font-mono text-xs">
              
              {/* Ô nhập mã Voucher */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">
                  MÃ KHUYẾN MÃI (vouchers.code):
                </span>

                {appliedVoucher ? (
                  <div className="p-3 border border-emerald-500/50 bg-emerald-950/20 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-400">[{appliedVoucher.code}] ĐÃ ÁP DỤNG</div>
                      <div className="text-[10px] text-zinc-400">
                        {appliedVoucher.discount_type === 'percent'
                          ? `Giảm ${appliedVoucher.discount_value}% (Tối đa ${formatVND(appliedVoucher.max_discount_amount || 0)})`
                          : `Giảm ${formatVND(appliedVoucher.discount_value)}`}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-zinc-400 hover:text-white underline text-[10px]"
                    >
                      XÓA
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyVoucher} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="WELCOME10, FREESHIP, AETHER50..."
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 p-2 text-white text-xs uppercase placeholder:text-zinc-700 focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-white text-black font-bold tracking-wider uppercase hover:bg-zinc-200 transition-colors"
                    >
                      ÁP DỤNG
                    </button>
                  </form>
                )}
              </div>

              {/* Thanh trượt dùng điểm thưởng Loyalty (CHỈ CHO PHÉP THÀNH VIÊN) */}
              <div className="border-t border-zinc-900 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                    ĐIỂM THƯỞNG (loyalty_points):
                  </span>

                  {isMember ? (
                    <span className="text-amber-300 font-bold">
                      CÓ {user.loyalty_points || 0} ĐIỂM
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[10px]">KHÔNG KHẢ DỤNG</span>
                  )}
                </div>

                {!isMember ? (
                  /* Trigger CSDL chặn khách vãng lai dùng điểm */
                  <div className="p-2.5 border border-zinc-800 bg-zinc-950 text-zinc-500 text-[10px] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span>
                      Trigger DB chặn khách vãng lai dùng điểm. Vui lòng{' '}
                      <Link to="/login" className="text-white underline">
                        đăng nhập
                      </Link>{' '}
                      để tích lũy & đổi điểm.
                    </span>
                  </div>
                ) : (
                  /* Giao diện chọn điểm cho thành viên */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">DÙNG: {pointsToUse} ĐIỂM</span>
                      <span className="text-emerald-400">-{formatVND(pointsDiscount)}</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={maxPointsCanUse}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(Number(e.target.value))}
                      disabled={maxPointsCanUse <= 0}
                      className="w-full accent-amber-400 cursor-pointer"
                    />

                    <div className="flex justify-between text-[9px] text-zinc-600">
                      <span>0 ĐIỂM</span>
                      <span>1 ĐIỂM = 1.000₫ (loyalty.point_value_vnd)</span>
                      <span>MAX: {maxPointsCanUse}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bảng Chi Tiết Tính Toán Tiền Khớp CHECK Constraint */}
              <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>TIỀN HÀNG (subtotal)</span>
                  <span className="text-white">{formatVND(subtotal)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>GIẢM GIÁ VOUCHER (voucher_discount)</span>
                  <span className="text-emerald-400">-{formatVND(voucherDiscount)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>GIẢM GIÁ ĐIỂM (points_discount)</span>
                  <span className="text-emerald-400">-{formatVND(pointsDiscount)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>PHÍ VẬN CHUYỂN (shipping_fee)</span>
                  <span className="text-white">
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-400">MIỄN PHÍ</strong>
                    ) : (
                      formatVND(shippingFee)
                    )}
                  </span>
                </div>

                {/* Công thức DB CHECK constraint */}
                <div className="p-2 border border-zinc-900 bg-zinc-950 text-[9px] text-zinc-500">
                  RÀNG BUỘC CSDL: total_amount = subtotal ({formatVND(subtotal)}) + shipping_fee ({formatVND(shippingFee)}) - voucher_discount ({formatVND(voucherDiscount)}) - points_discount ({formatVND(pointsDiscount)})
                </div>

                {/* Tổng Tiền Phải Thanh Toán */}
                <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-white uppercase text-sm">TỔNG THANH TOÁN</span>
                  <span className="text-2xl font-black text-white font-mono">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Nút Xác Nhận Đặt Hàng */}
              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting || itemsToCheckout.length === 0}
                className="w-full py-4 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl active:translate-y-0.5 disabled:opacity-50 mt-4"
              >
                <span>{isSubmitting ? 'ĐANG KHỞI TẠO ĐƠN...' : 'XÁC NHẬN ĐẶT HÀNG // CONFIRM'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center font-mono text-[9px] text-zinc-600">
                GIAO DỊCH GHI NHẬN 6 BẢNG DỮ LIỆU ĐỒNG THỜI
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
