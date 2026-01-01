
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [initialIndex, isOpen]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      {/* Background overlay for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="text-white font-black text-lg drop-shadow-md">
            {currentIndex + 1} <span className="text-white/40 text-sm font-normal">/ {images.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
            title={isZoomed ? "Thu nhỏ" : "Phóng to"}
          >
            {isZoomed ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-2 md:p-10 select-none overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Navigation Buttons (Desktop) */}
        {images.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute left-6 z-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all hidden md:flex items-center justify-center backdrop-blur-sm border border-white/5"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* The Image */}
        <div 
          className={`relative transition-all duration-500 ease-out flex items-center justify-center ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
        >
          <img 
            key={currentIndex}
            src={images[currentIndex]} 
            alt="Evidence" 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm animate-scale-up"
            draggable={false}
          />
        </div>

        {images.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-6 z-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all hidden md:flex items-center justify-center backdrop-blur-sm border border-white/5"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Bottom Indicators & Metadata */}
      <div className="absolute bottom-8 flex flex-col items-center gap-4 w-full px-6">
        {images.length > 1 && (
          <div className="flex gap-2.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setIsZoomed(false); }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-2.5 bg-school-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]' 
                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest md:hidden animate-pulse">
          Vuốt để chuyển ảnh
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
      `}</style>
    </div>
  );
};

export default ImageViewer;
