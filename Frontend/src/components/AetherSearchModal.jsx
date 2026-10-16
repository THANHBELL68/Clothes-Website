import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useDbStore } from '../store/dbStore';

export default function AetherSearchModal({ isOpen, onClose, onSelectGarment }) {
  const [query, setQuery] = useState('');
  const products = useDbStore((state) => state.products);

  if (!isOpen) return null;

  const filtered = products.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code?.toLowerCase().includes(q) ||
      item.category_name?.toLowerCase().includes(q) ||
      item.material?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

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
            className="w-7 h-7 border border-zinc-800 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-zinc-900 p-4">
          <div className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase mb-3">
            KẾT QUẢ TÌM KIẾM CSDL ({filtered.length})
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-zinc-500">
              KHÔNG TÌM THẤY SẢN PHẨM NÀO KHỚP VỚI TỪ KHÓA "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectGarment(item);
                  onClose();
                }}
                className="py-3 px-2 flex items-center justify-between hover:bg-zinc-900/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0">
                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-zinc-400 block tracking-wider">
                      MÃ SP: {item.code} // {item.category_name}
                    </span>
                    <span className="font-inter font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 block">
                      {item.material?.split('(')[0]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-white">
                    {item.price?.toLocaleString('vi-VN')}₫
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-zinc-900 bg-zinc-950 font-mono text-[10px] text-zinc-500 flex justify-between">
          <span>NHẤN [ESC] ĐỂ ĐÓNG</span>
          <span>CLOTHES STUDIO // HỆ THỐNG CSDL ĐỘNG</span>
        </div>

      </div>
    </div>
  );
}
