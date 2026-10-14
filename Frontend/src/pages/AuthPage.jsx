import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Shield, Package, Headphones, Check } from 'lucide-react';
import { useAuthStore, DEMO_ACCOUNTS } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { login } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    const res = login(email, password);
    if (res.success) {
      toast.success(`Đăng nhập thành công với vai trò ${res.user.role}!`);
      navigate(redirectPath);
    } else {
      toast.error(res.message);
    }
  };

  const handleQuickRoleLogin = (acc) => {
    const res = login(acc.email, 'password123');
    if (res.success) {
      toast.success(`Đã đăng nhập tài khoản: ${acc.full_name} (${acc.role})!`);
      if (acc.role === 'warehouse') navigate('/warehouse');
      else if (acc.role === 'cskh') navigate('/cskh');
      else if (acc.role === 'admin') navigate('/admin');
      else navigate(redirectPath);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white/95 liquid-glass rounded-sm border border-neutral-200/80 shadow-2xl p-7 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 liquid-glass-btn-dark text-amber-400 rounded-sm flex items-center justify-center font-black text-xl mx-auto shadow-md">
            CS
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Hệ Thống'}
          </h2>
          <p className="text-xs text-neutral-500">
            {isRegister
              ? 'Tạo tài khoản thành viên để đặt hàng và tích lũy điểm loyalty'
              : 'Đăng nhập phân quyền theo mô hình CSDL'}
          </p>
        </div>

        {/* Cụm Đăng Nhập Nhanh Theo Phân Quyền CSDL */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Đăng nhập nhanh kiểm thử phân quyền:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickRoleLogin(DEMO_ACCOUNTS.find(a => a.role === 'customer'))}
              type="button"
              className="liquid-glass-btn p-2.5 text-left rounded-sm transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Khách Hàng</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">customer@shop.local</p>
            </button>

            <button
              onClick={() => handleQuickRoleLogin(DEMO_ACCOUNTS.find(a => a.role === 'warehouse'))}
              type="button"
              className="liquid-glass-btn p-2.5 text-left rounded-sm transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Thủ Kho</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">warehouse@shop.local</p>
            </button>

            <button
              onClick={() => handleQuickRoleLogin(DEMO_ACCOUNTS.find(a => a.role === 'cskh'))}
              type="button"
              className="liquid-glass-btn p-2.5 text-left rounded-sm transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSKH</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">cskh@shop.local</p>
            </button>

            <button
              onClick={() => handleQuickRoleLogin(DEMO_ACCOUNTS.find(a => a.role === 'admin'))}
              type="button"
              className="liquid-glass-btn p-2.5 text-left rounded-sm transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">admin@shop.local</p>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full"></div>
          <span className="bg-white/80 px-3 text-[10px] text-neutral-400 uppercase font-black tracking-wider">hoặc nhập thông tin</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Họ và tên:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white rounded-sm py-2.5 pl-9 pr-4 font-medium border border-neutral-300 focus:outline-none focus:border-neutral-900"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Địa chỉ Email:</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="tenban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-sm py-2.5 pl-9 pr-4 font-medium border border-neutral-300 focus:outline-none focus:border-neutral-900"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Mật khẩu:</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white rounded-sm py-2.5 pl-9 pr-4 font-medium border border-neutral-300 focus:outline-none focus:border-neutral-900"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              *Mật khẩu được lưu trữ an toàn băm theo chuẩn CSDL (bcrypt).
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 liquid-glass-btn-accent text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl mt-2"
          >
            <span>{isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center text-xs text-neutral-500 pt-1">
          {isRegister ? (
            <p>
              Đã có tài khoản?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-neutral-900 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          ) : (
            <p>
              Chưa có tài khoản thành viên?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-neutral-900 hover:underline"
              >
                Đăng ký miễn phí
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
