import React, { useState } from 'react';
import { X, Sparkles, RotateCcw, Save, Info, Settings2 } from 'lucide-react';
import { DEFAULT_AI_INSTRUCTION } from '../services/geminiService';

interface AiPromptSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruction: string;
  onSave: (newInstruction: string) => void;
}

const AiPromptSettingsModal: React.FC<AiPromptSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  instruction, 
  onSave 
}) => {
  const [localInstruction, setLocalInstruction] = useState(instruction);

  if (!isOpen) return null;

  const handleReset = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục về cấu hình mặc định?")) {
      setLocalInstruction(DEFAULT_AI_INSTRUCTION);
    }
  };

  const handleSave = () => {
    onSave(localInstruction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Cấu hình AI Assistant</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Dưới đây là <strong>System Instruction</strong> - lời chỉ dẫn cốt lõi mà AI sẽ tuân theo khi tổng hợp báo cáo. Bạn có thể yêu cầu AI thay đổi văn phong, tập trung vào các lớp vắng, hoặc thêm các tiêu chí đánh giá riêng của trường.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Chỉ dẫn cho AI (Prompt)
            </label>
            <textarea
              value={localInstruction}
              onChange={(e) => setLocalInstruction(e.target.value)}
              className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none font-sans leading-relaxed text-gray-700"
              placeholder="Nhập chỉ dẫn cho AI..."
            />
          </div>

          <div className="flex justify-between items-center">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục mặc định
            </button>
            <div className="text-[10px] text-gray-400 italic">
              * Dữ liệu báo cáo sẽ tự động được thêm vào sau chỉ dẫn này.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPromptSettingsModal;