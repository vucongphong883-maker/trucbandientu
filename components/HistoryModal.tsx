import React, { useState, useMemo } from 'react';
import { X, Trash2, Clock, User, Calendar, Search } from 'lucide-react';
import { SavedReport } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: SavedReport[];
  onSelect: (report: SavedReport) => void;
  onDelete: (id: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, reports, onSelect, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;
    const lowerTerm = searchTerm.toLowerCase();
    return reports.filter(report => 
      (report.teacherName || '').toLowerCase().includes(lowerTerm) ||
      report.dutyDate.includes(lowerTerm) ||
      report.session.toLowerCase().includes(lowerTerm) ||
      new Date(report.dutyDate).toLocaleDateString('vi-VN').includes(lowerTerm)
    );
  }, [reports, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 print:hidden animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col transform transition-all">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-school-50 rounded-t-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-school-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-school-600" />
              Lịch sử báo cáo
            </h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm giáo viên, ngày, buổi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-school-500 focus:border-transparent outline-none shadow-sm"
              autoFocus
            />
          </div>
        </div>
        
        {/* List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 scrollbar-thin scrollbar-thumb-gray-200">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center text-gray-400">
              {searchTerm ? (
                <>
                  <Search className="w-12 h-12 mb-3 opacity-20" />
                  <p>Không tìm thấy kết quả nào.</p>
                </>
              ) : (
                <>
                  <Clock className="w-12 h-12 mb-3 opacity-20" />
                  <p>Chưa có báo cáo nào được lưu.</p>
                </>
              )}
            </div>
          ) : (
            filteredReports.map((report) => (
              <div 
                key={report.id} 
                className="border border-gray-200 rounded-lg p-3 hover:border-school-400 hover:bg-school-50/50 hover:shadow-md transition-all bg-white group relative"
              >
                <div 
                  className="cursor-pointer flex-1 pr-8" 
                  onClick={() => onSelect(report)}
                  title="Nhấn để tải lại báo cáo này"
                >
                  <div className="flex items-center gap-2 mb-2">
                     <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-700">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.dutyDate).toLocaleDateString('vi-VN')}
                     </div>
                     <span className={`text-xs px-2 py-1 rounded font-bold ${report.session === 'Sáng' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                       {report.session}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-gray-800 font-medium text-sm mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{report.teacherName || 'Không tên'}</span>
                  </div>
                  
                  <div className="text-[10px] text-gray-400 mt-2 flex justify-between items-center">
                    <span>Đã lưu: {new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
                      onDelete(report.id);
                    }
                  }}
                  className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 font-medium">
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;