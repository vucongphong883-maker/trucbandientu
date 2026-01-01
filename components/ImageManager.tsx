
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Camera, X, Image as ImageIcon, Plus, Eye } from 'lucide-react';
import ImageViewer from './ImageViewer';

export interface ImageManagerHandle {
  openCamera: () => void;
}

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label: string;
  maxImages?: number;
}

const ImageManager = forwardRef<ImageManagerHandle, ImageManagerProps>(({ 
  images = [], 
  onImagesChange, 
  label, 
  maxImages = 4 
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewerState, setViewerState] = useState<{isOpen: boolean, index: number}>({
    isOpen: false,
    index: 0
  });

  useImperativeHandle(ref, () => ({
    openCamera: () => {
      fileInputRef.current?.click();
    }
  }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];

    const newImagePromises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    const newBase64Images = await Promise.all(newImagePromises);
    
    if (newBase64Images.length > 0) {
      onImagesChange([...images, ...newBase64Images]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (confirm("Xóa ảnh minh chứng này?")) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
    }
  };

  const openViewer = (index: number) => {
    setViewerState({ isOpen: true, index });
  };

  return (
    <div className="mt-4">
      {/* Label for print view */}
      <p className="hidden print:block text-[10px] font-bold text-gray-400 uppercase mb-2">Ảnh minh chứng:</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 print:grid-cols-3 print:gap-4">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="relative group aspect-square cursor-pointer overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-school-200 print:rounded-none print:border-gray-300 print:shadow-none"
            onClick={() => openViewer(idx)}
          >
            <img 
              src={img} 
              alt={`${label} evidence ${idx}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center print:hidden">
              <Eye className="w-6 h-6 text-white" />
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => removeImage(e, idx)}
              className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-500 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 print:hidden z-10"
              title="Xóa ảnh"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-school-400 hover:text-school-500 hover:bg-school-50 transition-all print:hidden"
          >
            <div className="bg-gray-50 p-2 rounded-full mb-1 group-hover:bg-school-100">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight">Thêm ảnh</span>
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
      />
      
      {images.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-3 font-medium flex items-center gap-1.5 print:hidden">
          <ImageIcon className="w-3 h-3 text-school-400" />
          Đã đính kèm {images.length}/{maxImages} ảnh. Nhấn vào ảnh để xem chi tiết.
        </p>
      )}

      {/* Image Lightbox Viewer */}
      <ImageViewer 
        images={images}
        initialIndex={viewerState.index}
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ ...viewerState, isOpen: false })}
      />
    </div>
  );
});

export default ImageManager;
