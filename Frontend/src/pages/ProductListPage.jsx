import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
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
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
          {searchQuery
            ? `Kết quả tìm kiếm cho: "${searchQuery}"`
            : CATEGORIES.find((c) => c.id === currentCategory)?.name || 'Bộ Sưu Tập Trang Phục'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Hiển thị {filteredProducts.length} sản phẩm phù hợp với tiêu chí lọc của bạn
        </p>
      </div>

      {/* Categories Pills & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        {/* Category Pills */}
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
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                currentCategory === cat.id
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Price Filter controls */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
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
            <span className="font-bold text-neutral-900">{(maxPrice / 1000).toLocaleString('vi-VN')}K</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-100 border-none rounded-lg px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-none"
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
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
          <p className="text-neutral-500 font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
          <button
            onClick={() => {
              setMaxPrice(1000000);
              setSearchParams({});
            }}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

    </div>
  );
}

