// Mock data theo chuẩn CSDL PostgreSQL (categories, products, product_variants, coupons)
// Đã xóa Trẻ em và Em bé theo yêu cầu, chỉ còn 2 danh mục: NỮ và NAM

export const CATEGORIES = [
  { id: 'all', name: 'TẤT CẢ', slug: 'all' },
  { id: 'nu', name: 'NỮ', slug: 'nu' },
  { id: 'nam', name: 'NAM', slug: 'nam' },
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
    rating: 4.9,
    reviews_count: 56,
    is_active: true,
    is_featured: true,
    badge: 'MỚI VỀ',
    collection: 'BST Thu/Đông 2026',
    short_desc: 'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại. Chiều dài thân áo và tay áo được tinh chỉnh cân đối, mang đến vẻ ngoài chỉn chu, thời trang.',
    details: [
      'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại.',
      'Chiều dài thân áo và tay áo được tinh chỉnh cân đối, mang đến vẻ ngoài chỉn chu, thời trang.',
      'Độ xuyên thấu: Không xuyên thấu (Chỉ 00 WHITE xuyên thấu nhẹ tinh tế).',
      'Dáng áo: Dáng thoải mái, tôn dáng tự nhiên.',
      'Quần áo sử dụng vật liệu tái chế là một phần trong nỗ lực của chúng tôi nhằm hỗ trợ giảm thiểu chất thải và bảo vệ tài nguyên.',
      'Mã sản phẩm: 479073 (487527, 482824).',
      'Sản xuất: China, Vietnam.',
      'Được kiểm định an toàn chất lượng và dệt may theo tiêu chuẩn trách nhiệm chuỗi cung ứng.'
    ],
    material: '76% Visco, 24% Polyeste (24% Sử Dụng Sợi Polyeste Tái Chế).',
    care_instructions: 'Giặt máy nước lạnh, giặt nhẹ, Giặt khô, Không sấy khô.',
    shipping_info: 'Phí giao hàng: 50,000 VND cho đơn hàng dưới 500,000 VND và MIỄN PHÍ cho đơn hàng từ 500,000 VND trở lên; Giao hàng đến cửa hàng được miễn phí vận chuyển.',
    return_policy: 'Đổi hàng: Có thể đổi hàng tại bất kỳ cửa hàng trên toàn quốc. Trả hàng: Áp dụng trực tuyến trong vòng 30 ngày.',
    images: [
      '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
      '/images/products/nu_demo/san_pham1/vngoods_10_479073_3x4.avif',
      '/images/products/nu_demo/san_pham1/vngoods_479073_sub3_3x4.avif',
      '/images/products/nu_demo/san_pham1/goods_479073_sub14_3x4.avif',
    ],
    video: '/images/products/nu_demo/san_pham1/video_intro.mp4',
    variants: [
      { id: 101, sku: 'AKN-479073-00-S', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'S', stock: 24 },
      { id: 102, sku: 'AKN-479073-00-M', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'M', stock: 35 },
      { id: 103, sku: 'AKN-479073-00-L', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'L', stock: 18 },
      { id: 104, sku: 'AKN-479073-00-XL', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'XL', stock: 10 },
      { id: 105, sku: 'AKN-479073-10-S', color: '10 BEIGE', color_code: '#E8D8C8', size: 'S', stock: 15 },
      { id: 106, sku: 'AKN-479073-10-M', color: '10 BEIGE', color_code: '#E8D8C8', size: 'M', stock: 28 },
      { id: 107, sku: 'AKN-479073-10-L', color: '10 BEIGE', color_code: '#E8D8C8', size: 'L', stock: 20 },
      { id: 108, sku: 'AKN-479073-10-XL', color: '10 BEIGE', color_code: '#E8D8C8', size: 'XL', stock: 8 },
    ]
  },
  {
    id: 2,
    category_id: 'nam',
    category_name: 'Thời Trang Nam',
    code: '486116',
    name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió Kéo Khóa',
    slug: 'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa',
    price: 899000,
    cost_price: 490000,
    rating: 4.9,
    reviews_count: 73,
    is_active: true,
    is_featured: true,
    badge: 'MỚI VỀ',
    collection: 'BST Thu/Đông 2026',
    short_desc: 'Dây rút ở gấu áo giúp điều chỉnh phom dáng linh hoạt. Chất liệu giả lông cừu cản gió ấm áp vượt trội cho mùa lạnh.',
    details: [
      'Dây rút ở gấu áo giúp điều chỉnh phom dáng.',
      'Chi tiết về chức năng:',
      '- Độ xuyên thấu: Không xuyên thấu.',
      '- Dáng: Dáng suông hiện đại, phóng khoáng.',
      'Mã sản phẩm: 486116.',
      'Sản xuất: Vietnam.',
      'Thương hiệu liên tục nỗ lực nâng cao chất lượng quần áo và duy trì các tiêu chuẩn sản xuất an toàn và có trách nhiệm.'
    ],
    material: 'Vải Ngoài: 100% Polyeste / Lớp Lót: 100% Polyeste / Vải Túi: 100% Polyeste.',
    care_instructions: 'Giặt máy nước lạnh, giặt nhẹ, Không giặt khô, Không sấy khô.',
    shipping_info: 'Phí giao hàng: 50,000 VND cho đơn hàng dưới 500,000 VND và MIỄN PHÍ cho đơn hàng từ 500,000 VND trở lên; Giao hàng đến cửa hàng được miễn phí vận chuyển.',
    return_policy: 'Đổi hàng: Có thể đổi hàng tại bất kỳ cửa hàng trên toàn quốc. Trả hàng: Áp dụng trực tuyến trong vòng 30 ngày.',
    images: [
      '/images/products/nam_demo/san_pham1/vngoods_69_486116_3x4.avif',
      '/images/products/nam_demo/san_pham1/vngoods_486116_sub3_3x4.avif',
      '/images/products/nam_demo/san_pham1/vngoods_486116_sub4_3x4.avif',
      '/images/products/nam_demo/san_pham1/goods_486116_sub11_3x4.avif',
      '/images/products/nam_demo/san_pham1/goods_486116_sub20_3x4.avif',
    ],
    video: '/images/products/nam_demo/san_pham1/video_intro_nam.mp4',
    variants: [
      { id: 201, sku: 'AKN-486116-69-S', color: '69 NAVY', color_code: '#1e293b', size: 'S', stock: 20 },
      { id: 202, sku: 'AKN-486116-69-M', color: '69 NAVY', color_code: '#1e293b', size: 'M', stock: 30 },
      { id: 203, sku: 'AKN-486116-69-L', color: '69 NAVY', color_code: '#1e293b', size: 'L', stock: 25 },
      { id: 204, sku: 'AKN-486116-69-XL', color: '69 NAVY', color_code: '#1e293b', size: 'XL', stock: 12 },
      { id: 205, sku: 'AKN-486116-30-S', color: '30 NATURAL', color_code: '#f5f5f0', border: true, size: 'S', stock: 18 },
      { id: 206, sku: 'AKN-486116-30-M', color: '30 NATURAL', color_code: '#f5f5f0', border: true, size: 'M', stock: 32 },
      { id: 207, sku: 'AKN-486116-30-L', color: '30 NATURAL', color_code: '#f5f5f0', border: true, size: 'L', stock: 22 },
      { id: 208, sku: 'AKN-486116-30-XL', color: '30 NATURAL', color_code: '#f5f5f0', border: true, size: 'XL', stock: 10 },
    ]
  }
];

export const COUPONS = [
  {
    code: 'WELCOME10',
    name: 'Giảm 10% cho khách hàng mới',
    discount_type: 'percent',
    discount_value: 10,
    max_discount: 100000,
    min_order: 300000,
  },
  {
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển toàn quốc',
    discount_type: 'fixed',
    discount_value: 50000,
    max_discount: 50000,
    min_order: 500000,
  },
  {
    code: 'WINTER2026',
    name: 'Ưu đãi Bộ sưu tập Thu/Đông 50K',
    discount_type: 'fixed',
    discount_value: 50000,
    max_discount: 50000,
    min_order: 700000,
  }
];
