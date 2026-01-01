import React, { memo, useState } from 'react';
import { ChevronDown, ChevronRight, Info, MessageSquare, Plus, ArrowUpDown } from 'lucide-react';
import { ClassRecord } from '../types';

interface ClassRowProps {
  record: ClassRecord;
  index: number;
  onChange: (id: string, field: keyof ClassRecord, value: string | number) => void;
}

const QUICK_REASONS = ["Ốm", "Việc riêng", "Bỏ tiết", "Muộn"];

const ClassRow: React.FC<ClassRowProps> = memo(({ record, index, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAbsent = record.absentCount > 0;

  const handleQuickReason = (reason: string) => {
    const current = record.absentReason ? record.absentReason + ", " : "";
    onChange(record.id, 'absentReason', current + reason);
  };

  return (
    <>
      <tr 
        className={`border-b border-gray-100 hover:bg-school-50/30 transition-colors cursor-pointer group ${isAbsent ? 'bg-red-50/20' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="p-3 text-center text-gray-400 font-medium text-xs w-12 print:text-black">
          {index + 1}
        </td>
        <td className="p-3 font-bold text-gray-700 w-24 print:text-black">
          <div className="flex items-center gap-2">
            <span className="print:hidden">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-school-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-school-400" />}
            </span>
            {record.className.toUpperCase()}
          </div>
        </td>
        <td className="p-3 w-20" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            inputMode="numeric"
            className="w-full bg-transparent text-center border-b border-transparent hover:border-gray-200 focus:border-school-500 focus:ring-0 text-sm py-1 font-medium text-gray-600 print:border-none"
            value={record.totalStudents}
            onChange={(e) => onChange(record.id, 'totalStudents', parseInt(e.target.value) || 0)}
          />
        </td>
        <td className="p-3 w-20" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className={`w-full text-center border rounded-md py-1 text-sm font-bold focus:ring-2 focus:ring-school-100 focus:border-school-400 outline-none transition-all print:border-none ${
              isAbsent ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200 bg-white'
            }`}
            value={record.absentCount}
            onChange={(e) => onChange(record.id, 'absentCount', parseInt(e.target.value) || 0)}
          />
        </td>
        <td className="p-3 min-w-[150px]" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            placeholder={isAbsent ? "Nhập lý do..." : "Trống"}
            className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-school-500 focus:outline-none text-sm py-1 text-gray-700 placeholder-gray-300 print:placeholder-transparent"
            value={record.absentReason}
            onChange={(e) => onChange(record.id, 'absentReason', e.target.value)}
          />
        </td>
        <td className="p-3 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            placeholder="Tên GVCN"
            className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-school-500 focus:outline-none text-sm py-1 text-gray-600 placeholder-gray-200 print:placeholder-transparent"
            value={record.homeroomTeacher}
            onChange={(e) => onChange(record.id, 'homeroomTeacher', e.target.value)}
          />
        </td>
      </tr>
      
      {/* Expanded Detail View */}
      {isExpanded && (
        <tr className="bg-slate-50/50 print:hidden animate-fade-in">
          <td colSpan={6} className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Quick Reason Shortcuts */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0 flex items-center gap-1.5">
                    <Plus className="w-3 h-3 text-school-500" />
                    Gợi ý lý do nhanh
                  </p>
                  <button 
                    className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"
                    title="Sắp xếp danh sách lý do (Dự kiến)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REASONS.map(reason => (
                    <button
                      key={reason}
                      onClick={(e) => { e.stopPropagation(); handleQuickReason(reason); }}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-school-300 hover:text-school-600 hover:bg-school-50 transition-all shadow-sm active:scale-95"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Notes Field */}
              <div className="flex-[2]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-indigo-400" />
                    Ghi chú thêm cho lớp {record.className.toUpperCase()}
                  </p>
                  <button 
                    className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-gray-600"
                    title="Sắp xếp các dòng ghi chú (Dự kiến)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-school-100 focus:border-school-300 outline-none transition-all placeholder-gray-300 resize-none shadow-sm"
                  rows={2}
                  placeholder="Ví dụ: Vệ sinh chưa sạch, cả lớp nghiêm túc..."
                  value={record.notes || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange(record.id, 'notes', e.target.value)}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

export default ClassRow;