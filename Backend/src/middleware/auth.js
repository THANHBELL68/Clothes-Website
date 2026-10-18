import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Tạo token JWT sau khi đăng nhập thành công
export function signToken(user) {
  return jwt.sign(
    { sub: user.id, user_type: user.user_type },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware: bắt buộc đã đăng nhập
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

// Middleware: kiểm tra vai trò (vd: requireRole('SUPER_ADMIN'))
export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const { rows } = await query(
        `SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1`,
        [req.user.sub]
      );
      const userRoles = rows.map((r) => r.code);
      if (!roles.some((r) => userRoles.includes(r))) {
        return res.status(403).json({ message: 'Không có quyền' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
