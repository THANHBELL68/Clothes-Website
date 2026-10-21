import React, { useState } from 'react';
import { Headphones, CheckCircle, XCircle, Star, MessageSquare, Search, RotateCcw, Eye } from 'lucide-react';
import { useDbStore } from '../store/dbStore';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function CskhDashboard() {
  const { user } = useAuthStore();
  const { reviews, moderateReview, logAudit } = useDbStore();
  const rawOrders = useOrderStore((state) => state.orders);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  const [activeTab, setActiveTab] = useState('returns'); // 'returns' | 'reviews' | 'orders'
  const [rejectModal, setRejectModal] = useState({ open: false, order: null });
  const [rejectReason, setRejectReason] = useState('Sản phẩm đã qua sử dụng hoặc mất tem mác');
  const [searchOrder, setSearchOrder] = useState('');

  // Đơn hàng có yêu cầu đổi trả đang ở trạng thái 'pending'
  const pendingReturns = orders.filter((o) => o.return_request && o.return_request.status === 'pending');

  // Duyệt yêu cầu đổi trả
  const handleApproveReturn = (order) => {
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              return_request: {
                ...o.return_request,
                status: 'approved',
                reviewed_by: user?.full_name || 'Phạm CSKH',
                reviewed_at: new Date().toISOString(),
              },
            }
          : o
      ),
    }));

    logAudit(user?.full_name || 'Phạm CSKH', 'APPROVE_RETURN', order.code, 'CSKH duyệt yêu cầu đổi/trả hàng');
    toast.success(`Đã DUYỆT yêu cầu đổi trả cho đơn ${order.code}! Yêu cầu được gửi sang bộ phận Kho.`);
  };

  // Từ chối yêu cầu đổi trả (bắt buộc có reject_reason theo check constraint DB)
  const handleRejectReturn = (e) => {
    e.preventDefault();
    if (!rejectModal.order) return;

    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === rejectModal.order.id
          ? {
              ...o,
              return_request: {
                ...o.return_request,
                status: 'rejected',
                reject_reason: rejectReason,
                reviewed_by: user?.full_name || 'Phạm CSKH',
                reviewed_at: new Date().toISOString(),
              },
            }
          : o
      ),
    }));

    logAudit(user?.full_name || 'Phạm CSKH', 'REJECT_RETURN', rejectModal.order.code, `Từ chối đổi trả: ${rejectReason}`);
    toast.success(`Đã từ chối yêu cầu đổi trả cho đơn ${rejectModal.order.code}`);
    setRejectModal({ open: false, order: null });
  };

  const filteredOrders = orders.filter((o) =>
    searchOrder ? o.code.toLowerCase().includes(searchOrder.toLowerCase()) || o.receiver_name.toLowerCase().includes(searchOrder.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header Minimalist */}
      <div className="liquid-glass-dark p-6 text-white border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Phân Quyền: Nhân Viên CSKH (cskh)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Bảng Điều Khiển Chăm Sóc Khách Hàng</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quyền hạn: <code className="text-emerald-300">return.review</code>, <code className="text-emerald-300">review.moderate</code>, <code className="text-emerald-300">order.view_any</code>
          </p>
        </div>

        <div className="text-right text-xs">
          <p className="text-neutral-400">Nhân viên trực:</p>
          <p className="font-bold text-white">{user?.full_name || 'CSKH'}</p>
        </div>
      </div>

      {/* Tabs Menu góc cạnh Liquid Glass */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'returns'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Duyệt Đổi / Trả Hàng ({pendingReturns.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'reviews'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Kiểm Duyệt Đánh Giá ({reviews.filter((r) => r.status === 'pending').length} chờ duyệt)
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Tra Cứu Đơn Hàng Toàn Sàn ({orders.length})
        </button>
      </div>

      {/* TAB 1: DUYỆT ĐỔI / TRẢ HÀNG */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Yêu Cầu Đổi / Trả Hàng Chờ CSKH Xem Xét (return_requests)</h3>
            <span className="text-xs text-neutral-500">Chỉ đơn hàng đã giao thành công trong 7 ngày</span>
          </div>

          {pendingReturns.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              Hiện không có yêu cầu đổi trả nào đang chờ duyệt.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {pendingReturns.map((order) => (
                <div key={order.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900 text-sm">{order.code}</span>
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-sm font-bold uppercase text-[10px]">
                        {order.return_request.type === 'exchange' ? 'Yêu cầu đổi hàng' : 'Yêu cầu trả tiền'}
                      </span>
                    </div>

                    <p className="text-neutral-700">
                      Khách hàng: <strong>{order.receiver_name}</strong> ({order.receiver_phone})
                    </p>
                    <p className="text-neutral-500">
                      Lý do: <strong>{order.return_request.reason}</strong>
                    </p>
                    <p className="text-neutral-600 bg-neutral-50 p-2.5 rounded-sm border italic">
                      "{order.return_request.description}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveReturn(order)}
                      className="px-4 py-2 liquid-glass-btn-accent text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Duyệt Chấp Thuận
                    </button>

                    <button
                      onClick={() => setRejectModal({ open: true, order })}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs rounded-sm flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Từ Chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KIỂM DUYỆT ĐÁNH GIÁ (reviews) */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Kiểm Duyệt Đánh Giá Khách Hàng (reviews)</h3>
            <span className="text-xs text-neutral-500">Đánh giá được duyệt mới hiển thị ra ngoài trang sản phẩm</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-neutral-900">{rev.user_name}</strong>
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                      rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      rev.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {rev.status}
                    </span>
                  </div>

                  <p className="text-neutral-600 italic">"{rev.comment}"</p>
                  <p className="text-[10px] text-neutral-400">{new Date(rev.created_at).toLocaleString('vi-VN')}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => {
                        moderateReview(rev.id, 'approved', user?.full_name || 'Phạm CSKH');
                        toast.success('Đã duyệt đánh giá công khai!');
                      }}
                      className="px-3 py-1.5 liquid-glass-btn-accent text-white text-[11px] font-bold"
                    >
                      Duyệt hiển thị
                    </button>
                  )}

                  {rev.status !== 'hidden' && (
                    <button
                      onClick={() => {
                        moderateReview(rev.id, 'hidden', user?.full_name || 'Phạm CSKH');
                        toast.success('Đã ẩn bài đánh giá!');
                      }}
                      className="px-3 py-1.5 bg-neutral-100 border text-neutral-600 text-[11px] font-bold rounded-sm hover:bg-neutral-200"
                    >
                      Ẩn bài
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRA CỨU ĐƠN HÀNG (order.view_any) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm mã đơn hoặc tên khách hàng..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                className="w-full bg-neutral-100 rounded-sm py-2 pl-9 pr-4 text-xs font-medium border"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b">
              <tr>
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Khách hàng & SĐT</th>
                <th className="p-3">Địa chỉ giao</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-mono font-bold text-neutral-900">{o.code}</td>
                  <td className="p-3">
                    <strong>{o.receiver_name}</strong>
                    <p className="text-[11px] text-neutral-500">{o.receiver_phone}</p>
                  </td>
                  <td className="p-3 max-w-xs truncate text-neutral-600">{o.shipping_address}</td>
                  <td className="p-3 font-bold text-amber-600">{o.total.toLocaleString('vi-VN')}₫</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-neutral-100 text-neutral-800">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Từ Chối Đổi Trả (bắt buộc nhập reject_reason) */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-neutral-900 text-base">Từ Chối Yêu Cầu Đổi / Trả</h3>
            <p className="text-xs text-neutral-500">
              Theo CSDL, lý do từ chối (<code>reject_reason</code>) là trường bắt buộc (NOT NULL) khi từ chối đơn hàng.
            </p>

            <form onSubmit={handleRejectReturn} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Lý do từ chối:</label>
                <textarea
                  rows="3"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-neutral-100 rounded-sm p-2.5 font-medium border"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, order: null })}
                  className="flex-1 py-2.5 rounded-sm border border-neutral-300 font-bold text-neutral-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-sm hover:bg-rose-700"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

