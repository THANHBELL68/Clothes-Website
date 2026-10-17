import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Tag, Award, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items: rawItems,
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

  const items = Array.isArray(rawItems) ? rawItems : [];

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
      toast.success(res.message, {
        style: {
          background: '#080808',
          color: '#fafafa',
          border: '1px solid #27272a',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
        },
      });
      setCouponCode('');
    } else {
      toast.error(res.message);
    }
  };

  const handleApplyPoints = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng điểm loyalty!');
      return;
    }
    const maxAllowed = Math.min(user.loyalty_points || 0, Math.floor(subtotal / 1000));
    const val = Math.min(Math.max(0, Number(pointsInput)), maxAllowed);
    setPointsUsed(val);
    setPointsInput(val);
    toast.success(`Đã áp dụng ${val} điểm loyalty (-${(val * 1000).toLocaleString('vi-VN')}₫)!`, {
      style: {
        background: '#080808',
        color: '#fafafa',
        border: '1px solid #27272a',
        fontFamily: 'JetBrains Mono',
        fontSize: '11px',
      },
    });
  };

  const freeShippingThreshold = 500000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              BAG // 01
            </span>
          </div>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
            GIỎ HÀNG THỜI TRANG
          </h1>
        </div>

        <span className="font-mono text-xs text-zinc-400">
          TỔNG CỘNG: <strong className="text-white">{items.length} MÓN HÀNG</strong>
        </span>
      </div>

      {items.length === 0 ? (
        /* Empty Cart */
        <div className="text-center py-24 max-w-lg mx-auto p-8 border border-zinc-800 bg-[#0c0c0c] space-y-4 font-mono">
          <div className="w-16 h-16 border border-zinc-800 bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
            <ShoppingBag className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="font-inter font-bold text-lg text-white tracking-tight uppercase">
            GIỎ HÀNG ĐANG TRỐNG
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Bạn chưa chọn sản phẩm nào vào giỏ. Hãy khám phá bộ sưu tập Streetwear & Techwear của Aether Labs!
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold uppercase tracking-widest transition-all"
            >
              <span>KHÁM PHÁ CATALOG</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Grid 2 Cột: Items List + Order Summary */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột Trái: Danh Sách Món Hàng (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Shipping Progress */}
            <div className="p-4 bg-[#0c0c0c] border border-zinc-800 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400">
                  {subtotal >= freeShippingThreshold ? (
                    <strong className="text-emerald-400 font-bold">✓ BẠN ĐÃ ĐẠT ĐIỀU KIỆN MIỄN PHÍ VẬN CHUYỂN!</strong>
                  ) : (
                    <>Mua thêm <strong className="text-white font-bold">{(freeShippingThreshold - subtotal).toLocaleString('vi-VN')}₫</strong> để được FREESHIP</>
                  )}
                </span>
                <span className="text-zinc-500">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Bảng Danh Sách Sản Phẩm */}
            <div className="divide-y divide-zinc-800 border border-zinc-800 bg-[#0c0c0c]">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-24 border border-zinc-800 bg-zinc-950 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                        SKU: {item.sku || `ITEM-0${item.product_id}`}
                      </span>
                      <Link
                        to={`/products/${item.product_id}`}
                        className="font-inter font-bold text-sm text-white hover:text-zinc-300 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>Màu: <strong className="text-zinc-200">{item.color}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-zinc-200">{item.size}</strong></span>
                      </div>
                      <span className="font-bold text-white text-xs block">
                        {item.price?.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>

                  {/* Cụm Số lượng & Tổng tiền */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
                    <div className="flex items-center border border-zinc-800 bg-black">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-9 text-center font-bold text-white text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-bold text-white block">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 border border-zinc-800 hover:border-rose-900 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Xóa món hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Cột Phải: Tóm Tắt Đơn Hàng (1 Col) */}
          <div className="space-y-4">
            <div className="p-5 bg-[#0c0c0c] border border-zinc-800 font-mono text-xs space-y-5">
              <h3 className="font-bold text-white uppercase tracking-widest text-sm border-b border-zinc-800 pb-3">
                TÓM TẮT ĐƠN HÀNG
              </h3>

              {/* Ô Nhập Voucher */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                  MÃ GIẢM GIÁ (VOUCHER):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã: WELCOME10 / FREESHIP"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#161616] border border-zinc-800 p-2 text-white font-bold focus:outline-none focus:border-zinc-500 uppercase text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    ÁP DỤNG
                  </button>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between p-2 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[11px]">
                    <span>✓ Đã dùng: {coupon.code}</span>
                    <button onClick={removeCoupon} className="text-zinc-500 hover:text-white underline">
                      Gỡ
                    </button>
                  </div>
                )}
              </form>

              {/* Ô Điểm Loyalty (Thành viên) */}
              {user && (
                <form onSubmit={handleApplyPoints} className="space-y-2 border-t border-zinc-900 pt-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 uppercase">DÙNG ĐIỂM LOYALTY:</span>
                    <span className="text-amber-300 font-bold">KHẢ DỤNG: {user.loyalty_points || 0} PTS</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={user.loyalty_points || 0}
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="flex-1 bg-[#161616] border border-zinc-800 p-2 text-white font-bold focus:outline-none focus:border-zinc-500 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                    >
                      DÙNG ĐIỂM
                    </button>
                  </div>
                </form>
              )}

              {/* Bảng Chi Phí */}
              <div className="space-y-2 pt-3 border-t border-zinc-800 text-[11px]">
                <div className="flex justify-between text-zinc-400">
                  <span>Tạm tính hàng hóa:</span>
                  <span className="text-white">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Phí vận chuyển:</span>
                  <span className="text-white">
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-400">MIỄN PHÍ</strong>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Giảm giá Voucher:</span>
                    <span>-{couponDiscount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Giảm trừ Loyalty:</span>
                    <span>-{pointsDiscount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-zinc-800 text-sm">
                  <strong className="text-white font-bold uppercase">TỔNG THANH TOÁN:</strong>
                  <strong className="text-xl font-bold text-white font-mono">
                    {total.toLocaleString('vi-VN')}₫
                  </strong>
                </div>
              </div>

              {/* Nút Thanh Toán */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>TIẾN HÀNH ĐẶT HÀNG</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-zinc-500 text-center font-sans">
                Hỗ trợ Khách Thành Viên & Khách Vãng Lai (Guest Checkout).
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
