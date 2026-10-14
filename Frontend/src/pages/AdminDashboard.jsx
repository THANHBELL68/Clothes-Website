import React, { useState } from 'react';
import { ShieldAlert, Users, Sliders, Activity, Lock, Unlock, DollarSign, TrendingUp, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDbStore } from '../store/dbStore';
import { useOrderStore } from '../store/orderStore';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, allUsers, toggleUserActive, changeUserRole } = useAuthStore();
  const { auditLogs, systemSettings, updateSettings, products } = useDbStore();
  const { orders } = useOrderStore();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'reports' | 'logs' | 'settings'

  // Thống kê doanh thu & đơn hàng
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.items.reduce((s, it) => s + it.quantity, 0) : 0), 0);
  const totalStock = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.stock, 0), 0);

  // Settings form
  const [settingsForm, setSettingsForm] = useState(systemSettings);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(settingsForm, user?.full_name || 'Admin');
    toast.success('Đã cập nhật cấu hình hệ thống (system_settings)!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header Minimalist */}
      <div className="liquid-glass-dark p-6 text-white border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
              Phân Quyền: Admin Tối Cao (admin - Toàn Bộ 29 Quyền)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Bảng Điều Khiển Quản Trị Hệ Thống</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quản trị tài khoản, gán vai trò, cấu hình hệ thống và nhật ký hoạt động CSDL
          </p>
        </div>

        <div className="text-right text-xs">
          <p className="text-neutral-400">Admin trực:</p>
          <p className="font-bold text-white">{user?.full_name || 'Trần Quản Trị'}</p>
        </div>
      </div>

      {/* Tabs Menu góc cạnh Liquid Glass */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'users' ? 'liquid-glass-btn-accent text-white' : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Tài Khoản & Phân Quyền ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'reports' ? 'liquid-glass-btn-accent text-white' : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Báo Cáo Doanh Thu
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'logs' ? 'liquid-glass-btn-accent text-white' : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Nhật Ký Hoạt Động ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'settings' ? 'liquid-glass-btn-accent text-white' : 'liquid-glass-btn text-neutral-800 bg-white/70'
          }`}
        >
          Cấu Hình Hệ Thống
        </button>
      </div>

      {/* TAB 1: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (user.manage, role.assign) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Danh Sách Người Dùng & Phân Quyền (bảng users & roles)</h3>
            <span className="text-xs text-neutral-500">Khóa tài khoản bằng is_active = FALSE (không xóa hẳn khỏi DB)</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b">
              <tr>
                <th className="p-3">Họ tên & Email</th>
                <th className="p-3">Số điện thoại</th>
                <th className="p-3">Vai trò (Role)</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Hành động Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/50">
                  <td className="p-3">
                    <strong className="text-neutral-900">{u.full_name}</strong>
                    <p className="text-[11px] text-neutral-400 font-mono">{u.email}</p>
                  </td>
                  <td className="p-3 text-neutral-600 font-mono">{u.phone}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => {
                        changeUserRole(u.id, e.target.value);
                        toast.success(`Đã đổi vai trò của ${u.full_name} thành: ${e.target.value}`);
                      }}
                      className="bg-neutral-100 border rounded-sm px-2.5 py-1 text-xs font-bold text-neutral-800 focus:outline-none"
                    >
                      <option value="customer">Khách Hàng (customer)</option>
                      <option value="warehouse">Quản Lý Kho (warehouse)</option>
                      <option value="cskh">Nhân Viên CSKH (cskh)</option>
                      <option value="admin">Admin Tối Cao (admin)</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                        Đang bị khóa
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        toggleUserActive(u.id);
                        toast.success(`Đã ${u.is_active ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${u.email}!`);
                      }}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-sm inline-flex items-center gap-1 ${
                        u.is_active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.is_active ? <><Lock className="w-3 h-3" /> Khóa tài khoản</> : <><Unlock className="w-3 h-3" /> Mở khóa</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: BÁO CÁO DOANH THU (report.view_all) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-neutral-400">Doanh thu toàn sàn</span>
              <h3 className="text-2xl font-black text-neutral-900 mt-2">{totalRevenue.toLocaleString('vi-VN')}₫</h3>
              <p className="text-xs text-emerald-600 mt-1 font-semibold">Tự động tổng hợp từ orders</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-neutral-400">Đơn hàng hoàn tất</span>
              <h3 className="text-2xl font-black text-neutral-900 mt-2">{orders.length} đơn</h3>
              <p className="text-xs text-neutral-500 mt-1 font-semibold">Tổng {totalItemsSold} sản phẩm đã bán</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs">
              <span className="text-xs font-bold uppercase text-neutral-400">Tồn kho toàn hệ thống</span>
              <h3 className="text-2xl font-black text-neutral-900 mt-2">{totalStock} chiếc</h3>
              <p className="text-xs text-amber-600 mt-1 font-semibold">Khớp sổ cái stock_movements</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NHẬT KÝ HỆ THỐNG AUDIT_LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">Nhật Ký Hoạt Động Hệ Thống (bảng audit_logs)</h3>
            <span className="text-xs text-neutral-400 font-mono">Chỉ ghi dòng, không thể sửa/xóa</span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b font-sans">
              <tr>
                <th className="p-3">Thời gian</th>
                <th className="p-3">Người thao tác</th>
                <th className="p-3">Hành động</th>
                <th className="p-3">Mục tiêu</th>
                <th className="p-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3 text-neutral-400">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                  <td className="p-3 font-bold text-neutral-900 font-sans">{log.user_name}</td>
                  <td className="p-3 text-amber-600 font-bold">{log.action}</td>
                  <td className="p-3 text-neutral-700">{log.target}</td>
                  <td className="p-3 text-neutral-500 font-sans">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: CẤU HÌNH HỆ THỐNG SYSTEM_SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs max-w-xl space-y-4">
          <h3 className="font-bold text-neutral-900 text-base">Cấu Hình Toàn Hệ Thống (system_settings)</h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Phí vận chuyển mặc định (VNĐ):</label>
              <input
                type="number"
                value={settingsForm.default_shipping_fee}
                onChange={(e) => setSettingsForm({ ...settingsForm, default_shipping_fee: Number(e.target.value) })}
                className="w-full bg-neutral-100 rounded-sm p-2.5 font-bold border"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Miễn phí vận chuyển từ đơn (VNĐ):</label>
              <input
                type="number"
                value={settingsForm.free_shipping_from}
                onChange={(e) => setSettingsForm({ ...settingsForm, free_shipping_from: Number(e.target.value) })}
                className="w-full bg-neutral-100 rounded-sm p-2.5 font-bold border"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Thời hạn cho phép đổi/trả hàng (Số ngày):</label>
              <input
                type="number"
                value={settingsForm.return_window_days}
                onChange={(e) => setSettingsForm({ ...settingsForm, return_window_days: Number(e.target.value) })}
                className="w-full bg-neutral-100 rounded-sm p-2.5 font-bold border"
              />
              <p className="text-[10px] text-neutral-400 mt-1">*Khách chỉ được gửi yêu cầu đổi trả trong vòng số ngày này sau khi đơn hoàn thành.</p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 liquid-glass-btn-accent text-white font-bold text-xs uppercase tracking-wider"
            >
              Lưu Cấu Hình Hệ Thống
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

