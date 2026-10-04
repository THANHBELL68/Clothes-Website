-- =====================================================================
-- 03_seed_demo.sql - DU LIEU MAU (CHI DUNG KHI PHAT TRIEN / THU GIAO DIEN)
--
-- KHONG chay tren production.
-- Chay SAU 01_schema.sql va 02_seed_required.sql, tren database con trong du lieu mau.
-- Chay 2 lan se loi trung (slug, sku, code da ton tai).
--
-- Luu y: so cai kho va nhat ky la bang chi-them-dong (trigger chan sua/xoa), nen KHONG
-- xoa tung dong du lieu mau nay duoc. Muon bo di thi tao lai database tu dau (01, 02).
-- =====================================================================

SET client_encoding = 'UTF8';
BEGIN;

-- Tai khoan admin mau: password_hash dang bi khoa, khong dang nhap duoc.
-- Ung dung phai dat mat khau that (bam bcrypt/argon2) truoc khi dung.
INSERT INTO users (role_id, email, password_hash, full_name)
SELECT id, 'admin@shop.local', '!CHUA_DAT_MAT_KHAU', 'Admin (demo)'
FROM roles WHERE code = 'admin';

INSERT INTO categories (name, slug) VALUES
  ('Ao thun',   'ao-thun'),
  ('Quan jean', 'quan-jean');

INSERT INTO products (category_id, name, slug, price, cost_price)
SELECT c.id, v.name, v.slug, v.price, v.cost
FROM (VALUES
  ('ao-thun',   'Ao thun basic',  'ao-thun-basic',  199000,  90000),
  ('quan-jean', 'Quan jean slim', 'quan-jean-slim', 450000, 220000)
) AS v(cat_slug, name, slug, price, cost)
JOIN categories c ON c.slug = v.cat_slug;

INSERT INTO product_variants (product_id, sku, size, color)
SELECT p.id, v.sku, v.size, v.color
FROM (VALUES
  ('ao-thun-basic',  'AT01-DEN-M',   'M',  'Den'),
  ('ao-thun-basic',  'AT01-DEN-L',   'L',  'Den'),
  ('ao-thun-basic',  'AT01-TRANG-M', 'M',  'Trang'),
  ('quan-jean-slim', 'QJ01-XANH-30', '30', 'Xanh')
) AS v(p_slug, sku, size, color)
JOIN products p ON p.slug = v.p_slug;

-- Nhap kho lan dau bang phieu nhap: trigger tu ghi so cai va cong ton kho
INSERT INTO suppliers (name, phone) VALUES ('Nha cung cap mau', '0900000001');

INSERT INTO goods_receipts (code, supplier_id, created_by, note)
SELECT 'PN0001',
       (SELECT id FROM suppliers WHERE name = 'Nha cung cap mau'),
       (SELECT id FROM users WHERE email = 'admin@shop.local'),
       'Nhap lo dau';

INSERT INTO goods_receipt_items (receipt_id, variant_id, quantity, unit_cost)
SELECT (SELECT id FROM goods_receipts WHERE code = 'PN0001'), pv.id, v.qty, v.cost
FROM (VALUES
  ('AT01-DEN-M',   50,  90000),
  ('AT01-DEN-L',   40,  90000),
  ('AT01-TRANG-M', 30,  90000),
  ('QJ01-XANH-30', 20, 220000)
) AS v(sku, qty, cost)
JOIN product_variants pv ON pv.sku = v.sku;

COMMIT;
