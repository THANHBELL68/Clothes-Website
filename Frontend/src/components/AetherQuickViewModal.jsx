import React, { useState, useMemo } from 'react';
import { X, Layers, Wind, Droplets, ShoppingBag } from 'lucide-react';

export default function AetherQuickViewModal({ garment, isOpen, onClose, onAddToCart }) {
  if (!isOpen || !garment) return null;

  // Trích xuất danh sách màu từ các biến thể (hỗ trợ cả object lẫn string)
  const availableColors = useMemo(() => {
    const list = [];
    garment.variants?.forEach((v) => {
      const colName = v.color?.name || v.color;
      if (colName && !list.includes(colName)) list.push(colName);
    });
    return list.length > 0 ? list : ['Mặc định'];
  }, [garment]);

  // Trích xuất danh sách size từ các biến thể
  const availableSizes = useMemo(() => {
    const list = [];
    garment.variants?.forEach((v) => {
      const sizeName = v.size?.name || v.size;
      if (sizeName && !list.includes(sizeName)) list.push(sizeName);
    });
    return list.length > 0 ? list : ['M'];
  }, [garment]);

  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');

  // Tìm biến thể hiện tại tương ứng với size và màu đã chọn
  const currentVariant = useMemo(() => {
    return (
      garment.variants?.find((v) => {
        const vCol = v.color?.name || v.color;
        const vSize = v.size?.name || v.size;
        return vCol === selectedColor && vSize === selectedSize;
      }) || garment.variants?.[0]
    );
  }, [garment, selectedColor, selectedSize]);

  // Tồn kho khả dụng từ v_inventory_available
  const stockAvailable =
    currentVariant?.inventory?.quantity_available ?? currentVariant?.stock ?? 30;

  // Ảnh hiển thị ưu tiên theo variant_id
  const displayImage = useMemo(() => {
    if (currentVariant?.id && garment.images?.length) {
      const imgVar = garment.images.find((img) => img.variant_id === currentVariant.id);
      if (imgVar) return typeof imgVar === 'string' ? imgVar : imgVar.url;
    }
    const firstImg = garment.images?.[0];
    return typeof firstImg === 'string' ? firstImg : firstImg?.url || garment.image;
  }, [currentVariant, garment]);

  const priceToDisplay = currentVariant?.price || garment.base_price || garment.price || 0;

  const handleAdd = () => {
    onAddToCart({
      id: garment.id,
      name: garment.name,
      sku: currentVariant?.sku || garment.code || `SKU-${garment.id}`,
      price: priceToDisplay,
      size: selectedSize,
      color: selectedColor,
      image: displayImage,
      quantity: 1,
      stock: stockAvailable,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md" />

      {/* Modal Dialog with exposed 1px Swiss Grid */}
      <div className="relative w-full max-w-4xl bg-[#080808] border border-zinc-800 text-[#fafafa] shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 border border-zinc-700 bg-zinc-950/80 hover:border-zinc-400 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Product Imagery on Dot Matrix */}
        <div className="md:w-1/2 relative bg-zinc-950 bg-dot-matrix p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="relative w-full aspect-[4/5] overflow-hidden border border-zinc-800/80 shadow-2xl">
            <img
              src={displayImage}
              alt={garment.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <span className="absolute top-3 left-3 px-2 py-0.5 border border-zinc-700 bg-black/80 font-mono text-[9px] tracking-widest text-white">
              SKU: {currentVariant?.sku || garment.code || 'AT01'}
            </span>
          </div>
        </div>

        {/* Right Side: Technical Specs & Add to Cart */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-400 tracking-widest uppercase">
                {garment.category?.name || garment.category_name || 'THỜI TRANG'} // TECHWEAR
              </span>
              <span className="font-mono text-base font-bold text-white">
                {priceToDisplay?.toLocaleString('vi-VN')}₫
              </span>
            </div>

            <h2 className="font-inter font-black text-2xl tracking-tight text-white leading-tight">
              {garment.name}
            </h2>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 border border-zinc-800 p-3 bg-zinc-950/60 font-mono text-[10px]">
              <div className="flex flex-col items-center text-center p-1 border-r border-zinc-900">
                <Droplets className="w-3.5 h-3.5 text-sky-400 mb-1" />
                <span className="text-zinc-500">CHẤT LIỆU</span>
                <span className="text-white font-bold truncate max-w-full">
                  {currentVariant?.material?.name || garment.material || 'COTTON'}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-1 border-r border-zinc-900">
                <Wind className="w-3.5 h-3.5 text-zinc-300 mb-1" />
                <span className="text-zinc-500">THIẾT KẾ</span>
                <span className="text-white font-bold">CÔNG THÁI HỌC</span>
              </div>
              <div className="flex flex-col items-center text-center p-1">
                <Layers className="w-3.5 h-3.5 text-amber-400 mb-1" />
                <span className="text-zinc-500">TỒN KHO</span>
                <span className="text-emerald-400 font-bold">{stockAvailable} CHIẾC</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <p className="font-mono text-xs text-zinc-300 leading-relaxed">
                {garment.description || garment.short_desc}
              </p>
            </div>

            {/* Color Selector */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                <span>MÀU SẮC (colors):</span>
                <span className="text-white font-bold">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-3 py-1.5 border font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                      selectedColor === col
                        ? 'bg-white text-black border-white shadow-md'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                <span>KÍCH THƯỚC (sizes):</span>
                <span className="text-white font-bold">{selectedSize} (SKU: {currentVariant?.sku || '---'})</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[42px] py-1.5 px-3 border font-mono text-xs font-bold tracking-wider transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <button
              onClick={handleAdd}
              disabled={stockAvailable <= 0}
              className="w-full py-3.5 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:translate-y-0.5 disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>THÊM VÀO GIỎ // [{selectedSize} - {selectedColor}]</span>
            </button>
            <div className="font-mono text-[9px] text-zinc-500 text-center tracking-widest">
              ĐỒNG BỘ VIEW v_inventory_available // MIỄN PHÍ VẬN CHUYỂN TỪ 500.000₫
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
