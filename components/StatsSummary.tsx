import React from 'react';
import { Users, UserMinus, AlertCircle } from 'lucide-react';
import { ClassRecord } from '../types';

interface StatsSummaryProps {
  records: ClassRecord[];
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ records }) => {
  const totalStudents = records.reduce((acc, curr) => acc + (Number(curr.totalStudents) || 0), 0);
  const totalAbsent = records.reduce((acc, curr) => acc + (Number(curr.absentCount) || 0), 0);
  const classesWithAbsence = records.filter(r => r.absentCount > 0).length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6 no-print">
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col items-center justify-center text-center">
        <Users className="w-5 h-5 text-blue-600 mb-1" />
        <span className="text-xs text-blue-500 font-medium uppercase">Tổng HS</span>
        <span className="text-xl font-bold text-blue-700">{totalStudents}</span>
      </div>
      
      <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex flex-col items-center justify-center text-center">
        <UserMinus className="w-5 h-5 text-red-600 mb-1" />
        <span className="text-xs text-red-500 font-medium uppercase">Vắng</span>
        <span className="text-xl font-bold text-red-700">{totalAbsent}</span>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-5 h-5 text-amber-600 mb-1" />
        <span className="text-xs text-amber-500 font-medium uppercase">Lớp Vắng</span>
        <span className="text-xl font-bold text-amber-700">{classesWithAbsence}</span>
      </div>
    </div>
  );
};

export default StatsSummary;