import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, QrCode, CheckCircle2, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, addresses, addAddress } = useAuthStore();
  const {
    items,
    coupon,
    pointsUsed,
    getSubtotal,
    getShippingFee,
    getCouponDiscount,
    getPointsDiscount,
    getTotal,
    clearCart,
  } = useCartStore();
  const createOrder = useOrderStore((state) => state.createOrder);

  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.is_default)?.id || addresses[0]?.id
  );
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bank_qr'
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  // Form địa chỉ mới
  const [newAddr, setNewAddr] = useState({
    receiver_name: user?.full_name || '',
    phone: user?.phone || '',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    street: '',
    is_default: false,
  });

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const couponDiscount = getCouponDiscount();
  const pointsDiscount = getPointsDiscount();
  const total = getTotal();

  const handleCreateNewAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street.trim()) {
      toast.error('Vui lòng nhập số nhà, tên đường!');
      return;
    }
    addAddress(newAddr);
    setShowNewAddressModal(false);
    toast.success('Đã thêm địa chỉ giao hàng mới!');
  };

  const handlePlaceOrder = () => {
    const chosenAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!chosenAddress) {
      toast.error('Vui lòng chọn địa chỉ nhận hàng!');
      return;
    }

    if (items.length === 0) {
      toast.error('Giỏ hàng trống!');
      navigate('/cart');
      return;
    }

    // Tạo đơn hàng mới theo flow DB (status: 'new')
    const order = createOrder({
      items,
      address: chosenAddress,
      paymentMethod,
      coupon,
      pointsUsed,
      subtotal,
      shippingFee,
      couponDiscount,
      pointsDiscount,
      total,
    });

    // Làm sạch giỏ hàng
    clearCart();

    toast.success(`Đặt hàng thành công! Mã đơn: ${order.code}`, { duration: 5000 });
    navigate('/orders');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-neutral-200/80 pb-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Thanh Toán Đơn Hàng</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Khách hàng: <strong className="text-neutral-900">{user?.full_name}</strong> ({user?.email})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Địa chỉ giao hàng (bảng addresses) */}
          <div className="bg-white/95 liquid-glass p-6 rounded-sm border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-amber-600" /> 1. Địa Chỉ Nhận Hàng
              </h3>
              <button
                onClick={() => setShowNewAddressModal(true)}
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`block p-4 rounded-sm border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-neutral-900 bg-white/90 shadow-md'
                      : 'border-neutral-200 bg-white/50 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shipping_address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 accent-neutral-900"
                    />
                    <div className="text-xs space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-neutral-900 text-sm">{addr.receiver_name}</strong>
                        <span className="text-neutral-500">({addr.phone})</span>
                        {addr.is_default && (
                          <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600 leading-relaxed">
                        {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Phương thức thanh toán (bảng payments: 'cod' | 'bank_qr') */}
          <div className="bg-white/95 liquid-glass p-6 rounded-sm border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-amber-600" /> 2. Phương Thức Thanh Toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* COD */}
              <label
                className={`p-4 rounded-sm border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-neutral-900 bg-white/90 shadow-md'
                    : 'border-neutral-200 bg-white/50 hover:border-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-neutral-900"
                />
                <div className="text-xs space-y-1">
                  <strong className="text-neutral-900 text-sm block">Thanh toán khi nhận hàng (COD)</strong>
                  <p className="text-neutral-500">Kiểm tra trang phục trước khi thanh toán tiền mặt cho shipper.</p>
                </div>
              </label>

              {/* VietQR */}
              <label
                className={`p-4 rounded-sm border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'bank_qr'
                    ? 'border-neutral-900 bg-white/90 shadow-md'
                    : 'border-neutral-200 bg-white/50 hover:border-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="bank_qr"
                  checked={paymentMethod === 'bank_qr'}
                  onChange={() => setPaymentMethod('bank_qr')}
                  className="mt-1 accent-neutral-900"
                />
                <div className="text-xs space-y-1">
                  <strong className="text-neutral-900 text-sm flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-600" /> Chuyển khoản VietQR
                  </strong>
                  <p className="text-neutral-500">Quét mã QR qua app ngân hàng hoặc MoMo, xác nhận tức thì.</p>
                </div>
              </label>

            </div>

            {/* QR Mock nếu chọn chuyển khoản */}
            {paymentMethod === 'bank_qr' && (
              <div className="p-4 bg-neutral-900 text-white rounded-sm border border-neutral-800 text-center space-y-3">
                <p className="text-xs font-bold text-amber-400">Mã QR Thanh Toán Tự Động:</p>
                <div className="w-40 h-40 bg-white p-2 rounded-xs border mx-auto shadow-md flex items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CLOTHES-SHOP-DEMO-PAYMENT"
                    alt="VietQR Demo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-neutral-300 font-mono">
                  Ngân hàng: MB Bank • STK: 99998888 • Tên: SHOP CLOTHES VN
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/95 liquid-glass p-6 rounded-sm border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-black text-neutral-900 text-base uppercase tracking-wider">Đơn Hàng ({items.length} món)</h3>

            {/* Danh sách tóm tắt */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-2">
              {items.map((item) => (
                <div key={item.variant_id} className="py-2.5 flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-16 object-cover rounded-xs bg-neutral-100 shrink-0 border" />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                    <p className="text-neutral-400 mt-0.5">Size {item.size} • {item.color} • x{item.quantity}</p>
                  </div>
                  <span className="font-bold text-neutral-900 text-xs shrink-0">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="border-t border-neutral-200/60 pt-4 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-bold text-neutral-900">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">MIỄN PHÍ</strong> : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Voucher giảm giá</span>
                  <span>-{couponDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Điểm loyalty</span>
                  <span>-{pointsDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="font-black text-neutral-900 text-sm uppercase">Tổng cộng:</span>
                <span className="font-black text-2xl text-amber-600">{total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-3.5 liquid-glass-btn-accent text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
            >
              <CheckCircle2 className="w-4 h-4" /> Hoàn Tất Đặt Hàng
            </button>
          </div>
        </div>

      </div>

      {/* Modal Thêm Địa Chỉ Mới góc cạnh Liquid Glass */}
      {showNewAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white liquid-glass rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-300">
            <h3 className="font-bold text-neutral-900 text-base">Thêm Địa Chỉ Nhận Hàng Mới</h3>
            
            <form onSubmit={handleCreateNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Tên người nhận:</label>
                <input
                  type="text"
                  required
                  value={newAddr.receiver_name}
                  onChange={(e) => setNewAddr({ ...newAddr, receiver_name: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tỉnh / Thành:</label>
                  <input
                    type="text"
                    required
                    value={newAddr.province}
                    onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                    className="w-full bg-white rounded-sm p-2.5 font-medium border"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Quận / Huyện:</label>
                  <input
                    type="text"
                    required
                    value={newAddr.district}
                    onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                    className="w-full bg-white rounded-sm p-2.5 font-medium border"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Phường / Xã:</label>
                <input
                  type="text"
                  required
                  value={newAddr.ward}
                  onChange={(e) => setNewAddr({ ...newAddr, ward: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Số nhà, tên đường:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Số 12 ngõ 45 phố Duy Tân"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(false)}
                  className="flex-1 py-2.5 rounded-sm border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 liquid-glass-btn-accent text-white font-bold text-xs uppercase tracking-wider"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
