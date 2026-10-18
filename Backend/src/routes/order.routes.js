import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Xem danh sách đơn hàng của user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT o.id, o.order_code, o.status, o.payment_method, o.payment_status, o.created_at,
              (SELECT SUM(line_total) FROM order_items oi WHERE oi.order_id = o.id) AS subtotal
       FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [req.user.sub]
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
});

// Đặt hàng (checkout) từ giỏ hàng
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { recipient_name, recipient_phone, province, district, ward, street_address, payment_method, note } = req.body;
    if (!recipient_name || !recipient_phone || !province || !district || !ward || !street_address) {
      return res.status(400).json({ message: 'Thiếu thông tin người nhận / địa chỉ' });
    }

    const order = await withTransaction(async (client) => {
      // Lấy giỏ hàng của user
      const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [req.user.sub]);
      if (cartRes.rows.length === 0) throw Object.assign(new Error('Giỏ hàng trống'), { status: 400 });
      const cartId = cartRes.rows[0].id;

      const itemsRes = await client.query(
        `SELECT ci.variant_id, ci.quantity, v.price, p.name AS product_name
         FROM cart_items ci
         JOIN product_variants v ON v.id = ci.variant_id
         JOIN products p ON p.id = v.product_id
         WHERE ci.cart_id = $1`,
        [cartId]
      );
      const items = itemsRes.rows;
      if (items.length === 0) throw Object.assign(new Error('Giỏ hàng trống'), { status: 400 });

      const subtotal = items.reduce((s, i) => s + i.quantity * Number(i.price), 0);
      const shippingFee = 30000;
      const orderCode = 'ORD' + Date.now();

      const orderRes = await client.query(
        `INSERT INTO orders (order_code, user_id, payment_method, status, payment_status, note)
         VALUES ($1, $2, $3, 'new', 'unpaid', $4) RETURNING id, order_code, status`,
        [orderCode, req.user.sub, payment_method || 'cod', note || null]
      );
      const orderId = orderRes.rows[0].id;

      await client.query(
        `INSERT INTO order_customers (order_id, customer_name, customer_phone)
         VALUES ($1, $2, $3)`,
        [orderId, recipient_name, recipient_phone]
      );

      await client.query(
        `INSERT INTO order_shipping_addresses (order_id, recipient_name, recipient_phone, province, district, ward, street_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, recipient_name, recipient_phone, province, district, ward, street_address]
      );

      for (const i of items) {
        await client.query(
          `INSERT INTO order_items (order_id, variant_id, product_name, unit_price, quantity, line_total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, i.variant_id, i.product_name, i.price, i.quantity, i.quantity * Number(i.price)]
        );
      }

      // Dọn giỏ hàng sau khi đặt
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

      return orderRes.rows[0];
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
