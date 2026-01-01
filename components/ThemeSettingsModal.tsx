import React, { useState, useEffect } from 'react';
import { X, Palette, Check, RotateCcw, Save } from 'lucide-react';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Sky Blue', hex: '#0ea5e9' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Crimson', hex: '#dc2626' },
];

const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({ isOpen, onClose, onThemeChange }) => {
  const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem('school_primary_color') || '#0ea5e9');

  if (!isOpen) return null;

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 14, g: 165, b: 233 };
  };

  const adjust = (color: number, amount: number) => Math.max(0, Math.min(255, color + amount));

  const applyTheme = (color: string) => {
    const rgb = hexToRgb(color);
    const root = document.documentElement;
    
    // Update CSS variables
    root.style.setProperty('--school-500', color);
    root.style.setProperty('--school-50', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
    root.style.setProperty('--school-100', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
    root.style.setProperty('--school-600', `rgb(${adjust(rgb.r, -30)}, ${adjust(rgb.g, -30)}, ${adjust(rgb.b, -30)})`);
    root.style.setProperty('--school-700', `rgb(${adjust(rgb.r, -60)}, ${adjust(rgb.g, -60)}, ${adjust(rgb.b, -60)})`);
    root.style.setProperty('--school-900', `rgb(${adjust(rgb.r, -100)}, ${adjust(rgb.g, -100)}, ${adjust(rgb.b, -100)})`);
    
    // Persist
    localStorage.setItem('school_primary_color', color);
    onThemeChange(color);
  };

  const handleSave = () => {
    applyTheme(selectedColor);
    onClose();
  };

  const handleReset = () => {
    setSelectedColor('#0ea5e9');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg">Cài đặt giao diện</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Màu chủ đạo của trường
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className="group relative aspect-square rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm border-2 overflow-hidden"
                  style={{ backgroundColor: color.hex, borderColor: selectedColor === color.hex ? color.hex : 'transparent' }}
                  title={color.name}
                >
                  {selectedColor === color.hex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Check className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Màu tùy chỉnh (Hex)
            </label>
            <div className="flex gap-3">
              <input 
                type="color" 
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <input 
                type="text"
                value={selectedColor.toUpperCase()}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-gray-200 outline-none"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Xem trước</p>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 rounded-lg font-bold text-white shadow-md text-sm transition-all" style={{ backgroundColor: selectedColor }}>
                Nút Bấm Mẫu
              </button>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: `rgba(${hexToRgb(selectedColor).r}, ${hexToRgb(selectedColor).g}, ${hexToRgb(selectedColor).b}, 0.1)` }} />
                <div className="flex-1 h-8 rounded-lg border-2" style={{ borderColor: selectedColor, color: selectedColor, display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  Đường viền mẫu
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi phục
          </button>
          <div className="flex-1" />
          <button 
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all text-sm"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsModal;