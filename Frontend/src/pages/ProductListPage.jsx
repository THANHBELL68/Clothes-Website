import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price_asc' | 'price_desc'
  const [maxPrice, setMaxPrice] = useState(1000000);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Lọc danh mục
      if (currentCategory !== 'all' && item.category_id !== currentCategory) {
        return false;
      }
      // Lọc tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code?.toLowerCase().includes(q);
        const matchDesc = item.short_desc?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDesc) return false;
      }
      // Lọc giá
      if (item.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return b.rating - a.rating; // Phổ biến / đánh giá cao
    });
  }, [currentCategory, searchQuery, sortBy, maxPrice]);

  return (
    <div className="space-y-8">
      
      {/* Header trang danh sách */}
      <div className="border-b border-neutral-200/80 pb-6">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
          {searchQuery
            ? `Kết quả tìm kiếm cho: "${searchQuery}"`
            : CATEGORIES.find((c) => c.id === currentCategory)?.name || 'Bộ Sưu Tập Trang Phục'}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Hiển thị {filteredProducts.length} sản phẩm phù hợp với tiêu chí lọc từ cơ sở dữ liệu
        </p>
      </div>

      {/* Categories Pills & Controls góc cạnh Liquid Glass */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams);
                if (cat.id === 'all') {
                  nextParams.delete('category');
                } else {
                  nextParams.set('category', cat.id);
                }
                setSearchParams(nextParams);
              }}
              className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                currentCategory === cat.id
                  ? 'liquid-glass-btn-accent text-white shadow-md'
                  : 'liquid-glass-btn text-neutral-800 bg-white/70'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Price Filter controls */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-white/80 liquid-glass px-3 py-1.5 rounded-sm border">
            <span>Giá tối đa:</span>
            <input
              type="range"
              min="200000"
              max="1000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-amber-600"
            />
            <span className="font-mono font-black text-neutral-900">{(maxPrice / 1000).toLocaleString('vi-VN')}K</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-white/80 liquid-glass px-3 py-1.5 rounded-sm border">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="popular">Được đánh giá cao</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid sản phẩm */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/70 liquid-glass rounded-sm border border-neutral-300">
          <p className="text-neutral-500 text-xs font-bold">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
          <button
            onClick={() => {
              setMaxPrice(1000000);
              setSearchParams({});
            }}
            className="mt-4 px-4 py-2 liquid-glass-btn-accent text-white text-xs font-bold uppercase tracking-wider rounded-sm"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

    </div>
  );
}
