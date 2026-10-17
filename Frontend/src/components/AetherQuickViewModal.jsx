import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Layers,
  Wind,
  Droplets,
  ShoppingBag,
  Zap,
  Play,
  Grid,
  Maximize2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatVND } from '../data/mockData';

export default function AetherQuickViewModal({ garment, isOpen, onClose, onAddToCart }) {
  const navigate = useNavigate();

  // Khóa cuộn trang khi mở modal
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Trích xuất danh sách màu duy nhất kèm mã hex_code
  const uniqueColors = useMemo(() => {
    if (!garment?.variants) return [{ id: 1, name: 'Mặc định', hex_code: '#000000' }];
    const map = new Map();
    garment.variants.forEach((v) => {
      const colId = v.color_id || v.color?.id || 1;
      const colName = v.color?.name || v.color || 'Mặc định';
      const hexCode = v.color?.hex_code || '#000000';
      if (!map.has(colName)) {
        map.set(colName, { id: colId, name: colName, hex_code: hexCode });
      }
    });
    return Array.from(map.values());
  }, [garment]);

  // Trích xuất danh sách size duy nhất
  const uniqueSizes = useMemo(() => {
    if (!garment?.variants) return ['M'];
    const list = [];
    garment.variants.forEach((v) => {
      const sizeName = v.size?.name || v.size;
      if (sizeName && !list.includes(sizeName)) list.push(sizeName);
    });
    return list.length > 0 ? list : ['M'];
  }, [garment]);

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.name || 'Mặc định');
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'single' | 'video'
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cập nhật khi garment thay đổi
  useEffect(() => {
    if (garment) {
      setSelectedColor(uniqueColors[0]?.name || 'Mặc định');
      setSelectedSize(uniqueSizes[0] || 'M');
      setQuantity(1);
      setActiveTab('grid');
      setActiveImageIndex(0);
    }
  }, [garment, uniqueColors, uniqueSizes]);

  // Tìm biến thể hiện tại theo màu và size đã chọn
  const currentVariant = useMemo(() => {
    if (!garment?.variants) return null;
    // 1. Khớp chính xác cả Màu & Size
    const exact = garment.variants.find((v) => {
      const vCol = v.color?.name || v.color;
      const vSize = v.size?.name || v.size;
      return vCol === selectedColor && vSize === selectedSize;
    });
    if (exact) return exact;

    // 2. Nếu size hiện tại không có màu này, lấy size đầu tiên có màu này
    const sameColor = garment.variants.find((v) => {
      const vCol = v.color?.name || v.color;
      return vCol === selectedColor;
    });
    if (sameColor) return sameColor;

    return garment.variants[0] || null;
  }, [garment, selectedColor, selectedSize]);

  // Đồng bộ lại selectedSize nếu currentVariant rơi vào size khác
  useEffect(() => {
    if (currentVariant) {
      const vSize = currentVariant.size?.name || currentVariant.size;
      if (vSize && vSize !== selectedSize) {
        setSelectedSize(vSize);
      }
    }
  }, [currentVariant]);

  // Tồn kho khả dụng từ v_inventory_available
  const stockAvailable =
    currentVariant?.inventory?.quantity_available ?? currentVariant?.stock ?? 30;

  // Lấy danh sách 4 ảnh cho bố cục 2x2 chuẩn xác
  const galleryImages = useMemo(() => {
    if (!garment?.images?.length) return [];
    return garment.images.map((img, idx) => ({
      id: img.id || idx,
      url: typeof img === 'string' ? img : img.url,
      label: img.label || (idx < 2 ? (garment.id === 1 ? 'Người mẫu: 168cm / Size quần áo: S' : 'Người mẫu: 176cm / Size quần áo: L') : 'Chi tiết sản phẩm'),
      color_id: img.color_id,
      variant_id: img.variant_id,
    }));
  }, [garment]);

  // Xác định ảnh hiển thị đại diện theo màu đang chọn
  const displayImage = useMemo(() => {
    if (!garment) return '';
    const activeColorObj = uniqueColors.find((c) => c.name === selectedColor);
    if (activeColorObj && garment.images?.length) {
      // Tìm ảnh khớp color_id
      const byCol = garment.images.find((img) => img.color_id === activeColorObj.id);
      if (byCol) return typeof byCol === 'string' ? byCol : byCol.url;
    }
    if (currentVariant?.id && garment.images?.length) {
      const imgVar = garment.images.find((img) => img.variant_id === currentVariant.id);
      if (imgVar) return typeof imgVar === 'string' ? imgVar : imgVar.url;
    }
    const firstImg = garment.images?.[0];
    return typeof firstImg === 'string' ? firstImg : firstImg?.url || garment.image || '';
  }, [garment, selectedColor, currentVariant, uniqueColors]);

  // Video mô tả sản phẩm
  const videoUrl = garment?.video_url || (garment?.id === 1 ? '/images/products/nu_demo/san_pham1/video_intro.mp4' : '/images/products/nam_demo/san_pham1/video_intro_nam.mp4');

  // Giá bán
  const priceToDisplay = currentVariant?.price || garment?.base_price || garment?.price || 0;

  // Xử lý đổi màu sắc -> Đổi ảnh ngay lập tức
  const handleSelectColor = (colName) => {
    setSelectedColor(colName);
    // Nếu đang ở tab single thì chuyển ảnh sang ảnh của màu đó
    const activeColorObj = uniqueColors.find((c) => c.name === colName);
    if (activeColorObj && galleryImages.length) {
      const matchIdx = galleryImages.findIndex((img) => img.color_id === activeColorObj.id);
      if (matchIdx !== -1) {
        setActiveImageIndex(matchIdx);
      }
    }
  };

  // Early return
  if (!isOpen || !garment) return null;

  // Thêm vào giỏ hàng
  const handleAdd = () => {
    onAddToCart({
      variant_id: currentVariant?.id,
      product_id: garment.id,
      name: garment.name,
      sku: currentVariant?.sku || garment.code || `SKU-${garment.id}`,
      price: priceToDisplay,
      size: selectedSize,
      color: selectedColor,
      image: displayImage,
      quantity,
      stock: stockAvailable,
    });
    onClose();
  };

  // Mua ngay
  const handleBuyNow = () => {
    const buyNowItem = {
      variant_id: currentVariant?.id,
      product_id: garment.id,
      name: garment.name,
      sku: currentVariant?.sku || garment.code || `SKU-${garment.id}`,
      price: priceToDisplay,
      size: selectedSize,
      color: selectedColor,
      image: displayImage,
      quantity,
      stock: stockAvailable,
    };
    sessionStorage.setItem('aether_buy_now_item', JSON.stringify(buyNowItem));
    onClose();
    navigate('/checkout?buy_now=true');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md" />

      {/* Modal Dialog with exposed 1px Swiss Grid */}
      <div className="relative w-full max-w-5xl xl:max-w-6xl bg-[#080808] border border-zinc-800 text-[#fafafa] shadow-2xl z-10 overflow-hidden flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 border border-zinc-700 bg-zinc-950/80 hover:border-zinc-400 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ===================================================================
            CỘT TRÁI (7 COLS): BỐ CỤC 4 ẢNH NHƯ ẢNH CHỤP HOẶC VIDEO MÔ TẢ
        ==================================================================== */}
        <div className="lg:w-7/12 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/50">
          
          {/* Thanh chuyển chế độ: LƯỚI 4 ẢNH // ẢNH PHÓNG TO // VIDEO MÔ TẢ */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-zinc-950/90 font-mono text-[10px] tracking-widest text-zinc-400">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'grid'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>BỐ CỤC 4 ẢNH</span>
              </button>

              <button
                onClick={() => setActiveTab('single')}
                className={`flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'single'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>PHÓNG TO</span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-2.5 py-1 uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-amber-400 text-black font-bold shadow-xs'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-zinc-900'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>VIDEO MÔ TẢ</span>
              </button>
            </div>

            <span className="hidden sm:inline-block text-zinc-500 text-[9px]">
              SPEC // 2X2 GRID
            </span>
          </div>

          {/* Vùng hiển thị nội dung Media */}
          <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] overflow-y-auto bg-[#080808] flex items-center justify-center p-2 sm:p-3">
            
            {/* 1. TAB BỐ CỤC 4 ẢNH (2x2 GRID GIỐNG HỆT ẢNH CHỤP CỦA KHÁCH) */}
            {activeTab === 'grid' && (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full h-full max-w-2xl mx-auto">
                {galleryImages.slice(0, 4).map((img, idx) => {
                  const isColorMatched =
                    img.color_id &&
                    img.color_id === uniqueColors.find((c) => c.name === selectedColor)?.id;

                  return (
                    <div
                      key={img.id}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setActiveTab('single');
                      }}
                      className={`relative aspect-[3/4] overflow-hidden bg-zinc-900 border transition-all cursor-pointer group ${
                        isColorMatched
                          ? 'border-white ring-1 ring-white/60 shadow-lg'
                          : 'border-zinc-800 hover:border-zinc-500'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${garment.name} - ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Icon móc treo quần áo góc dưới bên trái (như ảnh chụp Uniqlo/ArtCraft) */}
                      {idx < 2 && (
                        <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[10px] text-white shadow-md">
                          <span>👔</span>
                        </div>
                      )}

                      {/* Tag thông số chiều cao người mẫu góc dưới bên phải */}
                      {img.label && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-xs font-mono text-[8px] sm:text-[9px] text-zinc-200 tracking-wide border border-white/10">
                          {img.label}
                        </div>
                      )}

                      {/* Chỉ báo màu đang chọn */}
                      {isColorMatched && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white text-black font-mono text-[8px] font-bold tracking-widest shadow-xs">
                          MÀU ĐANG CHỌN
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. TAB ẢNH PHÓNG TO ĐƠN */}
            {activeTab === 'single' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                <div className="relative max-h-[480px] max-w-full aspect-[3/4] overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
                  <img
                    src={galleryImages[activeImageIndex]?.url || displayImage}
                    alt={garment.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 font-mono text-[9px] text-white tracking-widest">
                    {galleryImages[activeImageIndex]?.label || `SKU: ${currentVariant?.sku || '---'}`}
                  </div>
                </div>

                {/* Thumbnails dải ngang */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 max-w-full">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-12 h-14 border shrink-0 bg-black cursor-pointer ${
                        activeImageIndex === idx ? 'border-white ring-1 ring-white' : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TAB VIDEO MÔ TẢ SẢN PHẨM */}
            {activeTab === 'video' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-black">
                <div className="relative w-full aspect-video max-h-[460px] border border-zinc-800 overflow-hidden shadow-2xl bg-black flex items-center justify-center">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Badge kỹ thuật góc trên */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 border border-zinc-700 font-mono text-[9px] text-amber-400 tracking-widest flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>REC // AETHER CINEMATIC 1080P</span>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-zinc-400 mt-2 text-center">
                  Video quay cận cảnh phom dáng thực tế và chi tiết chất liệu khi chuyển động
                </p>
              </div>
            )}

          </div>

          {/* Footer nhỏ cột trái */}
          <div className="border-t border-zinc-800 px-4 py-2 bg-zinc-950/80 flex items-center justify-between font-mono text-[9px] text-zinc-500">
            <span>SKU: {currentVariant?.sku || 'AKN-00'}</span>
            <span>TỒN KHO: {stockAvailable} CHIẾC</span>
          </div>

        </div>

        {/* ===================================================================
            CỘT PHẢI (5 COLS): THÔNG TIN KỸ THUẬT, TỔ HỢP MÀU/SIZE & MUA HÀNG
        ==================================================================== */}
        <div className="lg:w-5/12 p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto space-y-5 bg-[#080808]">
          
          <div className="space-y-4">
            
            {/* Header: Danh mục & Giá */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-mono text-[11px]">
              <span className="text-zinc-400 tracking-widest uppercase">
                {garment.category?.name || (garment.id === 1 ? 'ÁO NỮ' : 'ÁO NAM')} // TECHNICAL
              </span>
              <span className="text-base font-bold text-white tracking-wider">
                {formatVND(priceToDisplay)}
              </span>
            </div>

            {/* Tên sản phẩm */}
            <div>
              <h2 className="font-inter font-black text-xl sm:text-2xl tracking-tight text-white leading-tight">
                {garment.name}
              </h2>
              <p className="font-mono text-xs text-zinc-400 mt-2 leading-relaxed">
                {garment.description}
              </p>
            </div>

            {/* Hộp Thông Số Nhanh 3 Ô */}
            <div className="grid grid-cols-3 gap-2 border border-zinc-800 p-2.5 bg-zinc-950/60 font-mono text-[10px]">
              <div className="flex flex-col items-center text-center p-1 border-r border-zinc-800">
                <Droplets className="w-3.5 h-3.5 text-sky-400 mb-1" />
                <span className="text-zinc-500">CHẤT LIỆU</span>
                <span className="text-white font-bold truncate max-w-full">
                  {currentVariant?.material?.name || (garment.id === 1 ? 'Vải Rayon' : 'Lông Cừu')}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-1 border-r border-zinc-800">
                <Wind className="w-3.5 h-3.5 text-zinc-300 mb-1" />
                <span className="text-zinc-500">THIẾT KẾ</span>
                <span className="text-white font-bold">CẢN GIÓ</span>
              </div>
              <div className="flex flex-col items-center text-center p-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                <span className="text-zinc-500">TỒN KHO</span>
                <span className="text-emerald-400 font-bold">{stockAvailable} CHIẾC</span>
              </div>
            </div>

            {/* BỘ CHỌN MÀU SẮC (Đổi ảnh ngay lập tức) */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                <span>MÀU SẮC:</span>
                <span className="text-white font-bold uppercase">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((col) => {
                  const isSelected = selectedColor === col.name;
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleSelectColor(col.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-md'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: col.hex_code }}
                        className="w-3 h-3 border border-zinc-400 inline-block shrink-0 shadow-2xs"
                      />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BỘ CHỌN KÍCH CỠ */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                <span>KÍCH THƯỚC:</span>
                <span className="text-white font-bold">{selectedSize} (SKU: {currentVariant?.sku || '---'})</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] py-1.5 px-3 border font-mono text-xs font-bold tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SỐ LƯỢNG */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-3 font-mono text-[10px]">
              <span className="text-zinc-400">SỐ LƯỢNG MUA:</span>
              <div className="flex items-center border border-zinc-800 bg-zinc-950">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1 font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                  className="px-3 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* KHỐI NÚT HÀNH ĐỘNG */}
          <div className="pt-4 border-t border-zinc-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Nút Thêm Vào Giỏ */}
              <button
                onClick={handleAdd}
                disabled={stockAvailable <= 0}
                className="flex-1 py-3 px-3 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-mono text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:translate-y-0.5 disabled:opacity-50"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>THÊM VÀO GIỎ</span>
              </button>

              {/* Nút Mua Ngay */}
              <button
                onClick={handleBuyNow}
                disabled={stockAvailable <= 0}
                className="flex-1 py-3 px-3 bg-amber-400 text-black hover:bg-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:translate-y-0.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>MUA NGAY</span>
              </button>
            </div>

            {/* Link Xem Trang Chi Tiết Đầy Đủ */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/product/${garment.id}`);
                }}
                className="font-mono text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>MỞ TRANG CHI TIẾT ĐẦY ĐỦ</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <span className="font-mono text-[9px] text-zinc-500">
                MIỄN PHÍ VẬN CHUYỂN TỪ 500.000₫
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
