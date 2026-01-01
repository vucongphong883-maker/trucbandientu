import React, { useState, useMemo } from 'react';
import { X, BarChart3, TrendingUp, Calendar, AlertTriangle, Filter, ArrowRight } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { SavedReport } from '../types';
import { getReportHistory } from '../services/storageService';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeRange = 'week' | 'month' | 'sem1' | 'sem2' | 'all' | 'custom';

const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  // Custom range state
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const history = useMemo(() => getReportHistory(), [isOpen]);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    const now = new Date();
    
    return history.filter(report => {
      const reportDate = new Date(report.dutyDate);
      // Reset time part for accurate date comparison
      reportDate.setHours(0, 0, 0, 0); 
      
      switch (timeRange) {
        case 'week': {
          const firstDay = new Date(now);
          const day = firstDay.getDay() || 7; // Get current day number, convert Sun (0) to 7
          if (day !== 1) firstDay.setHours(-24 * (day - 1)); // Set to Monday
          firstDay.setHours(0,0,0,0);
          return reportDate >= firstDay;
        }
        case 'month':
          return reportDate.getMonth() === now.getMonth() && 
                 reportDate.getFullYear() === now.getFullYear();
        case 'sem1':
          // Sep 5 to Jan 15
          const month = reportDate.getMonth(); // 0-11
          return (month >= 8) || (month === 0 && reportDate.getDate() <= 15);
        case 'sem2':
          // Jan 16 to May 31
          const month2 = reportDate.getMonth();
          return (month2 > 0 || (month2 === 0 && reportDate.getDate() > 15)) && month2 <= 4;
        case 'custom':
          // String comparison works for YYYY-MM-DD
          return report.dutyDate >= customStart && report.dutyDate <= customEnd;
        case 'all':
        default:
          return true;
      }
    });
  }, [history, timeRange, customStart, customEnd]);

  // Aggregation Logic for Chart
  const chartData = useMemo(() => {
    const classStats: Record<string, number> = {};
    
    filteredData.forEach(report => {
      report.records.forEach(cls => {
        const abs = Number(cls.absentCount) || 0;
        classStats[cls.className] = (classStats[cls.className] || 0) + abs;
      });
    });

    // Convert to array and sort by class name properly
    return Object.keys(classStats)
      .map(key => ({ name: key.toUpperCase(), absences: classStats[key] }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [filteredData]);

  // Summary Stats
  const summary = useMemo(() => {
    const totalReports = filteredData.length;
    const totalAbsences = chartData.reduce((sum, item) => sum + item.absences, 0);
    const maxAbsentClass = chartData.length > 0 
      ? chartData.reduce((prev, current) => (prev.absences > current.absences) ? prev : current)
      : { name: 'N/A', absences: 0 };

    return { totalReports, totalAbsences, maxAbsentClass };
  }, [filteredData, chartData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-school-900 to-school-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
               <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Thống kê nền nếp</h3>
              <p className="text-school-100 text-xs opacity-90">Tổng hợp dữ liệu chuyên cần</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          
          {/* Filters Container */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-center gap-2 text-school-800 font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                <Filter className="w-4 h-4 text-school-500" />
                <span className="text-sm">Bộ lọc thời gian:</span>
              </div>
              <div className="flex bg-gray-200/80 p-1 rounded-xl gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                {[
                  { id: 'week', label: 'Tuần này' },
                  { id: 'month', label: 'Tháng này' },
                  { id: 'sem1', label: 'Học kỳ 1' },
                  { id: 'sem2', label: 'Học kỳ 2' },
                  { id: 'custom', label: 'Tùy chọn' },
                  { id: 'all', label: 'Tất cả' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id as TimeRange)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      timeRange === range.id 
                        ? 'bg-white text-school-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {timeRange === 'custom' && (
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm animate-fade-in self-end">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Từ ngày</span>
                  <input 
                    type="date" 
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-school-500 outline-none w-full"
                  />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Đến ngày</span>
                  <input 
                    type="date" 
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-school-500 outline-none w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Số buổi trực</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalReports}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-50 text-red-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tổng lượt vắng</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalAbsences}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Vắng nhiều nhất</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-800">{summary.maxAbsentClass.name}</p>
                  <span className="text-sm text-gray-400">({summary.maxAbsentClass.absences})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
            <h4 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-school-500" />
              Biểu đồ học sinh vắng theo lớp
            </h4>
            
            {chartData.length > 0 ? (
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="absences" name="Số học sinh vắng" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.absences > 5 ? '#ef4444' : entry.absences > 0 ? '#0ea5e9' : '#e2e8f0'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                <p>Chưa có dữ liệu cho khoảng thời gian này.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;