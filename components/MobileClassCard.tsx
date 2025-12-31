import React, { memo } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { ClassRecord } from '../types';

interface MobileClassCardProps {
  record: ClassRecord;
  onChange: (id: string, field: keyof ClassRecord, value: string | number) => void;
}

const MobileClassCard: React.FC<MobileClassCardProps> = memo(({ record, onChange }) => {
  const isAbsent = record.absentCount > 0;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${isAbsent ? 'border-red-200 shadow-red-50' : 'border-gray-200'}`}>
      {/* Header Card */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${isAbsent ? 'bg-red-100 text-red-700' : 'bg-school-100 text-school-700'}`}>
            {record.className.toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase">Giáo viên CN</div>
            <input
              type="text"
              placeholder="Nhập tên GV..."
              className="font-medium text-gray-700 placeholder-gray-300 outline-none w-32 bg-transparent text-sm"
              value={record.homeroomTeacher}
              onChange={(e) => onChange(record.id, 'homeroomTeacher', e.target.value)}
            />
          </div>
        </div>
        {isAbsent && (
          <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
            <AlertCircle className="w-3 h-3" />
            <span>Vắng {record.absentCount}</span>
          </div>
        )}
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Sĩ số</label>
          <input
            type="number"
            inputMode="numeric"
            className="w-full bg-transparent font-bold text-lg text-gray-800 outline-none"
            value={record.totalStudents}
            onChange={(e) => onChange(record.id, 'totalStudents', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className={`rounded-lg p-2 border focus-within:ring-2 transition-all ${isAbsent ? 'bg-red-50 border-red-200 focus-within:ring-red-100' : 'bg-gray-50 border-gray-100 focus-within:ring-blue-100 focus-within:border-blue-400'}`}>
          <label className={`block text-[10px] font-bold uppercase mb-1 ${isAbsent ? 'text-red-400' : 'text-gray-400'}`}>Vắng</label>
          <input
            type="number"
            inputMode="numeric"
            className={`w-full bg-transparent font-bold text-lg outline-none ${isAbsent ? 'text-red-600' : 'text-gray-800'}`}
            value={record.absentCount}
            onChange={(e) => onChange(record.id, 'absentCount', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Full width reason input */}
      <div className="relative">
        <input
          type="text"
          placeholder={isAbsent ? "Nhập lý do vắng..." : "Lý do (nếu có)..."}
          className={`w-full py-3 px-3 rounded-lg text-sm outline-none border transition-all ${
            isAbsent 
              ? 'bg-red-50/50 border-red-100 text-red-800 placeholder-red-300 focus:border-red-300' 
              : 'bg-gray-50 border-gray-100 text-gray-700 focus:border-blue-400 focus:bg-white'
          }`}
          value={record.absentReason}
          onChange={(e) => onChange(record.id, 'absentReason', e.target.value)}
        />
      </div>
    </div>
  );
});

export default MobileClassCard;