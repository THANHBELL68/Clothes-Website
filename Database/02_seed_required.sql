-- =====================================================================
-- 02_seed_required.sql - DU LIEU KHOI TAO BAT BUOC
-- Vai tro, quyen, phan quyen theo vai tro, cau hinh he thong.
--
-- Chay SAU 01_schema.sql. Can co o MOI moi truong (dev, test, production).
-- Khong chua tai khoan hay mat khau nao.
-- =====================================================================

SET client_encoding = 'UTF8';
BEGIN;
-- ---------------------------------------------------------------------
-- DU LIEU KHOI TAO: VAI TRO, QUYEN, CAU HINH
-- ---------------------------------------------------------------------
INSERT INTO roles (code, name, description) VALUES
  ('customer',  'Khach hang thanh vien',          'Dang ky, dat hang, doi tra, tich diem'),
  ('warehouse', 'Quan ly kho',                    'San pham, nhap/xuat/kiem ke kho, cap nhat trang thai don'),
  ('cskh',      'Nhan vien CSKH / Xu ly don hang','Ho tro khach, duyet doi tra, kiem duyet danh gia, live chat'),
  ('admin',     'Admin toi cao',                  'Toan quyen he thong, tai khoan, phan quyen, cau hinh, bao cao');

INSERT INTO permissions (code, description) VALUES
  -- Chung cho moi tai khoan dang nhap
  ('profile.manage',      'Xem va sua ho so ca nhan cua chinh minh'),
  -- Khach hang
  ('address.manage',      'Quan ly so dia chi'),
  ('cart.manage',         'Gio hang, mua ngay'),
  ('order.create',        'Dat hang, ap ma giam gia / dung diem loyalty'),
  ('order.view_own',      'Xem lich su don hang cua minh'),
  ('order.cancel_own',    'Tu huy don khi con Moi/Dang xu ly'),
  ('return.create',       'Gui yeu cau doi/tra hang'),
  ('loyalty.use',         'Tich diem va doi qua'),
  ('wishlist.manage',     'San pham yeu thich'),
  ('review.create',       'Viet danh gia va binh luan san pham da mua'),
  ('chat.use',            'Chat voi nhan vien'),
  -- Quan ly kho
  ('catalog.manage',      'Them/sua/xoa/an hien danh muc, san pham, bien the'),
  ('stock.receipt',       'Tao phieu nhap kho'),
  ('stock.issue',         'Tao phieu xuat kho'),
  ('stock.stocktake',     'Kiem ke va cap nhat ton kho'),
  ('stock.report',        'Xem bao cao ton kho, lich su nhap/xuat'),
  ('order.update_status', 'Chuyen trang thai don hang'),
  ('return.confirm_receipt','Xac nhan da nhan hang doi/tra, cap nhat ton kho'),
  -- CSKH
  ('order.view_any',      'Xem lich su don hang cua bat ky khach nao'),
  ('return.review',       'Duyet/tu choi yeu cau doi tra, theo doi hoan tien'),
  ('review.moderate',     'Duyet/an danh gia san pham'),
  ('chat.reply',          'Tra loi live chat'),
  -- Admin
  ('user.view',           'Xem danh sach khach hang va nhan vien'),
  ('user.manage',         'Tao/sua/khoa/xoa tai khoan'),
  ('role.assign',         'Gan hoac doi vai tro cho nhan vien'),
  ('system.config',       'Cau hinh he thong (thanh toan, van chuyen...)'),
  ('audit.view',          'Xem nhat ky hoat dong'),
  ('report.view_all',     'Bao cao doanh thu, don hang, ton kho toan he thong'),
  ('marketing.manage',    'Loyalty, voucher, chien dich marketing (Giai doan 2)');

-- Admin toi cao: toan bo quyen
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'admin';

-- Cac vai tro con lai
WITH m(role_code, codes) AS (VALUES
  ('customer',  ARRAY['profile.manage','address.manage','cart.manage','order.create','order.view_own',
                      'order.cancel_own','return.create','loyalty.use','wishlist.manage','review.create','chat.use']),
  ('warehouse', ARRAY['profile.manage','catalog.manage','stock.receipt','stock.issue','stock.stocktake',
                      'stock.report','order.update_status','order.view_any','return.confirm_receipt']),
  ('cskh',      ARRAY['profile.manage','order.view_any','return.review','review.moderate','chat.reply'])
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM m
JOIN roles r ON r.code = m.role_code
JOIN permissions p ON p.code = ANY (m.codes);

INSERT INTO system_settings (setting_key, value, description) VALUES
  ('payment.cod_enabled',       'true',  'Cho phep thanh toan khi nhan hang'),
  ('payment.bank_qr_info',      '',      'Thong tin tai khoan nhan chuyen khoan QR'),
  ('shipping.default_fee',      '30000', 'Phi van chuyen mac dinh (VND)'),
  ('shipping.free_from',        '500000','Mien phi van chuyen tu gia tri don (VND)'),
  ('return.window_days',        '7',     'So ngay cho phep doi/tra sau khi hoan thanh don'),
  ('loyalty.earn_vnd_per_point','10000', 'Bao nhieu VND mua hang thi duoc 1 diem'),
  ('loyalty.point_value_vnd',   '1000',  'Moi diem tru duoc bao nhieu VND');


COMMIT;
