import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Package, Headphones, Lock, Mail, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuthStore, DEMO_ACCOUNTS, normalizeRoleCode } from '../store/authStore';
import toast from 'react-hot-toast';

export default function StaffAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const staffAccounts = DEMO_ACCOUNTS.filter((acc) => normalizeRoleCode(acc.role) !== 'CUSTOMER');

  const handleStaffLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập email công vụ và mật khẩu!');
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    const roleNorm = normalizeRoleCode(res.user.role);
    if (roleNorm === 'CUSTOMER') {
      toast.error('Tài khoản khách hàng không có quyền truy cập Cổng Quản Trị Nội Bộ!');
      useAuthStore.getState().logout();
      return;
    }

    toast.success(`Đăng nhập thành công với vai trò: ${roleNorm} (${res.user.full_name})!`);
    navigate('/admin');
  };

  const handleQuickStaffLogin = (acc) => {
    const res = login(acc.email, 'password123');
    if (res.success) {
      const roleNorm = normalizeRoleCode(acc.role);
      toast.success(`Đã đăng nhập vai trò: ${acc.full_name} (${roleNorm})!`);
      navigate('/admin');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="bg-neutral-900 text-white rounded-none border border-neutral-800 shadow-2xl p-8 space-y-6">
        
        {/* Header cổng nội bộ */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xl mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 inline-block">
            INTERNAL STAFF ONLY • KHU VỰC NỘI BỘ
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            CỔNG ĐĂNG NHẬP NHÂN SỰ & QUẢN TRỊ
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Phân quyền động dựa trên view <code className="text-amber-400">v_user_permissions</code>
          </p>
        </div>

        {/* Cụm Đăng Nhập Nhanh Cho 3 Vai Trò Nội Bộ */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Chọn tài khoản nhân sự để truy cập nhanh:
          </p>

          <div className="space-y-2">
            {staffAccounts.map((acc) => {
              const roleNorm = normalizeRoleCode(acc.role);
              return (
                <button
                  key={acc.id}
                  onClick={() => handleQuickStaffLogin(acc)}
                  type="button"
                  className="w-full text-left p-3.5 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none bg-neutral-950 flex items-center justify-center">
                      {roleNorm === 'WAREHOUSE_MANAGER' && <Package className="w-4 h-4 text-amber-400" />}
                      {roleNorm === 'CS_STAFF' && <Headphones className="w-4 h-4 text-emerald-400" />}
                      {roleNorm === 'SUPER_ADMIN' && <Shield className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {acc.full_name}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">{acc.email}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700">
                    {roleNorm}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full"></div>
          <span className="bg-neutral-900 px-3 text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
            HOẶC ĐĂNG NHẬP BẰNG TÀI KHOẢN CÔNG VỤ
          </span>
        </div>

        {/* Form đăng nhập cho nhân viên */}
        <form onSubmit={handleStaffLogin} className="space-y-4 text-xs font-mono">
          <div>
            <label className="font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider text-[11px]">
              Email nhân sự (@shop.local):
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="warehouse@shop.local / cskh@shop.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 py-3 pl-10 pr-4 font-mono font-medium focus:outline-none focus:border-amber-400 text-white"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider text-[11px]">
              Mật khẩu xác thực:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 py-3 pl-10 pr-4 font-medium focus:outline-none focus:border-amber-400 text-white font-sans"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
          >
            <span>VÀO BẢNG ĐIỀU KHIỂN NỘI BỘ (/admin)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Mọi phiên truy cập nội bộ đều được ghi nhận tự động vào bảng <code>activity_logs</code>.</span>
        </div>

      </div>
    </div>
  );
}
