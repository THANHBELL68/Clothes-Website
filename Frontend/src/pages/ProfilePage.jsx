import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Award, MapPin, Mail, Phone, Plus, Trash2, Sparkles, Package, Heart, LogOut, Check } from 'lucide-react';
import { useAuthStore, normalizeRoleCode } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, addresses, addAddress, setDefaultAddress, logout } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    receiver_name: user?.full_name || '',
    phone: user?.phone || '',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    street: '',
    is_default: false,
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAddr.street.trim()) {
      toast.error('Vui lòng nhập địa chỉ cụ thể!');
      return;
    }
    addAddress(newAddr);
    setShowAddModal(false);
    toast.success('Đã thêm địa chỉ giao hàng mới!', {
      style: {
        background: '#080808',
        color: '#fafafa',
        border: '1px solid #27272a',
        fontFamily: 'JetBrains Mono',
        fontSize: '11px',
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleNormalized = normalizeRoleCode(user?.role);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Header Technical */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              MEMBER // 01
            </span>
          </div>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
            HỒ SƠ THÀNH VIÊN
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Quản lý thông tin tài khoản, điểm tích lũy Loyalty và sổ địa chỉ nhận hàng.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-zinc-800 hover:border-rose-900 bg-zinc-950 text-zinc-400 hover:text-rose-400 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ĐĂNG XUẤT</span>
        </button>
      </div>

      {/* Grid 3 Khối Thông Tin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        
        {/* KHỐI 1: THÔNG TIN TÀI KHOẢN */}
        <div className="bg-[#0c0c0c] border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border border-zinc-700 bg-zinc-900 flex items-center justify-center font-bold text-white text-lg">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <strong className="text-white font-sans text-base block">{user?.full_name}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 inline-block mt-0.5">
                {roleNormalized}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-zinc-900 text-zinc-400 text-[11px]">
            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-200">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-200">{user?.phone || 'Chưa cập nhật SĐT'}</span>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="pt-3 border-t border-zinc-900 space-y-2">
            <Link
              to="/orders"
              className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>ĐƠN HÀNG CỦA TÔI</span>
              </span>
              <span>&rarr;</span>
            </Link>

            <Link
              to="/wishlist"
              className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>SẢN PHẨM YÊU THÍCH</span>
              </span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* KHỐI 2: ĐIỂM LOYALTY POINTS & TIỆN ÍCH */}
        <div className="bg-[#0c0c0c] border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-zinc-400 uppercase tracking-widest text-[10px]">TÍCH LŨY LOYALTY</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-1">
            <span className="text-3xl font-bold font-inter text-amber-300 block">
              {user?.loyalty_points || 0} PTS
            </span>
            <p className="text-[11px] text-zinc-500">
              Tương đương giá trị giảm trừ: <strong className="text-white">{((user?.loyalty_points || 0) * 1000).toLocaleString('vi-VN')}₫</strong>
            </p>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1.5 text-[10px] text-zinc-400 leading-relaxed">
            <p className="text-white font-bold uppercase tracking-wider">CHÍNH SÁCH QUY ĐỔI:</p>
            <p>&bull; Mỗi 10.000₫ thanh toán tích được 1 điểm.</p>
            <p>&bull; 1 điểm = 1.000₫ trừ thẳng vào tổng tiền tại Checkout.</p>
            <p>&bull; Điểm không có thời hạn hết hạn.</p>
          </div>
        </div>

        {/* KHỐI 3: SỔ ĐỊA CHỈ NHẬN HÀNG (customer_addresses) */}
        <div className="bg-[#0c0c0c] border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-zinc-400 uppercase tracking-widest text-[10px]">SỔ ĐỊA CHỈ GIAO HÀNG</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[10px] text-white hover:text-amber-400 flex items-center gap-1 cursor-pointer underline"
            >
              <Plus className="w-3 h-3" /> THÊM MỚI
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-3.5 border transition-all text-[11px] ${
                  addr.is_default
                    ? 'border-emerald-500/80 bg-emerald-950/20'
                    : 'border-zinc-800 bg-zinc-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-white font-sans">{addr.receiver_name}</strong>
                  {addr.is_default && (
                    <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] uppercase font-bold">
                      MẶC ĐỊNH
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 font-mono mt-0.5">{addr.phone}</p>
                <p className="text-zinc-300 font-sans mt-1">
                  {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                </p>
                {!addr.is_default && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-[10px] text-zinc-500 hover:text-white underline mt-2 block cursor-pointer"
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Thêm Địa Chỉ Mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-zinc-700 max-w-md w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-white font-bold uppercase text-sm">THÊM ĐỊA CHỈ NHẬN HÀNG</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase block mb-1">Họ tên người nhận:</label>
                <input
                  type="text"
                  required
                  value={newAddr.receiver_name}
                  onChange={(e) => setNewAddr({ ...newAddr, receiver_name: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 p-2 text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase block mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 p-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase block mb-1">Địa chỉ cụ thể (Số nhà, tên đường):</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Số 12 ngõ 45 phố Duy Tân"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 p-2 text-white font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-wider text-xs cursor-pointer mt-3"
              >
                LƯU ĐỊA CHỈ GIAO HÀNG
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
