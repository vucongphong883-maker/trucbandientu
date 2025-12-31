import React from 'react';
import { X, Printer, CheckSquare, Square, FileDown } from 'lucide-react';

export interface PrintConfig {
  includeStats: boolean;
  includeTeacherActivities: boolean;
  includeStudentActivities: boolean;
  includeOtherActivities: boolean;
}

interface PrintSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  config: PrintConfig;
  setConfig: React.Dispatch<React.SetStateAction<PrintConfig>>;
}

const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  config, 
  setConfig 
}) => {
  if (!isOpen) return null;

  const toggleOption = (key: keyof PrintConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const OptionRow = ({ 
    label, 
    field 
  }: { 
    label: string, 
    field: keyof PrintConfig 
  }) => (
    <div 
      onClick={() => toggleOption(field)}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all"
    >
      <div className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${config[field] ? 'bg-school-600 text-white' : 'border border-gray-300 bg-white'}`}>
        {config[field] && <CheckSquare className="w-4 h-4" />}
      </div>
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 print:hidden animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col transform transition-all">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-school-50 rounded-t-xl flex justify-between items-center">
          <h3 className="font-bold text-lg text-school-900 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-school-600" />
            Tùy chọn xuất PDF
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 space-y-2">
          <p className="text-sm text-gray-500 mb-2">Chọn các mục bạn muốn hiển thị trong file PDF:</p>
          
          <OptionRow label="Thống kê sĩ số & Vắng" field="includeStats" />
          <OptionRow label="1. Hoạt động giáo viên" field="includeTeacherActivities" />
          <OptionRow label="2. Hoạt động học sinh" field="includeStudentActivities" />
          <OptionRow label="3. Hoạt động khác / Sự cố" field="includeOtherActivities" />
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg font-medium transition-all"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-school-600 text-white hover:bg-school-700 rounded-lg font-bold shadow-lg shadow-school-200 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Xác nhận & In
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintSettingsModal;