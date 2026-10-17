import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useDbStore } from '../store/dbStore';

export default function AetherSearchModal({ isOpen, onClose, onSelectGarment }) {
  const [query, setQuery] = useState('');
  const rawProducts = useDbStore((state) => state.products);
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = (query || '').trim().toLowerCase();
  const filtered = products.filter((item) => {
    if (!item) return false;
    const name = String(item.name || '').toLowerCase();
    const code = String(item.code || '').toLowerCase();
    const cat = String(item.category_name || item.category?.name || '').toLowerCase();
    const mat = String(item.material || '').toLowerCase();
    return name.includes(q) || code.includes(q) || cat.includes(q) || mat.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#080808] border border-zinc-800 text-white shadow-2xl z-10 overflow-hidden">
        
        {/* Search input bar with 1px border */}
        <div className="flex items-center px-4 border-b border-zinc-800 h-14 gap-3 bg-zinc-950/60">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            autoFocus
            placeholder="TÌM KIẾM SẢN PHẨM, MÃ SP (VÍ DỤ: 479073, 486116, RAYON, LÔNG CỪU)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent font-mono text-xs tracking-wider text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 border border-zinc-800 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-zinc-900 p-4">
          <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mb-3">
            KẾT QUẢ TÌM KIẾM ({filtered.length})
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-zinc-500">
              KHÔNG TÌM THẤY SẢN PHẨM NÀO KHỚP VỚI TỪ KHÓA "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const displayImg =
                (Array.isArray(item.images) ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url) : null) ||
                item.image ||
                '/placeholder.jpg';

              const itemPrice = Number(item.price || item.base_price) || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectGarment) onSelectGarment(item);
                    onClose();
                  }}
                  className="py-3 px-2 flex items-center justify-between hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0">
                      <img src={displayImg} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-zinc-400 block tracking-wider">
                        MÃ SP: {item.code || item.id} // {item.category_name || 'AETHER'}
                      </span>
                      <span className="font-inter font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500 block">
                        {item.material ? item.material.split('(')[0] : 'Vải kỹ thuật cao'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-white">
                      {itemPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-zinc-900 bg-zinc-950 font-mono text-[10px] text-zinc-500 flex justify-between">
          <span>NHẤN [ESC] ĐỂ ĐÓNG</span>
          <span>AETHER LABS // CATALOG ARCHIVE</span>
        </div>

      </div>
    </div>
  );
}
