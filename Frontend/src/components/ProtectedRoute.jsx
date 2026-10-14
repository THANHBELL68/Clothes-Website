import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    // Chuyển hướng sang trang đăng nhập và lưu lại trang người dùng đang muốn đến
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

