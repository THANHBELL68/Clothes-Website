import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, Check } from 'lucide-react';
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
      toast.success(`Chào mừng ${res.user.full_name} đã đăng nhập thành công!`, {
        style: {
          background: '#080808',
          color: '#fafafa',
          border: '1px solid #27272a',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
        },
      });
      navigate(redirectPath);
    } else {
      toast.error(res.message);
    }
  };

  const handleQuickCustomerLogin = () => {
    const res = login('customer@shop.local', 'Demo123456');
    if (res.success) {
      toast.success('Đã đăng nhập tài khoản Khách Hàng (Nguyễn Văn Khách)!', {
        style: {
          background: '#080808',
          color: '#fafafa',
          border: '1px solid #27272a',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
        },
      });
      navigate(redirectPath);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 font-sans">
      <div className="bg-[#0c0c0c] border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header AETHER LABS */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="w-5 h-5 text-white"
            >
              <path d="M12 3 L3 21 H7 L9.5 15 H14.5 L17 21 H21 L12 3 Z" />
              <line x1="9.5" y1="15" x2="14.5" y2="15" />
            </svg>
          </div>
          
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">
            AETHER LABS // CUSTOMER TERMINAL
          </span>
          <h1 className="font-inter font-black text-xl text-white tracking-tight uppercase">
            {isRegister ? 'TẠO TÀI KHOẢN THÀNH VIÊN' : 'ĐĂNG NHẬP THÀNH VIÊN'}
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            {isRegister
              ? 'Tích lũy điểm thưởng loyalty, nhận ưu đãi freeship và quản lý đơn hàng'
              : 'Đăng nhập để theo dõi trạng thái đơn hàng và sử dụng điểm tích lũy'}
          </p>
        </div>

        {/* Nút Đăng nhập Nhanh Khách Hàng Demo */}
        <button
          onClick={handleQuickCustomerLogin}
          type="button"
          className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>ĐĂNG NHẬP NHANH: customer@shop.local</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#0c0c0c] px-3 font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
            HOẶC ĐIỀN THÔNG TIN
          </span>
        </div>

        {/* Form Đăng nhập / Đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {isRegister && (
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase mb-1">
                Họ và tên của bạn:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn Khách"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#161616] border border-zinc-800 py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-zinc-500 font-sans"
                />
                <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 text-[10px] uppercase mb-1">
              Email tài khoản:
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@shop.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-zinc-800 py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-zinc-500 font-sans"
              />
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-[10px] uppercase mb-1">
              Mật khẩu:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161616] border border-zinc-800 py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-zinc-500 font-sans"
              />
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            <span>{isRegister ? 'TẠO TÀI KHOẢN [SIGN UP]' : 'ĐĂNG NHẬP [SIGN IN]'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Đăng nhập / Đăng ký */}
        <div className="text-center font-mono text-xs text-zinc-500 pt-2 border-t border-zinc-900">
          {isRegister ? (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-white underline hover:text-zinc-300 ml-1 cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </p>
          ) : (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-white underline hover:text-zinc-300 ml-1 cursor-pointer"
              >
                Đăng ký thành viên mới
              </button>
            </p>
          )}
        </div>

        {/* Member Perks Box */}
        <div className="p-3 bg-[#121212] border border-zinc-800/80 font-mono text-[10px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>QUYỀN LỢI THÀNH VIÊN AETHER</span>
          </div>
          <p>✓ Tích lũy 10.000₫ = 1 điểm loyalty (1 điểm trừ trực tiếp 1.000₫).</p>
          <p>✓ Miễn phí vận chuyển cho đơn hàng từ 500.000₫.</p>
        </div>

      </div>
    </div>
  );
}
