import React, { useState } from 'react';
import { Package, Truck, ArrowDownLeft, ArrowUpRight, RotateCcw, Check, Plus, Search, FileText } from 'lucide-react';
import { useDbStore } from '../store/dbStore';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function WarehouseDashboard() {
  const { user } = useAuthStore();
  const { products, goodsReceipts, goodsIssues, stockMovements, createGoodsReceipt, createGoodsIssue, confirmReturnReceipt } = useDbStore();
  const rawOrders = useOrderStore((state) => state.orders);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'receipt' | 'returns' | 'movements'

  // Form nhập kho
  const [receiptForm, setReceiptForm] = useState({
    supplierName: 'Xưởng May Vải Rayon Cao Cấp Hà Nội',
    variantId: 102, // Mẫu Áo kiểu Rayon Size M
    quantity: 20,
    unitCost: 280000,
  });

  // Đơn hàng cần xuất kho (trạng thái: 'new', 'processing', 'packing')
  const pendingOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'completed');

  // Đơn hàng có yêu cầu đổi trả đã được CSKH duyệt ('approved') cần kho xác nhận nhận hàng
  const returnOrders = orders.filter((o) => o.return_request && o.return_request.status === 'approved');

  const handleCreateIssue = (order) => {
    // 1. Tạo phiếu xuất kho
    createGoodsIssue({
      order,
      carrier: 'Giao Hàng Tiết Kiệm (GHTK)',
      trackingCode: 'GHTK-' + Date.now().toString().slice(-6),
      userName: user?.full_name || 'Warehouse',
    });

    // 2. Chuyển trạng thái đơn sang 'shipping' trong orderStore
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id ? { ...o, status: 'shipping' } : o
      ),
    }));

    toast.success(`Đã xuất kho và chuyển đơn ${order.code} sang Đang Giao Hàng! (Tồn kho đã tự động trừ theo trigger)`);
  };

  const handleQuickAdvance = (orderId, nextStatus) => {
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      ),
    }));
    toast.success(`Đã cập nhật đơn sang trạng thái: ${nextStatus}`);
  };

  const handleReceiptSubmit = (e) => {
    e.preventDefault();
    const product = products.find((p) => p.variants?.some((v) => v.id === Number(receiptForm.variantId)));
    const variant = product?.variants?.find((v) => v.id === Number(receiptForm.variantId));

    createGoodsReceipt({
      supplierName: receiptForm.supplierName,
      userName: user?.full_name || 'Warehouse',
      items: [
        {
          variant_id: Number(receiptForm.variantId),
          sku: variant?.sku || 'SKU-NEW',
          quantity: Number(receiptForm.quantity),
          unit_cost: Number(receiptForm.unitCost),
        },
      ],
    });

    toast.success(`Đã tạo phiếu nhập kho thành công! (+${receiptForm.quantity} chiếc vào tồn kho)`);
  };

  const handleConfirmReturn = (order) => {
    const item = order.items[0];
    confirmReturnReceipt({
      orderCode: order.code,
      variantId: item.variant_id,
      quantity: item.quantity,
      userName: user?.full_name || 'Warehouse',
    });

    // Chuyển trạng thái return_request sang 'received'
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              return_request: {
                ...o.return_request,
                status: 'received',
                received_at: new Date().toISOString(),
              },
            }
          : o
      ),
    }));

    toast.success(`Đã nhận hàng đổi/trả về kho và nhập lại ${item.quantity} sản phẩm vào tồn kho!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header Minimalist */}
      <div className="liquid-glass-dark p-6 text-white border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Phân Quyền: Quản Lý Kho (warehouse)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Bảng Điều Khiển Kho & Xuất Nhập Hàng</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Thao tác trực tiếp với các bảng: <code className="text-amber-300">goods_receipts</code>, <code className="text-amber-300">goods_issues</code>, <code className="text-amber-300">stock_movements</code>
          </p>
        </div>

        {/* User Badge */}
        <div className="text-right text-xs">
          <p className="text-neutral-400">Đang đăng nhập:</p>
          <p className="font-bold text-white">{user?.full_name || 'Warehouse'}</p>
        </div>
      </div>

      {/* Tabs Menu góc cạnh Liquid Glass */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Xuất Kho & Đơn Hàng ({pendingOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'receipt'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          + Tạo Phiếu Nhập Kho
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'returns'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Xác Nhận Hàng Hoàn Về Kho ({returnOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'movements'
              ? 'liquid-glass-btn-accent text-white'
              : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Sổ Cái Biến Động Kho ({stockMovements.length})
        </button>
      </div>

      {/* TAB 1: XUẤT KHO ĐƠN HÀNG */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Danh Sách Đơn Cần Đóng Gói & Xuất Kho</h3>
            <span className="text-xs text-neutral-500">Trigger tự động trừ tồn kho khi tạo phiếu xuất</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b">
                <tr>
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Sản phẩm & Biến thể</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50">
                    <td className="p-3 font-mono font-bold text-neutral-900">{order.code}</td>
                    <td className="p-3">
                      <strong>{order.receiver_name}</strong>
                      <p className="text-[11px] text-neutral-400">{order.receiver_phone}</p>
                    </td>
                    <td className="p-3">
                      {order.items.map((it) => (
                        <div key={it.id} className="text-[11px]">
                          • {it.product_name} ({it.color} / {it.size}) - x{it.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase bg-amber-100 text-amber-900">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {order.status === 'new' && (
                        <button
                          onClick={() => handleQuickAdvance(order.id, 'processing')}
                          className="px-3 py-1.5 liquid-glass-btn text-neutral-800 text-[11px] font-bold"
                        >
                          Xác nhận đơn
                        </button>
                      )}

                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleQuickAdvance(order.id, 'packing')}
                          className="px-3 py-1.5 liquid-glass-btn-dark text-white text-[11px] font-bold"
                        >
                          Chuyển đóng gói
                        </button>
                      )}

                      {order.status === 'packing' && (
                        <button
                          onClick={() => handleCreateIssue(order)}
                          className="px-3 py-1.5 liquid-glass-btn-accent text-white text-[11px] font-bold flex items-center gap-1 ml-auto"
                        >
                          <Truck className="w-3.5 h-3.5" /> Tạo phiếu xuất kho & Giao
                        </button>
                      )}

                      {order.status === 'shipping' && (
                        <button
                          onClick={() => handleQuickAdvance(order.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-sm"
                        >
                          Đã giao thành công
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TẠO PHIẾU NHẬP KHO */}
      {activeTab === 'receipt' && (
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs max-w-2xl space-y-4">
          <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" /> Tạo Phiếu Nhập Kho (goods_receipts)
          </h3>
          <p className="text-xs text-neutral-500">
            Khi nhập hàng từ nhà cung cấp, hệ thống tự động cộng tồn kho vào biến thể và ghi dòng sổ cái `stock_movements`.
          </p>

          <form onSubmit={handleReceiptSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Nhà cung cấp:</label>
              <input
                type="text"
                required
                value={receiptForm.supplierName}
                onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })}
                className="w-full bg-neutral-100 rounded-sm p-2.5 font-medium border"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Chọn sản phẩm & Biến thể:</label>
              <select
                value={receiptForm.variantId}
                onChange={(e) => setReceiptForm({ ...receiptForm, variantId: Number(e.target.value) })}
                className="w-full bg-neutral-100 rounded-sm p-2.5 font-medium border"
              >
                {products.flatMap((p) =>
                  p.variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {p.name} — {v.color} / Size {v.size} (Tồn hiện tại: {v.stock})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Số lượng nhập:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={receiptForm.quantity}
                  onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })}
                  className="w-full bg-neutral-100 rounded-sm p-2.5 font-bold border"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Giá vốn đơn vị (VNĐ):</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={receiptForm.unitCost}
                  onChange={(e) => setReceiptForm({ ...receiptForm, unitCost: e.target.value })}
                  className="w-full bg-neutral-100 rounded-sm p-2.5 font-bold border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 liquid-glass-btn-accent text-white font-bold text-xs uppercase tracking-wider"
            >
              Lưu Phiếu Nhập & Tăng Tồn Kho
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: HÀNG ĐỔI TRẢ HOÀN VỀ KHO */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900">Yêu Cầu Đổi Trả Đã Được CSKH Duyệt (Chờ Nhập Kho)</h3>
          </div>

          {returnOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              Hiện không có đơn đổi trả nào đang chờ thủ kho xác nhận nhận hàng.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {returnOrders.map((order) => (
                <div key={order.id} className="p-4 border rounded-sm flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-neutral-900">{order.code}</span>
                    <p className="text-neutral-500 mt-0.5">Khách: {order.receiver_name} • Lý do: {order.return_request.reason}</p>
                    <p className="text-neutral-400 italic">"{order.return_request.description}"</p>
                  </div>

                  <button
                    onClick={() => handleConfirmReturn(order)}
                    className="px-4 py-2 liquid-glass-btn-accent text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Xác Nhận Đã Nhận Hàng Hoàn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SỔ CÁI KHO STOCK_MOVEMENTS */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Sổ Cái Biến Động Tồn Kho (stock_movements)</h3>
            <span className="text-xs text-neutral-400 font-mono">Bảng chỉ thêm dòng (Append-only)</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b">
              <tr>
                <th className="p-3">Thời gian</th>
                <th className="p-3">SKU / Biến thể</th>
                <th className="p-3">Biến động</th>
                <th className="p-3">Lý do</th>
                <th className="p-3">Người thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {stockMovements.map((m) => (
                <tr key={m.id}>
                  <td className="p-3 text-neutral-500">{new Date(m.created_at).toLocaleString('vi-VN')}</td>
                  <td className="p-3 font-bold text-neutral-900">{m.sku}</td>
                  <td className={`p-3 font-black ${m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="p-3 font-semibold text-neutral-700">{m.reason}</td>
                  <td className="p-3 text-neutral-500 font-sans">{m.created_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

