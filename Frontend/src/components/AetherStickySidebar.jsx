import React from 'react';

export default function AetherStickySidebar({ activeSection = 'hero', onScrollToSection }) {
  const sections = [
    { id: 'hero', label: 'TRANG ĐẦU', num: '00' },
    { id: 'catalog', label: 'SẢN PHẨM', num: '01' },
    { id: 'craftsmanship', label: 'CHẤT LIỆU', num: '02' },
    { id: 'reviews', label: 'ĐÁNH GIÁ', num: '03' },
    { id: 'footer', label: 'CHÂN TRANG', num: '04' },
  ];

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-40 w-12 sm:w-14 border-l border-zinc-800 bg-[#080808]/85 backdrop-blur-md hidden lg:flex flex-col items-center justify-between py-8 select-none">
      
      {/* Top Index Marker */}
      <div className="font-mono text-[9px] text-zinc-600 tracking-widest writing-vertical rotate-180">
        AETHER // SWISS GRID
      </div>

      {/* Middle Section Indicator: Chữ dọc lớn (Vertical Monospace Typography) */}
      <div className="flex flex-col items-center gap-6 my-auto">
        
        {/* Navigation Dots with Index Number */}
        <div className="flex flex-col items-center gap-3">
          {sections.map((sec) => {
            const isActive = sec.id === activeSection;
            return (
              <button
                key={sec.id}
                onClick={() => onScrollToSection(sec.id)}
                className="group relative flex items-center justify-center p-1 cursor-pointer"
                title={`${sec.num} // ${sec.label}`}
              >
                {/* Popover label on hover to the left */}
                <span className="pointer-events-none absolute right-full mr-3 px-2 py-0.5 border border-zinc-800 bg-[#080808] font-mono text-[9px] tracking-widest text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                  {sec.num} // {sec.label}
                </span>

                <div
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-6 bg-[#fafafa] border border-white'
                      : 'w-1.5 h-1.5 bg-zinc-700 group-hover:bg-zinc-400 group-hover:scale-125'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Large Vertical Active Section Title (Bố cục ArtCraft Technical Brutalism) */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col items-center">
          <span className="font-mono text-[9px] text-zinc-500 mb-2">
            {currentSection.num}
          </span>
          
          <div
            style={{ writingMode: 'vertical-rl' }}
            className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-[#fafafa] transition-all duration-300"
          >
            {currentSection.label}
          </div>
        </div>

      </div>

      {/* Bottom Coordinate Indicator */}
      <div className="font-mono text-[9px] text-zinc-600 tracking-widest writing-vertical rotate-180">
        21.0285° N // HÀ NỘI
      </div>

    </aside>
  );
}
