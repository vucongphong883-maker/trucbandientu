import React, { memo, useState } from 'react';
import { User, AlertCircle, ChevronDown, ChevronUp, MessageSquare, Plus, Info } from 'lucide-react';
import { ClassRecord } from '../types';

interface MobileClassCardProps {
  record: ClassRecord;
  onChange: (id: string, field: keyof ClassRecord, value: string | number) => void;
}

const QUICK_REASONS = ["Ốm", "Việc riêng", "Bỏ tiết", "Muộn"];

const MobileClassCard: React.FC<MobileClassCardProps> = memo(({ record, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAbsent = record.absentCount > 0;

  const handleQuickReason = (reason: string) => {
    const current = record.absentReason ? record.absentReason + ", " : "";
    onChange(record.id, 'absentReason', current + reason);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${
      isAbsent ? 'border-red-200 shadow-red-50' : isExpanded ? 'border-school-200 shadow-school-50' : 'border-gray-200'
    }`}>
      {/* Header Card */}
      <div 
        className="p-4 pb-3 border-b border-gray-100 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
            isAbsent ? 'bg-red-100 text-red-700' : 'bg-school-100 text-school-700'
          }`}>
            {record.className.toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">GV Chủ nhiệm</div>
            <input
              type="text"
              placeholder="Nhập tên..."
              className="font-bold text-gray-700 placeholder-gray-200 outline-none w-32 bg-transparent text-sm"
              value={record.homeroomTeacher}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChange(record.id, 'homeroomTeacher', e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAbsent && (
            <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-full text-[10px] font-black uppercase">
              <AlertCircle className="w-3 h-3" />
              <span>Vắng {record.absentCount}</span>
            </div>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-school-400" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
        </div>
      </div>

      {/* Main Stats (Visible always) */}
      <div className="p-4 pt-3 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 focus-within:ring-2 focus-within:ring-school-100 focus-within:border-school-400 transition-all">
            <label className="block text-[9px] text-gray-400 font-black uppercase mb-0.5">Sĩ số</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full bg-transparent font-black text-lg text-slate-700 outline-none"
              value={record.totalStudents}
              onChange={(e) => onChange(record.id, 'totalStudents', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={`rounded-xl p-2.5 border transition-all ${
            isAbsent ? 'bg-red-50 border-red-100 focus-within:ring-red-100' : 'bg-slate-50 border-slate-100 focus-within:ring-school-100'
          }`}>
            <label className={`block text-[9px] font-black uppercase mb-0.5 ${isAbsent ? 'text-red-400' : 'text-gray-400'}`}>Số vắng</label>
            <input
              type="number"
              inputMode="numeric"
              className={`w-full bg-transparent font-black text-lg outline-none ${isAbsent ? 'text-red-600' : 'text-slate-700'}`}
              value={record.absentCount}
              onChange={(e) => onChange(record.id, 'absentCount', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Reason Field */}
        <div className="relative">
          <label className="block text-[9px] text-gray-400 font-black uppercase mb-1">Lý do vắng</label>
          <input
            type="text"
            placeholder={isAbsent ? "Nhập lý do chi tiết..." : "Chưa ghi nhận lý do"}
            className={`w-full py-2.5 px-3 rounded-xl text-sm outline-none border transition-all font-medium ${
              isAbsent 
                ? 'bg-red-50/30 border-red-100 text-red-800 placeholder-red-200' 
                : 'bg-slate-50 border-slate-100 text-slate-600 focus:border-school-400 focus:bg-white'
            }`}
            value={record.absentReason}
            onChange={(e) => onChange(record.id, 'absentReason', e.target.value)}
          />
        </div>

        {/* Expandable Section */}
        {isExpanded && (
          <div className="pt-3 border-t border-gray-100 space-y-4 animate-fade-in">
            {/* Quick Reasons */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Plus className="w-3 h-3 text-school-500" />
                Lý do nhanh
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => handleQuickReason(reason)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 active:scale-95 transition-all shadow-sm"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Notes */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-indigo-400" />
                Ghi chú thêm
              </p>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-school-100 focus:border-school-400 outline-none transition-all placeholder-gray-300 resize-none"
                rows={3}
                placeholder="Ví dụ: Lớp trực nhật muộn, học sinh vi phạm đồng phục..."
                value={record.notes || ''}
                onChange={(e) => onChange(record.id, 'notes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Expansion Toggle Button (Footer) */}
        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full py-2 text-[10px] font-bold text-school-600 hover:text-school-700 transition-colors flex items-center justify-center gap-1 opacity-70"
          >
            <Info className="w-3 h-3" />
            XEM CHI TIẾT VÀ GHI CHÚ
          </button>
        )}
      </div>
    </div>
  );
});

export default MobileClassCard;