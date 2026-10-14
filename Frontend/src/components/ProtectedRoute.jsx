import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, DEMO_ACCOUNTS } from '../store/authStore';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    // Chuyển hướng sang trang đăng nhập và lưu lại trang người dùng đang muốn đến
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Nếu route có yêu cầu vai trò cụ thể mà user không có quyền
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const requiredRoleNames = allowedRoles.map((r) => {
      if (r === 'admin') return 'Quản Trị Viên (Admin)';
      if (r === 'warehouse') return 'Quản Lý Kho (Warehouse)';
      if (r === 'cskh') return 'Chăm Sóc Khách Hàng (CSKH)';
      return r;
    }).join(' hoặc ');

    const targetDemo = DEMO_ACCOUNTS.find((acc) => allowedRoles.includes(acc.role));

    return (
      <div className="max-w-lg mx-auto my-12 p-8 liquid-glass rounded-sm border border-neutral-200/80 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 mx-auto bg-amber-500/10 text-amber-600 rounded-sm flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-neutral-900 tracking-tight">
          Yêu Cầu Quyền Hạn Đặc Biệt
        </h2>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Khu vực này chỉ dành cho vai trò: <strong className="text-neutral-900">{requiredRoleNames}</strong>.
          <br />
          Tài khoản hiện tại của bạn là <strong className="text-amber-700 font-mono">({user.role}) - {user.full_name}</strong>.
        </p>

        {targetDemo && (
          <div className="pt-2">
            <button
              onClick={() => {
                useAuthStore.getState().login(targetDemo.email, 'demo123');
              }}
              className="w-full py-3 px-4 liquid-glass-btn-accent text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
            >
              <UserCheck className="w-4 h-4" /> Chuyển sang tài khoản {targetDemo.full_name}
            </button>
          </div>
        )}
      </div>
    );
  }

  return children;
}
