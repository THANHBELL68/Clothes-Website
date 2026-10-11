-- =====================================================================
-- 02_seed_required.sql - DU LIEU KHOI TAO BAT BUOC
-- Vai tro, quyen, phan quyen theo vai tro, cau hinh he thong.
-- Ma vai tro / ma quyen theo dung phan ghi chu trong schema_ban_hang_thoi_trang.dbml.
--
-- Chay SAU 01_schema.sql. Can co o MOI moi truong (dev, test, production).
-- Khong chua tai khoan hay mat khau nao.
-- =====================================================================

SET client_encoding = 'UTF8';
BEGIN;

-- ---------------------------------------------------------------------
-- VAI TRO
-- Khach vang lai (GUEST) khong co tai khoan nen khong co dong trong roles;
-- quyen cua GUEST (PRODUCT_VIEW, PRODUCT_SEARCH, GUEST_CHECKOUT, GUEST_RETURN_REQUEST,
-- ACCOUNT_REGISTER, LIVECHAT_USE) duoc xu ly o tang ung dung.
-- Tai khoan customer tu duoc gan CUSTOMER khi tao (trigger); vai tro nhan vien chi gan cho tai khoan staff.
-- ---------------------------------------------------------------------
INSERT INTO roles (code, name, description) VALUES
  ('CUSTOMER',          'Khach hang thanh vien',            'Dat hang, doi tra, tich diem, yeu thich, danh gia'),
  ('WAREHOUSE_MANAGER', 'Quan ly kho',                      'San pham, nhap/xuat/kiem ke kho, cap nhat trang thai don'),
  ('CS_STAFF',          'Nhan vien CSKH / Xu ly don hang',  'Xem don, duyet doi tra, theo doi hoan tien, kiem duyet danh gia, live chat'),
  ('SUPER_ADMIN',       'Admin toi cao',                    'Toan quyen he thong');

-- ---------------------------------------------------------------------
-- QUYEN
-- ---------------------------------------------------------------------
INSERT INTO permissions (code, name, module) VALUES
  -- Khach (vang lai + thanh vien)
  ('PRODUCT_VIEW',           'Xem san pham',                                'catalog'),
  ('PRODUCT_SEARCH',         'Tim kiem, loc san pham',                      'catalog'),
  ('GUEST_CHECKOUT',         'Dat hang khong can tai khoan',                'order'),
  ('GUEST_RETURN_REQUEST',   'Khach vang lai gui doi/tra (xac minh ma don + SDT + OTP)', 'return'),
  ('LIVECHAT_USE',           'Chat voi nhan vien',                          'cskh'),
  ('ACCOUNT_REGISTER',       'Dang ky tai khoan',                           'account'),
  -- Khach hang thanh vien
  ('PROFILE_MANAGE',         'Xem va sua ho so ca nhan',                    'account'),
  ('ADDRESS_MANAGE',         'Quan ly so dia chi',                          'account'),
  ('CART_ORDER',             'Gio hang va dat hang',                        'order'),
  ('BUY_NOW',                'Mua ngay tu trang chi tiet',                  'order'),
  ('VOUCHER_LOYALTY_APPLY',  'Ap voucher / dung diem khi dat hang',         'order'),
  ('ORDER_HISTORY_OWN',      'Xem lich su don hang cua minh',               'order'),
  ('ORDER_CANCEL_OWN',       'Tu huy don khi con Moi / Dang xu ly',         'order'),
  ('RETURN_REQUEST_CREATE',  'Gui yeu cau doi / tra hang',                  'return'),
  ('LOYALTY_REDEEM',         'Doi diem lay qua',                            'loyalty'),
  ('WISHLIST_MANAGE',        'San pham yeu thich',                          'catalog'),
  ('REVIEW_CREATE',          'Danh gia san pham da mua',                    'review'),
  -- Quan ly kho
  ('PRODUCT_MANAGE',         'Them/sua/xoa/an hien danh muc, san pham, bien the', 'catalog'),
  ('STOCK_IO_MANAGE',        'Tao phieu nhap / xuat kho',                   'warehouse'),
  ('STOCKTAKE_MANAGE',       'Kiem ke kho',                                 'warehouse'),
  ('ORDER_STATUS_UPDATE',    'Chuyen don sang dong goi / giao hang / hoan thanh', 'order'),
  ('RETURN_RECEIVE_CONFIRM', 'Xac nhan da nhan hang doi / tra',             'return'),
  ('WAREHOUSE_REPORT_VIEW',  'Xem bao cao kho',                             'warehouse'),
  -- CSKH
  ('ORDER_HISTORY_ALL_VIEW', 'Xem moi don hang (ca khach vang lai)',        'order'),
  ('ORDER_CONFIRM_CANCEL',   'Xac nhan don moi (new -> processing), huy don theo yeu cau khach', 'order'),
  ('RETURN_REQUEST_REVIEW',  'Duyet / tu choi yeu cau doi tra',             'cskh'),
  ('REFUND_TRACK',           'Theo doi hoan tien',                          'cskh'),
  ('REVIEW_MODERATE',        'Kiem duyet danh gia',                         'cskh'),
  ('LIVECHAT_REPLY',         'Tra loi live chat',                           'cskh'),
  -- Admin
  ('USER_VIEW',              'Xem danh sach tai khoan',                     'system'),
  ('ACCOUNT_ROLE_MANAGE',    'Quan ly tai khoan va gan vai tro',            'system'),
  ('SYSTEM_CONFIG',          'Cau hinh he thong',                           'system'),
  ('LOG_VIEW',               'Xem nhat ky hoat dong',                       'system'),
  ('REPORT_ALL_VIEW',        'Xem toan bo bao cao',                         'system'),
  ('MARKETING_MANAGE',       'Quan ly marketing, voucher, loyalty (giai doan 2)', 'marketing');

-- ---------------------------------------------------------------------
-- PHAN QUYEN THEO VAI TRO
-- ---------------------------------------------------------------------
-- SUPER_ADMIN: toan bo quyen. Trigger trg_permission_grant_admin da tu gan khi INSERT permissions o tren
-- (quyen them sau nay cung tu gan), nen admin luon xem duoc moi don hang (ORDER_HISTORY_ALL_VIEW).

WITH m(role_code, codes) AS (VALUES
  ('CUSTOMER',          ARRAY['PRODUCT_VIEW','PRODUCT_SEARCH','PROFILE_MANAGE','ADDRESS_MANAGE',
                              'CART_ORDER','BUY_NOW','VOUCHER_LOYALTY_APPLY','ORDER_HISTORY_OWN',
                              'ORDER_CANCEL_OWN','RETURN_REQUEST_CREATE','LOYALTY_REDEEM',
                              'WISHLIST_MANAGE','REVIEW_CREATE','LIVECHAT_USE']),
  -- Kho can xem don de dong goi / xuat kho
  ('WAREHOUSE_MANAGER', ARRAY['PRODUCT_MANAGE','STOCK_IO_MANAGE','STOCKTAKE_MANAGE',
                              'ORDER_HISTORY_ALL_VIEW','ORDER_STATUS_UPDATE','RETURN_RECEIVE_CONFIRM',
                              'WAREHOUSE_REPORT_VIEW','PROFILE_MANAGE']),
  -- CSKH xu ly don: xac nhan / huy don; con dong goi, giao hang do kho
  ('CS_STAFF',          ARRAY['ORDER_HISTORY_ALL_VIEW','ORDER_CONFIRM_CANCEL','RETURN_REQUEST_REVIEW',
                              'REFUND_TRACK','REVIEW_MODERATE','LIVECHAT_REPLY','PROFILE_MANAGE'])
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM m
JOIN roles r       ON r.code = m.role_code
JOIN permissions p ON p.code = ANY (m.codes);

-- ---------------------------------------------------------------------
-- CAU HINH HE THONG
-- ---------------------------------------------------------------------
INSERT INTO system_settings (key, value, group_name) VALUES
  ('payment.cod_enabled',        'true',   'payment'),
  ('payment.bank_qr_info',       '',       'payment'),
  ('shipping.default_fee',       '30000',  'shipping'),
  ('shipping.free_from',         '500000', 'shipping'),
  ('return.window_days',         '7',      'general'),
  ('cart.guest_ttl_days',        '30',     'general'),
  ('loyalty.earn_vnd_per_point', '10000',  'general'),
  ('loyalty.point_value_vnd',    '1000',   'general');

COMMIT;
