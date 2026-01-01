
import React from 'react';
import { X, Printer, CheckSquare, Square, FileDown, List, BarChart, UserCheck, Users, MessageSquare, PenTool, Sparkles, LayoutTemplate } from 'lucide-react';

export interface PrintConfig {
  includeHeader: boolean;
  includeStats: boolean;
  includeClassList: boolean;
  includeTeacherActivities: boolean;
  includeStudentActivities: boolean;
  includeOtherActivities: boolean;
  includeAiSummary: boolean;
  includeSignatures: boolean;
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

  const selectAll = () => {
    setConfig({
      includeHeader: true,
      includeStats: true,
      includeClassList: true,
      includeTeacherActivities: true,
      includeStudentActivities: true,
      includeOtherActivities: true,
      includeAiSummary: true,
      includeSignatures: true,
    });
  };

  const deselectAll = () => {
    setConfig({
      includeHeader: true, // Header usually kept by default
      includeStats: false,
      includeClassList: false,
      includeTeacherActivities: false,
      includeStudentActivities: false,
      includeOtherActivities: false,
      includeAiSummary: false,
      includeSignatures: false,
    });
  };

  const OptionRow = ({ 
    label, 
    field,
    icon: Icon
  }: { 
    label: string, 
    field: keyof PrintConfig,
    icon: any
  }) => (
    <div 
      onClick={() => toggleOption(field)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
        config[field] 
          ? 'bg-school-50 border-school-200 shadow-sm' 
          : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        config[field] ? 'bg-school-600 text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className={`flex-1 font-medium text-sm ${config[field] ? 'text-school-900' : 'text-gray-500'}`}>
        {label}
      </span>
      <div className={`w-5 h-5 flex items-center justify-center rounded border transition-all ${
        config[field] ? 'bg-school-600 border-school-600 text-white' : 'border-gray-300 bg-white'
      }`}>
        {config[field] && <CheckSquare className="w-3.5 h-3.5" />}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 print:hidden animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col transform transition-all overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-school-900 to-school-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Cấu hình trang in</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Bulk Actions */}
        <div className="px-5 pt-4 flex gap-3 shrink-0">
            <button onClick={selectAll} className="text-xs font-bold text-school-600 hover:bg-school-50 px-2 py-1.5 rounded transition-colors">
              Chọn tất cả
            </button>
            <button onClick={deselectAll} className="text-xs font-bold text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors">
              Bỏ chọn tất cả
            </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Group 1: General */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Thông tin chung</p>
            <div className="space-y-2">
                <OptionRow label="Tiêu đề & Tên trường" field="includeHeader" icon={LayoutTemplate} />
                <OptionRow label="Thống kê sĩ số & Vắng" field="includeStats" icon={BarChart} />
                <OptionRow label="Danh sách chi tiết các lớp" field="includeClassList" icon={List} />
            </div>
          </div>

          {/* Group 2: Activities */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nội dung báo cáo</p>
             <div className="space-y-2">
                <OptionRow label="1. Hoạt động giáo viên" field="includeTeacherActivities" icon={UserCheck} />
                <OptionRow label="2. Hoạt động học sinh" field="includeStudentActivities" icon={Users} />
                <OptionRow label="3. Hoạt động khác / Sự cố" field="includeOtherActivities" icon={MessageSquare} />
                <OptionRow label="Bản tổng hợp từ AI" field="includeAiSummary" icon={Sparkles} />
            </div>
          </div>

          {/* Group 3: Footer */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Chân trang</p>
             <div className="space-y-2">
                <OptionRow label="Phần ký tên xác nhận" field="includeSignatures" icon={PenTool} />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl font-bold transition-all flex-1"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2.5 bg-school-600 text-white hover:bg-school-700 rounded-xl font-bold shadow-lg shadow-school-200 transition-all flex items-center justify-center gap-2 flex-[2]"
          >
            <Printer className="w-5 h-5" />
            Xác nhận & In
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintSettingsModal;
