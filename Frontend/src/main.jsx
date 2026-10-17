import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/**
 * AETHER LABS // Global Error Boundary
 * Ngăn chặn hoàn toàn lỗi màn hình đen (Blank Black Screen) khi client runtime gặp sự cố
 * Cung cấp nút Reset Storage & Khôi phục phiên làm việc ngay lập tức
 */
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AETHER LABS] Runtime uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080808] text-[#fafafa] flex flex-col items-center justify-center p-6 font-mono text-xs select-none">
          <div className="max-w-xl w-full border border-zinc-800 bg-[#0d0d0d] p-8 space-y-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-rose-500 animate-pulse" />
                <span className="font-bold tracking-widest text-white uppercase text-sm">
                  AETHER LABS // SYSTEM DIAGNOSTICS
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 tracking-wider">ERROR 500</span>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <p className="text-zinc-300 leading-relaxed font-sans text-sm">
                Đã xảy ra sự cố không đồng bộ trong bộ nhớ trình duyệt hoặc phiên làm việc của bạn.
              </p>
              
              <div className="p-3.5 bg-black border border-zinc-800 text-rose-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-40">
                {String(this.state.error?.message || this.state.error || 'Unknown Client Exception')}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-[#fafafa] text-[#080808] hover:bg-zinc-200 font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>[ RESET BỘ NHỚ & TẢI LẠI TRANG ]</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-6 border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white tracking-widest uppercase transition-colors cursor-pointer"
              >
                <span>TẢI LẠI (F5)</span>
              </button>
            </div>

            <div className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-3 flex justify-between">
              <span>POSTGRESQL 13+ COMPLIANT</span>
              <span>AETHER LABS STUDIO // 2026</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
