import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function CustomerAuthPage() {
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
      toast.success(`Chào mừng ${res.user.full_name} đã đăng nhập thành công!`);
      navigate(redirectPath);
    } else {
      toast.error(res.message);
    }
  };

  // Đăng nhập nhanh tài khoản khách hàng thành viên mẫu
  const handleQuickCustomerLogin = () => {
    const res = login('customer@shop.local', 'Demo123456');
    if (res.success) {
      toast.success('Đã đăng nhập tài khoản Khách Hàng (Nguyễn Văn Khách)!');
      navigate(redirectPath);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-none border border-neutral-200 shadow-xl p-8 space-y-6">
        
        {/* Header thương hiệu phong cách tối giản thanh lịch */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-[#e60012] text-white font-black text-xl px-3 py-1 tracking-tighter mb-1">
            CS
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            {isRegister ? 'TẠO TÀI KHOẢN KHÁCH HÀNG' : 'ĐĂNG NHẬP KHÁCH HÀNG'}
          </h1>
          <p className="text-xs text-neutral-500">
            {isRegister
              ? 'Đăng ký thành viên để hưởng chính sách miễn phí vận chuyển & tích điểm thưởng'
              : 'Đăng nhập để theo dõi đơn hàng, áp dụng voucher và thanh toán'}
          </p>
        </div>

        {/* Nút Đăng nhập Nhanh Khách Hàng Demo */}
        <button
          onClick={handleQuickCustomerLogin}
          type="button"
          className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-300"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Đăng nhập thử Khách Hàng: customer@shop.local</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase font-bold tracking-wider">HOẶC</span>
        </div>

        {/* Form đăng nhập/đăng ký người dùng */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="font-bold text-neutral-800 block mb-1.5 uppercase tracking-wider text-[11px]">
                Họ và tên của bạn:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 py-3 pl-10 pr-4 font-medium focus:outline-none focus:bg-white focus:border-neutral-900 text-neutral-900"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-neutral-800 block mb-1.5 uppercase tracking-wider text-[11px]">
              Địa chỉ Email:
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 py-3 pl-10 pr-4 font-medium focus:outline-none focus:bg-white focus:border-neutral-900 text-neutral-900"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-800 block mb-1.5 uppercase tracking-wider text-[11px]">
              Mật khẩu:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 py-3 pl-10 pr-4 font-medium focus:outline-none focus:bg-white focus:border-neutral-900 text-neutral-900"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              *Mật khẩu được lưu trữ an toàn và bảo mật theo chuẩn CSDL PostgreSQL.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-3"
          >
            <span>{isRegister ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center text-xs text-neutral-600 pt-2 border-t border-neutral-100">
          {isRegister ? (
            <p>
              Đã có tài khoản thành viên?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-neutral-900 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          ) : (
            <p>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-[#e60012] hover:underline"
              >
                Đăng ký miễn phí tại đây
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

