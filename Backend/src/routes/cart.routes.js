import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Xem giỏ hàng của user đang đăng nhập
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ci.id, ci.quantity, ci.added_at,
              v.id AS variant_id, v.sku, v.price,
              p.name AS product_name, p.slug AS product_slug,
              s.name AS size, co.name AS color,
              (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1) AS image
       FROM carts ct
       JOIN cart_items ci ON ci.cart_id = ct.id
       JOIN product_variants v ON v.id = ci.variant_id
       JOIN products p ON p.id = v.product_id
       LEFT JOIN sizes s ON s.id = v.size_id
       LEFT JOIN colors co ON co.id = v.color_id
       WHERE ct.user_id = $1
       ORDER BY ci.added_at DESC`,
      [req.user.sub]
    );
    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

// Thêm biến thể vào giỏ hàng
router.post('/items', requireAuth, async (req, res, next) => {
  try {
    const { variant_id, quantity } = req.body;
    if (!variant_id) return res.status(400).json({ message: 'Thiếu variant_id' });
    const qty = Math.max(1, Number(quantity) || 1);

    await withTransaction(async (client) => {
      // Kiểm tra biến thể tồn tại
      const v = await client.query('SELECT id, product_id FROM product_variants WHERE id = $1', [variant_id]);
      if (v.rows.length === 0) {
        throw Object.assign(new Error('Biến thể không tồn tại'), { status: 404 });
      }

      // Giỏ hàng 1 user = 1 giỏ (user_id UNIQUE)
      let { rows } = await client.query('SELECT id FROM carts WHERE user_id = $1', [req.user.sub]);
      if (rows.length === 0) {
        ({ rows } = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.user.sub]));
      }
      const cartId = rows[0].id;

      await client.query(
        `INSERT INTO cart_items (cart_id, variant_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (cart_id, variant_id) DO UPDATE SET quantity = cart_items.quantity + $3`,
        [cartId, variant_id, qty]
      );
    });

    res.status(201).json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (err) {
    next(err);
  }
});

// Cập nhật số lượng 1 dòng trong giỏ
router.patch('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const qty = Number(req.body.quantity);
    if (!qty || qty < 1) return res.status(400).json({ message: 'Số lượng không hợp lệ' });

    const { rowCount } = await query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND cart_id = (SELECT id FROM carts WHERE user_id = $3)`,
      [qty, req.params.id, req.user.sub]
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Không tìm thấy dòng trong giỏ' });
    res.json({ message: 'Đã cập nhật' });
  } catch (err) {
    next(err);
  }
});

// Xóa 1 dòng khỏi giỏ
router.delete('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM cart_items
       WHERE id = $1 AND cart_id = (SELECT id FROM carts WHERE user_id = $2)`,
      [req.params.id, req.user.sub]
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Không tìm thấy dòng trong giỏ' });
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    next(err);
  }
});

export default router;
