
import React from 'react';
import { X, FileText, FileSpreadsheet, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (type: 'pdf' | 'excel') => void;
  isGenerating: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onShare, isGenerating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-end md:items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-slide-up">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="bg-school-100 p-1.5 rounded-lg text-school-600">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-800">Chọn định dạng chia sẻ</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isGenerating}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={() => onShare('pdf')}
            disabled={isGenerating}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-200 transition-all group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="bg-white p-3 rounded-full text-red-500 shadow-sm group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold text-red-900">Gửi file PDF</div>
              <div className="text-xs text-red-600/80">Giữ nguyên định dạng trang in</div>
            </div>
          </button>

          <button
            onClick={() => onShare('excel')}
            disabled={isGenerating}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-200 transition-all group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="bg-white p-3 rounded-full text-green-600 shadow-sm group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold text-green-900">Gửi file Excel</div>
              <div className="text-xs text-green-700/80">Dữ liệu dạng bảng tính (CSV)</div>
            </div>
          </button>
        </div>

        {isGenerating && (
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-school-600 font-medium animate-pulse">Đang tạo file, vui lòng chờ...</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ShareModal;
