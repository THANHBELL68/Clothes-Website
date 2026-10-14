import React, { useState } from 'react';
import { Package, Clock, XCircle, RotateCcw, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { orders, cancelOrder, submitReturnRequest, submitReview } = useOrderStore();

  const [returnModal, setReturnModal] = useState({ open: false, order: null });
  const [returnForm, setReturnForm] = useState({
    type: 'exchange', // 'exchange' | 'return'
    reason: 'wrong_size',
    description: '',
    exchangeVariantId: '',
  });

  const [reviewModal, setReviewModal] = useState({ open: false, order: null, item: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const handleCancel = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      const res = cancelOrder(orderId, 'Khách hàng yêu cầu hủy trên web');
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnModal.order) return;
    const res = submitReturnRequest(returnModal.order.id, returnForm);
    if (res.success) {
      toast.success(res.message, { duration: 4000 });
      setReturnModal({ open: false, order: null });
      setReturnForm({ type: 'exchange', reason: 'wrong_size', description: '', exchangeVariantId: '' });
    } else {
      toast.error(res.message);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewModal.order || !reviewModal.item) return;
    const res = submitReview(reviewModal.order.id, reviewModal.item.id, reviewForm);
    if (res.success) {
      toast.success(res.message);
      setReviewModal({ open: false, order: null, item: null });
      setReviewForm({ rating: 5, comment: '' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase">Mới tạo (Chờ xử lý)</span>;
      case 'processing':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase">Đang xử lý</span>;
      case 'packing':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase">Đang đóng gói kho</span>;
      case 'shipping':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase">Đang giao hàng</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Giao thành công</span>;
      case 'cancelled':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-neutral-200/80 pb-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Đơn Hàng Của Tôi</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Theo dõi trạng thái giao dịch và thực hiện quyền đổi trả theo quy định CSDL
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white/70 liquid-glass rounded-sm border border-neutral-200 text-neutral-500 text-xs">
          Bạn chưa có đơn hàng nào trong hệ thống.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = order.status === 'new' || order.status === 'processing';
            const isCompleted = order.status === 'completed';

            return (
              <div key={order.id} className="bg-white/95 liquid-glass rounded-sm border border-neutral-200/80 shadow-xs overflow-hidden">
                
                {/* Header đơn hàng */}
                <div className="bg-neutral-50/70 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-neutral-900">{order.code}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Đặt ngày: {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-500">Tổng thanh toán: </span>
                    <strong className="text-base text-amber-600 font-black">{order.total.toLocaleString('vi-VN')}₫</strong>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                <div className="p-4 sm:p-6 divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-14 h-18 object-cover rounded-xs bg-neutral-100 shrink-0 border" />
                        <div className="text-xs space-y-0.5">
                          <h4 className="font-bold text-neutral-900">{item.product_name}</h4>
                          <p className="text-neutral-500">Phân loại: {item.color} • Size {item.size}</p>
                          <p className="text-neutral-400">Số lượng: x{item.quantity} • Đơn giá: {item.unit_price.toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>

                      {/* Nút đánh giá nếu đơn completed */}
                      {isCompleted && (
                        <div>
                          {item.is_reviewed ? (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xs">
                              Đã đánh giá ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => setReviewModal({ open: true, order, item })}
                              className="liquid-glass-btn px-3 py-1.5 text-xs font-bold text-neutral-800 flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500" /> Đánh giá
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer đơn hàng: Nút Hủy đơn & Đổi trả theo trigger DB */}
                <div className="bg-neutral-50/50 p-4 sm:px-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-neutral-500">
                    Giao tới: <strong>{order.receiver_name}</strong> - {order.shipping_address}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Nút hủy đơn (Chỉ cho phép khi đơn còn 'new' hoặc 'processing') */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="px-3.5 py-1.5 rounded-sm border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {/* Nút Đổi/Trả hàng (Chỉ cho phép khi 'completed' trong 7 ngày) */}
                    {isCompleted && !order.return_request && (
                      <button
                        onClick={() => setReturnModal({ open: true, order })}
                        className="liquid-glass-btn-accent px-4 py-2 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Yêu cầu Đổi / Trả hàng
                      </button>
                    )}

                    {order.return_request && (
                      <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xs font-bold uppercase text-[11px]">
                        Đã gửi yêu cầu đổi trả ({order.return_request.status})
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Yêu Cầu Đổi / Trả Hàng (bảng return_requests) */}
      {returnModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white liquid-glass rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-300">
            <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" /> Yêu Cầu Đổi / Trả Hàng (7 Ngày)
            </h3>
            <p className="text-xs text-neutral-500">
              Mã đơn: <strong>{returnModal.order?.code}</strong>. CSKH sẽ duyệt yêu cầu trong vòng 24h.
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Loại yêu cầu:</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-sm border text-center font-bold cursor-pointer ${returnForm.type === 'exchange' ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200'}`}>
                    <input
                      type="radio"
                      name="return_type"
                      checked={returnForm.type === 'exchange'}
                      onChange={() => setReturnForm({ ...returnForm, type: 'exchange' })}
                      className="hidden"
                    />
                    Đổi size / mẫu khác
                  </label>
                  <label className={`p-2.5 rounded-sm border text-center font-bold cursor-pointer ${returnForm.type === 'return' ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200'}`}>
                    <input
                      type="radio"
                      name="return_type"
                      checked={returnForm.type === 'return'}
                      onChange={() => setReturnForm({ ...returnForm, type: 'return' })}
                      className="hidden"
                    />
                    Trả hàng hoàn tiền
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Lý do đổi trả:</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                >
                  <option value="wrong_size">Mặc không vừa (Rộng/Chật size)</option>
                  <option value="defective">Sản phẩm có lỗi chỉ may / cúc áo</option>
                  <option value="changed_mind">Muốn đổi màu sắc khác</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Mô tả chi tiết:</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Ghi rõ tình trạng sản phẩm và yêu cầu của bạn..."
                  value={returnForm.description}
                  onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModal({ open: false, order: null })}
                  className="flex-1 py-2.5 rounded-sm border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 liquid-glass-btn-accent text-white font-bold uppercase tracking-wider"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đánh Giá Sản Phẩm (bảng reviews) */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white liquid-glass rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-300">
            <h3 className="font-bold text-neutral-900 text-base flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-current" /> Đánh Giá Sản Phẩm
            </h3>
            <p className="text-xs text-neutral-500">
              Sản phẩm: <strong>{reviewModal.item?.product_name}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-700">Chất lượng:</span>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-current text-amber-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Cảm nhận của bạn về phom dáng, chất vải:</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Áo mặc rất mát, tôn dáng công sở, giao hàng nhanh..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-white rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, order: null, item: null })}
                  className="flex-1 py-2.5 rounded-sm border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 liquid-glass-btn-accent text-white font-bold uppercase tracking-wider"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
