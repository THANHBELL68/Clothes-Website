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
        <div className="w-20 h-20 bg-neutral-100 rounded-sm flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-neutral-500">
          Hãy khám phá các mẫu áo kiểu nữ Rayon và thời trang mới nhất của chúng tôi.
        </p>
        <Link
          to="/products"
          className="liquid-glass-btn-accent inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-xs uppercase tracking-wider"
        >
          Mua sắm ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200/80 pb-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Giỏ Hàng Mua Sắm</h1>
        <p className="text-xs text-neutral-500 mt-1">Kiểm tra sản phẩm và áp dụng các khuyến mãi từ CSDL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: List Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white/90 liquid-glass rounded-sm border border-neutral-200/80 overflow-hidden shadow-xs divide-y divide-neutral-100">
            {items.map((item) => (
              <div key={item.variant_id} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                
                {/* Product Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-26 sm:w-24 sm:h-32 object-cover object-top rounded-xs bg-neutral-100 shrink-0 border border-neutral-200"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base truncate">
                    {item.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mt-1">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-xs font-semibold text-[11px]">Màu: {item.color}</span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-xs font-semibold text-[11px]">Size: {item.size}</span>
                  </div>

                  <p className="font-black text-neutral-900 text-base mt-2">
                    {item.price.toLocaleString('vi-VN')}₫
                  </p>

                  {/* Quantity Stepper góc cạnh */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-neutral-300 rounded-sm overflow-hidden bg-white text-xs font-bold shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-700"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 min-w-6 text-center font-mono font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-700"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variant_id)}
                      className="liquid-glass-btn text-neutral-500 hover:text-rose-600 transition-colors p-2"
                      title="Xóa khỏi giỏ hàng"
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
          <div className="p-3.5 liquid-glass rounded-sm text-xs text-neutral-600 flex items-center gap-2 border border-neutral-200">
            <span>💡 Khách hàng thành viên có quyền đổi trả trang phục trong vòng 7 ngày sau khi nhận hàng.</span>
          </div>

        </div>

        {/* Right Column: Order Summary & Constraints */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white/95 liquid-glass p-6 rounded-sm border border-neutral-200/80 shadow-md space-y-5">
            <h3 className="font-black text-neutral-900 text-base uppercase tracking-wider">Tóm Tắt Đơn Hàng</h3>

            {/* Form Mã Giảm Giá (bảng coupons) */}
            <div>
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" /> Mã Giảm Giá / Voucher
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-2.5 liquid-glass border border-amber-300 rounded-sm text-xs">
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
                    placeholder="VD: WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 liquid-glass-btn-dark text-white rounded-sm text-xs font-bold"
                  >
                    Áp dụng
                  </button>
                </form>
              )}
            </div>

            {/* Điểm Tích Lũy Loyalty (bảng loyalty_transactions) */}
            {user ? (
              <div className="border-t border-neutral-200/60 pt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Dùng Điểm Loyalty ({user.loyalty_points} điểm)
                  </label>
                  <span className="text-[11px] text-neutral-400">1đ = 1.000₫</span>
                </div>

                <form onSubmit={handleApplyPoints} className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={user.loyalty_points}
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    className="flex-1 bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs font-bold focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 liquid-glass-btn text-neutral-800 rounded-sm text-xs font-bold"
                  >
                    Dùng điểm
                  </button>
                </form>
              </div>
            ) : (
              <div className="liquid-glass p-3 rounded-sm border border-amber-300/60 text-[11px] text-amber-950 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Đăng nhập tài khoản khách hàng để tích điểm loyalty và thanh toán đơn hàng.
                </span>
              </div>
            )}

            {/* Breakdown chi phí */}
            <div className="border-t border-neutral-200/60 pt-4 space-y-2.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Tiền hàng (Tạm tính)</span>
                <span className="font-bold text-neutral-900">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>

              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-bold text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">MIỄN PHÍ (≥500k)</span>
                  ) : (
                    `${shippingFee.toLocaleString('vi-VN')}₫`
                  )}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Voucher giảm giá</span>
                  <span>-{couponDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Điểm loyalty ({pointsUsed} điểm)</span>
                  <span>-{pointsDiscount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="font-black text-neutral-900 text-sm uppercase">Tổng thanh toán:</span>
                <span className="font-black text-neutral-900 text-2xl text-amber-600">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Nút Thanh Toán góc cạnh Liquid Glass */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 liquid-glass-btn-accent text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
            >
              Tiến Hành Đặt Hàng <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
