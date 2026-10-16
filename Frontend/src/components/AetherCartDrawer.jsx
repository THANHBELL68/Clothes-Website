import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AetherCartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
}) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-in Drawer with 1px Swiss Grid */}
      <div className="relative w-full max-w-md bg-[#080808] border-l border-zinc-800 text-[#fafafa] flex flex-col h-full shadow-2xl z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
            <h3 className="font-mono text-xs font-bold tracking-widest uppercase">
              GIỎ HÀNG THỜI TRANG // ({items.length} SẢN PHẨM)
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 border border-zinc-800 hover:border-zinc-500 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <p className="font-mono text-xs text-zinc-500 tracking-wider">GIỎ HÀNG CỦA BẠN ĐANG TRỐNG.</p>
              <button
                onClick={onClose}
                className="font-mono text-[11px] underline text-zinc-300 hover:text-white tracking-widest uppercase"
              >
                [ XEM BỘ SƯU TẬP ]
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="pt-4 first:pt-0 flex gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-24 border border-zinc-800 bg-zinc-900/60 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] text-zinc-400 tracking-wider">
                        {item.sku || 'MÃ SP'}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {item.price?.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <h4 className="font-inter font-bold text-xs text-zinc-100 mt-1 line-clamp-1">
                      {item.name}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                      <span>SIZE: <strong className="text-zinc-300">{item.size || 'M'}</strong></span>
                      <span>//</span>
                      <span>MÀU: <strong className="text-zinc-300">{item.color || 'Gốc'}</strong></span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-zinc-800 font-mono text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.size, item.quantity - 1)}
                        className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-white font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}
                        className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id, item.size)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>TỔNG TIỀN HÀNG</span>
                <span className="text-white font-bold">{subtotal?.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[10px]">
                <span>VẬN CHUYỂN TOÀN QUỐC</span>
                <span className="text-emerald-400">{subtotal >= 500000 ? 'MIỄN PHÍ VẬN CHUYỂN' : '30.000₫'}</span>
              </div>
            </div>

            <button
              onClick={handleProceedCheckout}
              className="w-full py-3 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg active:translate-y-0.5"
            >
              <span>TIẾN HÀNH ĐẶT HÀNG // THANH TOÁN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>ĐỒNG BỘ CSDL POSTGRESQL // ĐỔI TRẢ 30 NGÀY</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
