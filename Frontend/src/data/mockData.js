// Mock data aligned 100% with PostgreSQL schema (categories, products, product_variants, coupons)

export const CATEGORIES = [
  { id: 'all', name: 'Tất cả sản phẩm', slug: 'all' },
  { id: 'nu', name: 'Thời Trang Nữ', slug: 'nu' },
  { id: 'nam', name: 'Thời Trang Nam', slug: 'nam' },
  { id: 'unisex', name: 'Unisex & Phụ Kiện', slug: 'unisex' },
  { id: 'sale', name: 'Ưu Đãi Đặc Biệt', slug: 'sale' },
];

export const PRODUCTS = [
  {
    id: 1,
    category_id: 'nu',
    category_name: 'Thời Trang Nữ',
    code: '479073',
    name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
    slug: 'nu-ao-kieu-vai-rayon-co-mo-tay-lung',
    price: 599000,
    cost_price: 320000,
    rating: 4.8,
    reviews_count: 42,
    is_active: true,
    is_featured: true,
    badge: 'Mới về',
    short_desc: 'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại. Chất liệu rayon mềm mại, chống nhăn tự nhiên.',
    details: [
      'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại.',
      'Chiều dài thân áo và tay áo được tinh chỉnh cân đối, mang đến vẻ ngoài chỉn chu, thời trang.',
      'Độ xuyên thấu: Không xuyên thấu (riêng màu 00 WHITE xuyên thấu nhẹ tinh tế).',
      'Dáng áo: Dáng suông thoải mái, tôn dáng.',
      'Sử dụng sợi tái chế thân thiện với môi trường.'
    ],
    material: '76% Viscose (Rayon), 24% Polyester (chứa sợi tái chế cao cấp).',
    care_instructions: 'Giặt máy chế độ nhẹ với nước lạnh, giặt khô nhẹ nhàng, không sấy khô để giữ phom áo.',
    shipping_info: 'Miễn phí vận chuyển cho đơn hàng từ 500.000 VND (phí chuẩn 30.000 VND). Giao nhanh 2-3 ngày.',
    return_policy: 'Hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng cho sản phẩm còn nguyên tem mác.',
    images: [
      '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
      '/images/products/nu_demo/san_pham1/vngoods_10_479073_3x4.avif',
      '/images/products/nu_demo/san_pham1/goods_479073_sub14_3x4.avif',
      '/images/products/nu_demo/san_pham1/vngoods_479073_sub3_3x4.avif',
    ],
    video: '/images/products/nu_demo/san_pham1/video_intro.mp4',
    variants: [
      { id: 101, sku: 'AKN-TRANG-S', color: '00 Trắng', color_code: '#FFFFFF', border: true, size: 'S', stock: 15 },
      { id: 102, sku: 'AKN-TRANG-M', color: '00 Trắng', color_code: '#FFFFFF', border: true, size: 'M', stock: 22 },
      { id: 103, sku: 'AKN-TRANG-L', color: '00 Trắng', color_code: '#FFFFFF', border: true, size: 'L', stock: 18 },
      { id: 104, sku: 'AKN-TRANG-XL', color: '00 Trắng', color_code: '#FFFFFF', border: true, size: 'XL', stock: 8 },
      { id: 105, sku: 'AKN-BE-S', color: '10 Be Nhạt', color_code: '#E8D8C8', size: 'S', stock: 12 },
      { id: 106, sku: 'AKN-BE-M', color: '10 Be Nhạt', color_code: '#E8D8C8', size: 'M', stock: 25 },
      { id: 107, sku: 'AKN-BE-L', color: '10 Be Nhạt', color_code: '#E8D8C8', size: 'L', stock: 14 },
      { id: 108, sku: 'AKN-BE-XL', color: '10 Be Nhạt', color_code: '#E8D8C8', size: 'XL', stock: 5 },
    ]
  },
  {
    id: 2,
    category_id: 'nam',
    category_name: 'Thời Trang Nam',
    code: '381920',
    name: 'Áo Polo Nam Dry Pique Dệt Tổ Ong Kháng Khuẩn',
    slug: 'ao-polo-nam-dry-pique',
    price: 349000,
    cost_price: 160000,
    rating: 4.9,
    reviews_count: 88,
    is_active: true,
    is_featured: true,
    badge: 'Bán chạy',
    short_desc: 'Công nghệ Dry thấm hút mồ hôi siêu tốc, vải pique dệt kim dẻo dai giúp phom áo luôn đứng dáng.',
    details: [
      'Công nghệ dệt tổ ong thoáng khí tuyệt đối.',
      'Cổ bẻ dệt bo dày dặn, không bai dão sau nhiều lần giặt.',
      'Thích hợp mặc đi làm, thể thao và dạo phố.'
    ],
    material: '72% Cotton, 28% Polyester công nghệ Dry.',
    care_instructions: 'Giặt máy bình thường, lộn trái khi phơi.',
    shipping_info: 'Giao hàng tận nơi 2-4 ngày.',
    return_policy: 'Đổi trả miễn phí 7 ngày.',
    images: [
      'https://images.unsplash.com/photo-1625910513413-7fc2a8d13264?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 201, sku: 'APN-DEN-M', color: 'Đen Tuyển', color_code: '#18181b', size: 'M', stock: 30 },
      { id: 202, sku: 'APN-DEN-L', color: 'Đen Tuyển', color_code: '#18181b', size: 'L', stock: 25 },
      { id: 203, sku: 'APN-DEN-XL', color: 'Đen Tuyển', color_code: '#18181b', size: 'XL', stock: 10 },
      { id: 204, sku: 'APN-NAVY-M', color: 'Xanh Navy', color_code: '#1e3a8a', size: 'M', stock: 20 },
      { id: 205, sku: 'APN-NAVY-L', color: 'Xanh Navy', color_code: '#1e3a8a', size: 'L', stock: 15 },
    ]
  },
  {
    id: 3,
    category_id: 'nam',
    category_name: 'Thời Trang Nam',
    code: '192833',
    name: 'Quần Jean Slim Fit Denim Co Giãn Thoải Mái',
    slug: 'quan-jean-slim-fit-denim',
    price: 499000,
    cost_price: 250000,
    rating: 4.7,
    reviews_count: 53,
    is_active: true,
    is_featured: true,
    badge: null,
    short_desc: 'Form dáng ôm vừa vặn ống chân hiện đại, sợi co giãn 4 chiều cho sự năng động cả ngày.',
    details: [
      'Kỹ thuật nhuộm chàm tự nhiên bền màu.',
      'Khóa kéo YKK kim loại chống gỉ siêu bền.',
      'Độ đàn hồi cao không gò bó đầu gối.'
    ],
    material: '98% Cotton Denim, 2% Spandex co giãn.',
    care_instructions: 'Giặt riêng lần đầu, tránh ngâm với chất tẩy mạnh.',
    shipping_info: 'Giao hàng tận nơi toàn quốc.',
    return_policy: 'Hỗ trợ đổi size trong 7 ngày.',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 301, sku: 'QJ-XANH-29', color: 'Xanh Chàm Đậm', color_code: '#1e293b', size: '29', stock: 12 },
      { id: 302, sku: 'QJ-XANH-30', color: 'Xanh Chàm Đậm', color_code: '#1e293b', size: '30', stock: 24 },
      { id: 303, sku: 'QJ-XANH-31', color: 'Xanh Chàm Đậm', color_code: '#1e293b', size: '31', stock: 18 },
      { id: 304, sku: 'QJ-XANH-32', color: 'Xanh Chàm Đậm', color_code: '#1e293b', size: '32', stock: 10 },
    ]
  },
  {
    id: 4,
    category_id: 'unisex',
    category_name: 'Unisex & Phụ Kiện',
    code: '582012',
    name: 'Áo Khoác Gió Siêu Nhẹ Kháng Nước UV Cut',
    slug: 'ao-khoac-gio-sieu-nhe-uv-cut',
    price: 450000,
    cost_price: 210000,
    rating: 4.9,
    reviews_count: 67,
    is_active: true,
    is_featured: false,
    badge: 'Chống UV',
    short_desc: 'Gấp gọn bỏ túi du lịch, chống tia tử ngoại UPF50+, chống mưa nhẹ chống gió hiệu quả.',
    details: [
      'Trọng lượng siêu nhẹ chỉ 140g.',
      'Khả năng chống thấm trượt nước bề mặt Water-repellent.',
      'Kèm túi rút đựng áo siêu tiện dụng khi đi phượt.'
    ],
    material: '100% Nylon siêu bền mật độ cao.',
    care_instructions: 'Nên giặt tay hoặc dùng túi giặt để giữ lớp chống thấm.',
    shipping_info: 'Giao hàng 2-3 ngày.',
    return_policy: 'Hỗ trợ đổi trả 7 ngày.',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 401, sku: 'AKG-XAM-S', color: 'Xám Khói', color_code: '#94a3b8', size: 'S', stock: 15 },
      { id: 402, sku: 'AKG-XAM-M', color: 'Xám Khói', color_code: '#94a3b8', size: 'M', stock: 20 },
      { id: 403, sku: 'AKG-XAM-L', color: 'Xám Khói', color_code: '#94a3b8', size: 'L', stock: 15 },
      { id: 404, sku: 'AKG-DEN-M', color: 'Đen Mờ', color_code: '#0f172a', size: 'M', stock: 25 },
      { id: 405, sku: 'AKG-DEN-L', color: 'Đen Mờ', color_code: '#0f172a', size: 'L', stock: 18 },
    ]
  },
  {
    id: 5,
    category_id: 'nu',
    category_name: 'Thời Trang Nữ',
    code: '772911',
    name: 'Đầm Xòe Nữ Cổ Vuông Dệt Kim Vintage',
    slug: 'dam-xoe-nu-co-vuong-vintage',
    price: 689000,
    cost_price: 360000,
    rating: 5.0,
    reviews_count: 29,
    is_active: true,
    is_featured: true,
    badge: 'Cao cấp',
    short_desc: 'Thiết kế tôn eo con kiến, chi tiết cổ vuông khoe xương quai xanh thanh tú, chất vải rủ mềm mại.',
    details: [
      'Lót lụa mềm bên trong không lo lộ.',
      'Khóa kéo sườn ẩn tinh tế.',
      'Phù hợp tiệc trà, dạo phố và hẹn hò.'
    ],
    material: 'Chiffon lụa cao cấp kết hợp sợi Polyeste dập ly.',
    care_instructions: 'Khuyến khích giặt khô hoặc giặt tay với sữa tắm.',
    shipping_info: 'Miễn phí giao hàng toàn quốc.',
    return_policy: 'Hỗ trợ đổi mẫu trong 7 ngày.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 501, sku: 'DXN-DO-S', color: 'Đỏ Rượu Vang', color_code: '#881337', size: 'S', stock: 8 },
      { id: 502, sku: 'DXN-DO-M', color: 'Đỏ Rượu Vang', color_code: '#881337', size: 'M', stock: 12 },
      { id: 503, sku: 'DXN-DEN-S', color: 'Đen Dạ Tiệc', color_code: '#09090b', size: 'S', stock: 14 },
      { id: 504, sku: 'DXN-DEN-M', color: 'Đen Dạ Tiệc', color_code: '#09090b', size: 'M', stock: 16 },
    ]
  }
];

export const COUPONS = [
  {
    code: 'WELCOME10',
    name: 'Giảm 10% khách hàng mới',
    discount_type: 'percent',
    discount_value: 10,
    max_discount: 60000,
    min_order: 200000,
  },
  {
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển',
    discount_type: 'fixed',
    discount_value: 30000,
    max_discount: 30000,
    min_order: 400000,
  },
  {
    code: 'SHOP50K',
    name: 'Giảm trực tiếp 50K',
    discount_type: 'fixed',
    discount_value: 50000,
    max_discount: 50000,
    min_order: 600000,
  }
];

