-- =====================================================================
-- 03_seed_demo.sql - DU LIEU MAU (CHI DUNG KHI PHAT TRIEN / THU GIAO DIEN)
--
-- KHONG chay tren production.
-- Chay SAU 01_schema.sql va 02_seed_required.sql, tren database con trong du lieu mau.
-- Chay 2 lan se loi trung (phone, slug, sku, code da ton tai).
--
-- Luu y: dong phieu kho la bang chi-them-dong (trigger chan sua/xoa), nen KHONG
-- xoa tung dong du lieu mau nay duoc. Muon bo di thi tao lai database tu dau (01, 02).
-- =====================================================================

SET client_encoding = 'UTF8';
BEGIN;

-- Tai khoan admin mau: password_hash dang bi khoa, khong dang nhap duoc.
-- Ung dung phai dat mat khau that (bam bcrypt/argon2) truoc khi dung.
INSERT INTO users (phone, email, password_hash, full_name, user_type)
VALUES ('0900000000', 'admin@shop.local', '!CHUA_DAT_MAT_KHAU', 'Admin (demo)', 'staff');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.phone = '0900000000' AND r.code = 'SUPER_ADMIN';

-- Danh muc thuoc tinh
INSERT INTO sizes (name, sort_order) VALUES ('S',1), ('M',2), ('L',3), ('XL',4), ('29',10), ('30',11), ('31',12);
INSERT INTO colors (name, hex_code) VALUES ('Den','#000000'), ('Trang','#FFFFFF'), ('Xanh','#1F3A93');
INSERT INTO materials (name) VALUES ('Cotton'), ('Denim');

INSERT INTO shipping_carriers (code, name) VALUES ('GHN', 'Giao Hang Nhanh'), ('GHTK', 'Giao Hang Tiet Kiem');

INSERT INTO categories (name, slug, sort_order) VALUES
  ('Ao thun',   'ao-thun',   1),
  ('Quan jean', 'quan-jean', 2);

INSERT INTO products (category_id, name, slug, base_price, created_by)
SELECT c.id, v.name, v.slug, v.price, (SELECT id FROM users WHERE phone = '0900000000')
FROM (VALUES
  ('ao-thun',   'Ao thun basic',  'ao-thun-basic',  199000),
  ('quan-jean', 'Quan jean slim', 'quan-jean-slim', 450000)
) AS v(cat_slug, name, slug, price)
JOIN categories c ON c.slug = v.cat_slug;

-- Them bien the: trigger tu tao dong inventories = 0
INSERT INTO product_variants (product_id, sku, size_id, color_id, material_id, price)
SELECT p.id, v.sku, s.id, c.id, m.id, v.price
FROM (VALUES
  ('ao-thun-basic',  'AT01-DEN-M',   'M',  'Den',   'Cotton', 199000),
  ('ao-thun-basic',  'AT01-DEN-L',   'L',  'Den',   'Cotton', 199000),
  ('ao-thun-basic',  'AT01-TRANG-M', 'M',  'Trang', 'Cotton', 199000),
  ('quan-jean-slim', 'QJ01-XANH-30', '30', 'Xanh',  'Denim',  450000)
) AS v(p_slug, sku, size, color, material, price)
JOIN products  p ON p.slug = v.p_slug
JOIN sizes     s ON s.name = v.size
JOIN colors    c ON c.name = v.color
JOIN materials m ON m.name = v.material;

-- Nhap kho lan dau bang phieu nhap: trigger tu cong ton kho
INSERT INTO suppliers (name, phone) VALUES ('Nha cung cap mau', '0900000001');

INSERT INTO stock_documents (code, type, supplier_id, created_by, note)
SELECT 'PN0001', 'import',
       (SELECT id FROM suppliers WHERE name = 'Nha cung cap mau'),
       (SELECT id FROM users WHERE phone = '0900000000'),
       'Nhap lo dau';

INSERT INTO stock_document_items (stock_document_id, variant_id, quantity, unit_cost)
SELECT (SELECT id FROM stock_documents WHERE code = 'PN0001'), pv.id, v.qty, v.cost
FROM (VALUES
  ('AT01-DEN-M',   50,  90000),
  ('AT01-DEN-L',   40,  90000),
  ('AT01-TRANG-M', 30,  90000),
  ('QJ01-XANH-30', 20, 220000)
) AS v(sku, qty, cost)
JOIN product_variants pv ON pv.sku = v.sku;

COMMIT;
