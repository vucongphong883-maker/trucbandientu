import React, { memo } from 'react';
import { ClassRecord } from '../types';

interface ClassRowProps {
  record: ClassRecord;
  index: number;
  onChange: (id: string, field: keyof ClassRecord, value: string | number) => void;
}

const ClassRow: React.FC<ClassRowProps> = memo(({ record, index, onChange }) => {
  const isAbsent = record.absentCount > 0;

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isAbsent ? 'bg-red-50/30' : ''}`}>
      <td className="p-3 text-center text-gray-500 font-medium text-sm w-12">{index + 1}</td>
      <td className="p-3 font-bold text-gray-700 w-16">{record.className.toUpperCase()}</td>
      <td className="p-3 w-20">
        <input
          type="number"
          inputMode="numeric"
          className="w-full bg-transparent text-center border-b border-gray-200 focus:border-blue-500 focus:ring-0 text-sm py-1"
          value={record.totalStudents}
          onChange={(e) => onChange(record.id, 'totalStudents', parseInt(e.target.value) || 0)}
        />
      </td>
      <td className="p-3 w-20">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          className={`w-full text-center border rounded-md py-1 text-sm font-semibold focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all ${
            isAbsent ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-600 border-gray-200 bg-white'
          }`}
          value={record.absentCount}
          onChange={(e) => onChange(record.id, 'absentCount', parseInt(e.target.value) || 0)}
        />
      </td>
      <td className="p-3 min-w-[150px]">
        <input
          type="text"
          placeholder={isAbsent ? "Nhập lý do..." : ""}
          className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none text-sm py-1 text-gray-700 placeholder-gray-300"
          value={record.absentReason}
          onChange={(e) => onChange(record.id, 'absentReason', e.target.value)}
        />
      </td>
      <td className="p-3 min-w-[120px]">
        <input
          type="text"
          className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none text-sm py-1 text-gray-600"
          value={record.homeroomTeacher}
          onChange={(e) => onChange(record.id, 'homeroomTeacher', e.target.value)}
        />
      </td>
    </tr>
  );
});

export default ClassRow;