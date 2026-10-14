import React, { useState } from 'react';
import { User, Award, MapPin, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, addresses, addAddress, setDefaultAddress } = useAuthStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newAddr, setNewAddr] = useState({
    receiver_name: user?.full_name || '',
    phone: user?.phone || '',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    street: '',
    is_default: false,
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAddr.street.trim()) return;
    addAddress(newAddr);
    setShowAdd(false);
    toast.success('Đã thêm địa chỉ mới!');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Hồ Sơ Khách Hàng</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Quản lý thông tin cá nhân, điểm thưởng loyalty và sổ địa chỉ giao hàng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Thông tin khách hàng */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-black text-2xl mx-auto">
            {user?.full_name?.charAt(0) || 'K'}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-neutral-900 text-base">{user?.full_name}</h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full mt-1 inline-block">
              Khách hàng thành viên
            </span>
          </div>

          <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>{user?.phone || 'Chưa cập nhật SĐT'}</span>
            </div>
          </div>
        </div>

        {/* Card Điểm thưởng Loyalty (bảng loyalty_rewards & loyalty_transactions trong DB) */}
        <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Clothes Club Rewards
              </span>
              <span className="text-xs text-neutral-400">10.000₫ = 1 điểm</span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-neutral-400">Điểm khả dụng:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-amber-400">{user?.loyalty_points || 0}</span>
                <span className="text-sm font-semibold text-neutral-300">điểm tích lũy</span>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-700/60 pt-4 mt-6 text-xs text-neutral-300 flex items-center justify-between">
            <span>Giá trị quy đổi giảm giá: <strong>{((user?.loyalty_points || 0) * 1000).toLocaleString('vi-VN')}₫</strong></span>
            <span className="text-amber-400 font-semibold">Tự động trừ khi đặt hàng</span>
          </div>
        </div>

      </div>

      {/* Sổ địa chỉ nhận hàng (bảng addresses trong DB) */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" /> Sổ Địa Chỉ Nhận Hàng ({addresses.length})
          </h3>
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-xl border-2 text-xs space-y-2 relative ${
                addr.is_default ? 'border-neutral-900 bg-neutral-50/50' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-neutral-900 text-sm">{addr.receiver_name}</strong>
                  {addr.is_default && (
                    <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Mặc định
                    </span>
                  )}
                </div>
                {!addr.is_default && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-amber-600 font-semibold hover:underline text-[11px]"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>

              <p className="text-neutral-500 font-medium">SĐT: {addr.phone}</p>
              <p className="text-neutral-700 leading-relaxed">
                {addr.street}, {addr.ward}, {addr.district}, {addr.province}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Thêm Địa Chỉ */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-neutral-900 text-lg">Thêm Địa Chỉ Giao Hàng</h3>
            
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Họ tên người nhận:</label>
                <input
                  type="text"
                  required
                  value={newAddr.receiver_name}
                  onChange={(e) => setNewAddr({ ...newAddr, receiver_name: e.target.value })}
                  className="w-full bg-neutral-100 rounded-lg p-2.5 font-medium border"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Số điện thoại:</label>
                <input
                  type="tel"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full bg-neutral-100 rounded-lg p-2.5 font-medium border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tỉnh / Thành:</label>
                  <input
                    type="text"
                    required
                    value={newAddr.province}
                    onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                    className="w-full bg-neutral-100 rounded-lg p-2.5 font-medium border"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Quận / Huyện:</label>
                  <input
                    type="text"
                    required
                    value={newAddr.district}
                    onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                    className="w-full bg-neutral-100 rounded-lg p-2.5 font-medium border"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Phường / Xã:</label>
                <input
                  type="text"
                  required
                  value={newAddr.ward}
                  onChange={(e) => setNewAddr({ ...newAddr, ward: e.target.value })}
                  className="w-full bg-neutral-100 rounded-lg p-2.5 font-medium border"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Số nhà, tên đường:</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full bg-neutral-100 rounded-lg p-2.5 font-medium border"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white font-bold"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

