import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 animate-bounce-in">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border backdrop-blur-sm ${
        type === 'success' 
          ? 'bg-white/95 border-green-200 text-green-800 shadow-green-100/50' 
          : 'bg-white/95 border-red-200 text-red-800 shadow-red-100/50'
      }`}>
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        <span className="font-bold text-sm">{message}</span>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          50% { transform: translate(-50%, -5px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;