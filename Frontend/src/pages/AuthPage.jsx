import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
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

    login(email, password);
    toast.success('Đăng nhập thành công với vai trò Khách hàng thành viên!');
    navigate(redirectPath);
  };

  // Nút đăng nhập nhanh tài khoản mẫu trong CSDL (02_seed_required.sql)
  const handleQuickDemoLogin = () => {
    login('customer@shop.local', 'Demo123456');
    toast.success('Đã đăng nhập tài khoản Khách hàng mẫu (customer@shop.local)!');
    navigate(redirectPath);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto">
            CS
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Khách Hàng'}
          </h2>
          <p className="text-xs text-neutral-500">
            {isRegister
              ? 'Tạo tài khoản thành viên để tích lũy điểm và đặt hàng'
              : 'Đăng nhập để xem đơn hàng, tích điểm và thanh toán'}
          </p>
        </div>

        {/* Nút Đăng nhập Nhanh Demo */}
        <button
          onClick={handleQuickDemoLogin}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Đăng nhập nhanh Demo (customer@shop.local)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase font-semibold">hoặc</span>
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
                  className="w-full bg-neutral-100 rounded-xl py-3 pl-10 pr-4 font-medium focus:outline-none focus:bg-white border focus:border-neutral-300"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
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
                className="w-full bg-neutral-100 rounded-xl py-3 pl-10 pr-4 font-medium focus:outline-none focus:bg-white border focus:border-neutral-300"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
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
                className="w-full bg-neutral-100 rounded-xl py-3 pl-10 pr-4 font-medium focus:outline-none focus:bg-white border focus:border-neutral-300"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              *Mật khẩu được mã hóa băm an toàn theo chuẩn CSDL (bcrypt).
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-neutral-900/20 transition-all mt-2"
          >
            <span>{isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center text-xs text-neutral-500 pt-2">
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

