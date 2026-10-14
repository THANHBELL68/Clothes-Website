import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Tag, Award, ShoppingBag, ShieldAlert } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    updateQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    pointsUsed,
    setPointsUsed,
    getSubtotal,
    getShippingFee,
    getCouponDiscount,
    getPointsDiscount,
    getTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [pointsInput, setPointsInput] = useState(pointsUsed || 0);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const couponDiscount = getCouponDiscount();
  const pointsDiscount = getPointsDiscount();
  const total = getTotal();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (res.success) {
      toast.success(res.message);
      setCouponCode('');
    } else {
      toast.error(res.message);
    }
  };

  const handleApplyPoints = (e) => {
    e.preventDefault();
    if (!user) return;
    const maxAllowed = Math.min(user.loyalty_points, Math.floor(subtotal / 1000));
    const val = Math.min(Math.max(0, Number(pointsInput)), maxAllowed);
    setPointsUsed(val);
    setPointsInput(val);
    toast.success(`Đã áp dụng ${val} điểm loyalty (-${(val * 1000).toLocaleString('vi-VN')}₫)!`);
  };

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error('CSDL quy định: Khách hàng phải đăng nhập mới được đặt hàng (Không có Guest Checkout)!', {
        duration: 4000,
        icon: '🔒',
      });
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-neutral-500">
          Hãy khám phá các mẫu áo kiểu nữ Rayon và thời trang nam mới nhất của chúng tôi.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 transition-colors"
        >
          Mua sắm ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Giỏ Hàng Mua Sắm</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: List Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs divide-y divide-neutral-100">
            {items.map((item) => (
              <div key={item.variant_id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                
                {/* Product Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-26 sm:w-24 sm:h-32 object-cover object-top rounded-xl bg-neutral-100 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base truncate">
                    {item.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mt-1">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md font-medium">Màu: {item.color}</span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md font-medium">Size: {item.size}</span>
                  </div>

                  <p className="font-black text-neutral-900 text-base mt-2">
                    {item.price.toLocaleString('vi-VN')}₫
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white text-xs font-bold">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-600"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 min-w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-600"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Line Total */}
                <div className="text-right hidden sm:block shrink-0">
                  <span className="font-black text-neutral-900 text-base">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Quick return policy note */}
          <div className="p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 flex items-center gap-2">
            <span>💡 Bạn có thể kiểm tra hàng trước khi thanh toán và đổi size trong 7 ngày sau khi nhận đồ.</span>
          </div>

        </div>

        {/* Right Column: Order Summary & Constraints */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
            <h3 className="font-bold text-neutral-900 text-lg">Tóm Tắt Đơn Hàng</h3>

            {/* Form Mã Giảm Giá (bảng coupons) */}
            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-amber-600" /> Mã Giảm Giá / Voucher
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-900">{coupon.code}</span>
                    <p className="text-[11px] text-amber-700">{coupon.name}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-rose-600 font-bold hover:underline">
                    Gỡ bỏ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: WELCOME10, FREESHIP"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-neutral-100 border border-transparent rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:bg-white focus:border-neutral-300"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Áp dụng
                  </button>
                </form>
              )}
            </div>

            {/* Điểm Tích Lũy Loyalty (bảng loyalty_transactions) */}
            {user ? (
              <div className="border-t border-neutral-100 pt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <label className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Dùng Điểm Thưởng (Bạn có {user.loyalty_points} điểm)
                  </label>
                  <span className="text-neutral-400">1 điểm = 1.000₫</span>
                </div>

                <form onSubmit={handleApplyPoints} className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={user.loyalty_points}
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    className="flex-1 bg-neutral-100 border border-transparent rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:bg-white focus:border-neutral-300"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Dùng điểm
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Đăng nhập tài khoản khách hàng để tích điểm loyalty và thanh toán đơn hàng.
                </span>
              </div>
            )}

            {/* Breakdown chi phí */}
            <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Tiền hàng (Tạm tính)</span>
                <span className="font-bold text-neutral-900">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>

              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-bold text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
                  ) : (
                    `${shippingFee.toLocaleString('vi-VN')}₫`
                  )}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Voucher giảm giá</span>
                  <span>-{couponDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Điểm loyalty ({pointsUsed} điểm)</span>
                  <span>-{pointsDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="font-extrabold text-neutral-900 text-sm">Tổng thanh toán:</span>
                <span className="font-black text-neutral-900 text-2xl text-amber-600">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Nút Thanh Toán */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-neutral-900/20 transition-all"
            >
              Tiến Hành Đặt Hàng <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

