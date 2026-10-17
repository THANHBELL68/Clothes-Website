import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowUpDown, Filter, Search, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { useDbStore } from '../store/dbStore';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price_asc' | 'price_desc'
  const [maxPrice, setMaxPrice] = useState(1500000);

  const rawProducts = useDbStore((state) => state.products);
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        if (!item) return false;
        // Lọc danh mục
        if (currentCategory !== 'all' && item.category_id !== currentCategory) {
          return false;
        }
        // Lọc tìm kiếm
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = String(item.name || '').toLowerCase().includes(q);
          const matchCode = String(item.code || '').toLowerCase().includes(q);
          const matchDesc = String(item.short_desc || '').toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchDesc) return false;
        }
        // Lọc giá
        if (item.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
        return (b.rating || 5) - (a.rating || 5);
      });
  }, [products, currentCategory, searchQuery, sortBy, maxPrice]);

  const handleCategoryChange = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              CATALOG // 01
            </span>
          </div>
          <h1 className="font-inter font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
            {searchQuery
              ? `KẾT QUẢ TÌM KIẾM: "${searchQuery}"`
              : currentCategory === 'nu'
              ? 'THỜI TRANG NỮ [BST RAYON 479073]'
              : currentCategory === 'nam'
              ? 'THỜI TRANG NAM [BST LÔNG CỪU 486116]'
              : 'TOÀN BỘ BỘ SƯU TẬP'}
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Trang phục Streetwear & Techwear kỹ thuật cao, tối ưu công năng cho cuộc sống hiện đại.
          </p>
        </div>

        <div className="font-mono text-xs text-zinc-400 border border-zinc-800 bg-zinc-950/60 px-3.5 py-2">
          <span>TÌM THẤY: </span>
          <strong className="text-white">{filteredProducts.length} THIẾT KẾ</strong>
        </div>
      </div>

      {/* Filter Bar 1px Swiss Grid */}
      <div className="p-4 bg-[#0c0c0c] border border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider border transition-all cursor-pointer ${
              currentCategory === 'all'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            TẤT CẢ
          </button>

          <button
            onClick={() => handleCategoryChange('nu')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider border transition-all cursor-pointer ${
              currentCategory === 'nu'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            NỮ (RAYON 479073)
          </button>

          <button
            onClick={() => handleCategoryChange('nam')}
            className={`px-3 py-1.5 uppercase font-bold tracking-wider border transition-all cursor-pointer ${
              currentCategory === 'nam'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            NAM (LÔNG CỪU 486116)
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 uppercase text-[10px]">SẮP XẾP:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#161616] border border-zinc-800 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
          >
            <option value="popular">Đánh giá cao nhất ★</option>
            <option value="price_asc">Giá tăng dần &uarr;</option>
            <option value="price_desc">Giá giảm dần &darr;</option>
          </select>
        </div>

      </div>

      {/* Grid Sản Phẩm */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 max-w-lg mx-auto p-8 border border-zinc-800 bg-[#0c0c0c] space-y-4 font-mono">
          <h3 className="font-bold text-white text-base uppercase">KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP</h3>
          <p className="text-xs text-zinc-400 font-sans">
            Không có sản phẩm nào thỏa mãn điều kiện lọc. Vui lòng chọn lại danh mục hoặc từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => handleCategoryChange('all')}
            className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-wider text-xs cursor-pointer"
          >
            XEM TẤT CẢ SẢN PHẨM
          </button>
        </div>
      )}

    </div>
  );
}
