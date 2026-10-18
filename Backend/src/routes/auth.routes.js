import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

// Đăng ký (schema dùng phone làm định danh, full_name, password_hash)
router.post('/register', async (req, res, next) => {
  try {
    const { phone, email, password, full_name } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Thiếu phone hoặc password' });
    }

    const exists = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (phone, email, password_hash, full_name, user_type)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING id, phone, email, full_name, user_type`,
      [phone, email || null, hash, full_name || null]
    );

    const user = rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
});

// Đăng nhập (cho phép phone hoặc email)
router.post('/login', async (req, res, next) => {
  try {
    const { phone, email, password } = req.body;
    const identifier = phone || email;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Thiếu phone/email hoặc password' });
    }

    const { rows } = await query(
      `SELECT * FROM users WHERE phone = $1 OR lower(email) = lower($1)`,
      [identifier]
    );
    const user = rows[0];
    if (!user || user.status !== 'active' || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
    }

    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

    const safe = { id: user.id, phone: user.phone, email: user.email, full_name: user.full_name, user_type: user.user_type };
    res.json({ user: safe, token: signToken(safe) });
  } catch (err) {
    next(err);
  }
});

export default router;
