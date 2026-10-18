import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// Danh sách sản phẩm (có tìm kiếm + phân trang đơn giản)
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const { rows } = await query(
      `SELECT p.id, p.name, p.slug, p.base_price, p.is_visible, p.description,
              c.name AS category_name, c.slug AS category_slug,
              (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order LIMIT 1) AS image
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.deleted_at IS NULL AND p.is_visible
         AND ($1 = '' OR p.name ILIKE '%' || $1 || '%')
         AND ($2 = '' OR c.slug = $2)
       ORDER BY p.created_at DESC
       LIMIT $3 OFFSET $4`,
      [search, category, limit, offset]
    );
    res.json({ data: rows, page, limit });
  } catch (err) {
    next(err);
  }
});

// Chi tiết 1 sản phẩm theo slug (kèm biến thể: size/màu/giá + tồn kho)
router.get('/:slug', async (req, res, next) => {
  try {
    const productRes = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.deleted_at IS NULL`,
      [req.params.slug]
    );
    if (productRes.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const variantsRes = await query(
      `SELECT v.id, v.sku, v.price, v.is_active, s.name AS size, co.name AS color, m.name AS material,
              COALESCE(inv.quantity - inv.reserved_quantity, 0) AS in_stock
       FROM product_variants v
       LEFT JOIN sizes s ON s.id = v.size_id
       LEFT JOIN colors co ON co.id = v.color_id
       LEFT JOIN materials m ON m.id = v.material_id
       LEFT JOIN inventories inv ON inv.variant_id = v.id
       WHERE v.product_id = $1
       ORDER BY v.id`,
      [productRes.rows[0].id]
    );

    const imagesRes = await query(
      `SELECT url, sort_order FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
      [productRes.rows[0].id]
    );

    res.json({ ...productRes.rows[0], variants: variantsRes.rows, images: imagesRes.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
