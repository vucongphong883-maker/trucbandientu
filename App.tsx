
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Save, 
  Printer, 
  Sparkles, 
  CalendarDays, 
  User, 
  Sun, 
  Moon,
  ChevronDown,
  FileText,
  History,
  FileDown,
  Share2,
  Send,
  ListFilter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wand2,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Palette,
  Camera,
  WifiOff,
  Wifi
} from 'lucide-react';
import { INITIAL_CLASSES, SCHOOL_NAME, SCHOOL_YEAR, REPORT_TITLE } from './constants';
import { ClassRecord, DutyReport, SavedReport, SummaryStatus } from './types';
import ClassRow from './components/ClassRow';
import MobileClassCard from './components/MobileClassCard';
import StatsSummary from './components/StatsSummary';
import HistoryModal from './components/HistoryModal';
import PrintSettingsModal, { PrintConfig } from './components/PrintSettingsModal';
import AiPromptSettingsModal from './components/AiPromptSettingsModal';
import ThemeSettingsModal from './components/ThemeSettingsModal';
import StatisticsModal from './components/StatisticsModal';
import Toast from './components/Toast';
import ImageManager from './components/ImageManager';
import { generateDutySummary, refineSectionText, DEFAULT_AI_INSTRUCTION } from './services/geminiService';
import { saveReportToHistory, getReportHistory, deleteReportFromHistory } from './services/storageService';

const App: React.FC = () => {
  // State
  const [teacherName, setTeacherName] = useState('');
  const [dutyDate, setDutyDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState<'Sáng' | 'Chiều'>('Sáng');
  const [records, setRecords] = useState<ClassRecord[]>(INITIAL_CLASSES);
  const [teacherActivities, setTeacherActivities] = useState('');
  const [studentActivities, setStudentActivities] = useState('');
  const [otherActivities, setOtherActivities] = useState('');
  
  // Connectivity State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Image States
  const [teacherImages, setTeacherImages] = useState<string[]>([]);
  const [studentImages, setStudentImages] = useState<string[]>([]);
  const [otherImages, setOtherImages] = useState<string[]>([]);

  // AI State
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>(SummaryStatus.IDLE);
  const [aiSummary, setAiSummary] = useState('');
  const [refiningField, setRefiningField] = useState<'teacher' | 'student' | 'other' | null>(null);
  const [aiInstruction, setAiInstruction] = useState(() => {
    return localStorage.getItem('ai_instruction') || DEFAULT_AI_INSTRUCTION;
  });
  const [showAiSettings, setShowAiSettings] = useState(false);

  // Theme State
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [currentThemeColor, setCurrentThemeColor] = useState(() => localStorage.getItem('school_primary_color') || '#0ea5e9');

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [historyReports, setHistoryReports] = useState<SavedReport[]>([]);

  // Statistics State
  const [showStatistics, setShowStatistics] = useState(false);

  // Print Config State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    includeStats: true,
    includeClassList: true,
    includeTeacherActivities: true,
    includeStudentActivities: true,
    includeOtherActivities: true,
    includeAiSummary: true,
    includeSignatures: true,
  });

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClassRecord; direction: 'asc' | 'desc' } | null>(null);

  // Unsaved Changes State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Handle Online/Offline Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToast({ show: true, message: 'Đã khôi phục kết nối internet.', type: 'success' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      setToast({ show: true, message: 'Đang hoạt động Ngoại tuyến (Offline).', type: 'error' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load history on mount
  useEffect(() => {
    setHistoryReports(getReportHistory());
  }, []);

  // Handle AI Instruction update
  const handleSaveAiInstruction = (newInstruction: string) => {
    setAiInstruction(newInstruction);
    localStorage.setItem('ai_instruction', newInstruction);
    setToast({ show: true, message: 'Đã lưu cấu hình AI thành công!', type: 'success' });
  };

  // Handle Before Unload (Warn about unsaved changes)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for modern browsers
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handlers
  const handleRecordChange = useCallback((id: string, field: keyof ClassRecord, value: string | number) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
    setHasUnsavedChanges(true);
  }, []);

  const handleExportPdfClick = () => {
    setShowPrintModal(true);
  };

  const handleConfirmPrint = () => {
    setShowPrintModal(false);
    // Allow DOM to update classes before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportExcel = () => {
    try {
      // Byte Order Mark for UTF-8 Excel compatibility
      const BOM = '\uFEFF';
      let csvContent = `${SCHOOL_NAME}\n`;
      csvContent += `Năm học: ${SCHOOL_YEAR}\n`;
      csvContent += `${REPORT_TITLE}\n\n`;
      csvContent += `Thông tin báo cáo:\n`;
      csvContent += `Ngày: ${new Date(dutyDate).toLocaleDateString('vi-VN')}, Buổi: ${session}\n`;
      csvContent += `Giáo viên trực: ${teacherName}\n\n`;
      
      // Table Header
      csvContent += "STT,Lớp,Sĩ số,Số vắng,Lý do,GV Chủ nhiệm,Ghi chú chi tiết\n";
      
      // Table Content
      records.forEach((r, index) => {
        const row = [
          index + 1,
          r.className.toUpperCase(),
          r.totalStudents,
          r.absentCount,
          `"${(r.absentReason || '').replace(/"/g, '""')}"`,
          `"${(r.homeroomTeacher || '').replace(/"/g, '""')}"`,
          `"${(r.notes || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(",") + "\n";
      });
      
      // Totals
      const totalStudents = records.reduce((sum, r) => sum + (Number(r.totalStudents) || 0), 0);
      const totalAbsent = records.reduce((sum, r) => sum + (Number(r.absentCount) || 0), 0);
      csvContent += `,,${totalStudents},${totalAbsent},,,\n\n`;
      
      // Activity Sections
      csvContent += `BÁO CÁO CÁC MỤC CHÍNH\n`;
      csvContent += `1. Hoạt động giáo viên:,"${teacherActivities.replace(/"/g, '""')}"\n`;
      csvContent += `2. Hoạt động học sinh:,"${studentActivities.replace(/"/g, '""')}"\n`;
      csvContent += `3. Hoạt động khác/Sự cố:,"${otherActivities.replace(/"/g, '""')}"\n`;

      if (aiSummary) {
        csvContent += `Tổng hợp AI:,"${aiSummary.replace(/"/g, '""')}"\n`;
      }

      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Bao_cao_truc_ban_${dutyDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({ show: true, message: 'Đã xuất file Excel (CSV) thành công!', type: 'success' });
    } catch (error) {
      console.error("Export error:", error);
      setToast({ show: true, message: 'Lỗi khi xuất file Excel.', type: 'error' });
    }
  };

  const handleSendZalo = () => {
    const totalAbsent = records.reduce((sum, r) => sum + Number(r.absentCount), 0);
    const classesWithAbsence = records.filter(r => r.absentCount > 0);

    let text = `📋 *BÁO CÁO TRỰC BAN*\n`;
    text += `--------------------------------\n`;
    text += `📅 Ngày: ${new Date(dutyDate).toLocaleDateString('vi-VN')} (${session})\n`;
    text += `👤 GV trực: ${teacherName}\n\n`;
    
    text += `*1. TÌNH HÌNH SĨ SỐ:*\n`;
    text += `- Tổng vắng: ${totalAbsent} em\n`;
    if (classesWithAbsence.length > 0) {
      classesWithAbsence.forEach(c => {
        text += `  • Lớp ${c.className.toUpperCase()}: vắng ${c.absentCount} (${c.absentReason || 'Kro'})\n`;
      });
    } else {
      text += `- Các lớp đi học đầy đủ.\n`;
    }

    text += `\n*2. HOẠT ĐỘNG GIÁO VIÊN:*\n${teacherActivities ? teacherActivities.trim() : '- Thực hiện đúng quy định.'}\n`;
    text += `\n*3. HOẠT ĐỘNG HỌC SINH:*\n${studentActivities ? studentActivities.trim() : '- Ngoan, nề nếp tốt.'}\n`;
    
    if (otherActivities) {
      text += `\n*4. SỰ CỐ / KHÁC:*\n${otherActivities.trim()}\n`;
    }

    // AI Summary if available
    if (aiSummary) {
      text += `\n*📝 TỔNG HỢP (AI):*\n${aiSummary}\n`;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      if (confirm("Đã sao chép nội dung báo cáo!\n\nNhấn OK để mở Zalo và dán (Paste) báo cáo vào nhóm trường.")) {
        window.open('https://zalo.me/', '_blank');
      }
    }).catch(err => {
      console.error('Failed to copy: ', err);
      setToast({ show: true, message: 'Không thể sao chép nội dung.', type: 'error' });
    });
  };

  const handleSave = () => {
    const report: DutyReport = {
      teacherName,
      dutyDate,
      session,
      records,
      teacherActivities,
      studentActivities,
      otherActivities,
      teacherImages,
      studentImages,
      otherImages
    };
    
    saveReportToHistory(report);
    setHistoryReports(getReportHistory()); // Refresh list
    setHasUnsavedChanges(false);
    
    // Show Toast
    setToast({ show: true, message: 'Đã lưu báo cáo thành công!', type: 'success' });
  };

  const handleLoadHistory = (report: SavedReport) => {
    setTeacherName(report.teacherName);
    setDutyDate(report.dutyDate);
    setSession(report.session);
    setRecords(report.records);
    setTeacherActivities(report.teacherActivities || '');
    setStudentActivities(report.studentActivities);
    setOtherActivities(report.otherActivities);
    setTeacherImages(report.teacherImages || []);
    setStudentImages(report.studentImages || []);
    setOtherImages(report.otherImages || []);
    
    // Reset AI summary when loading new data
    setAiSummary(''); 
    setSummaryStatus(SummaryStatus.IDLE);
    setHasUnsavedChanges(false);
    
    setShowHistory(false);
    setToast({ show: true, message: 'Đã tải dữ liệu báo cáo.', type: 'success' });
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteReportFromHistory(id);
    setHistoryReports(updated);
  };

  const handleAiSummary = async () => {
    if (!isOnline) {
      setToast({ show: true, message: 'Cần kết nối internet để sử dụng AI.', type: 'error' });
      return;
    }

    setSummaryStatus(SummaryStatus.LOADING);
    const report: DutyReport = {
      teacherName,
      dutyDate,
      session,
      records,
      teacherActivities,
      studentActivities,
      otherActivities
    };
    
    const result = await generateDutySummary(report, aiInstruction);
    setAiSummary(result);
    setSummaryStatus(SummaryStatus.SUCCESS);
  };

  const handleRefineText = async (field: 'teacher' | 'student' | 'other') => {
    if (!isOnline) {
      setToast({ show: true, message: 'Cần kết nối internet để sử dụng AI.', type: 'error' });
      return;
    }

    let currentText = '';
    let sectionName = '';

    if (field === 'teacher') {
      currentText = teacherActivities;
      sectionName = 'Hoạt động giáo viên';
    } else if (field === 'student') {
      currentText = studentActivities;
      sectionName = 'Hoạt động học sinh';
    } else {
      currentText = otherActivities;
      sectionName = 'Hoạt động khác';
    }

    if (!currentText.trim()) {
      setToast({ show: true, message: 'Vui lòng nhập nội dung trước khi dùng AI.', type: 'error' });
      return;
    }

    setRefiningField(field);
    try {
      const refinedText = await refineSectionText(currentText, sectionName);
      
      if (field === 'teacher') setTeacherActivities(refinedText);
      else if (field === 'student') setStudentActivities(refinedText);
      else setOtherActivities(refinedText);
      
      setHasUnsavedChanges(true);
      setToast({ show: true, message: 'Đã cải thiện văn phong.', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Lỗi khi kết nối AI.', type: 'error' });
    } finally {
      setRefiningField(null);
    }
  };

  // Sorting Logic
  const handleSort = (key: keyof ClassRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = useMemo(() => {
    let sortableItems = [...records];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue, undefined, { numeric: true })
            : bValue.localeCompare(aValue, undefined, { numeric: true });
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [records, sortConfig]);

  const getSortIcon = (key: keyof ClassRecord) => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-50 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-school-600" /> 
      : <ArrowDown className="w-3 h-3 text-school-600" />;
  };

  const currentDateDisplay = new Date(dutyDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen pb-12 print:pb-0 font-sans bg-gray-50/50">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        type={toast.type}
      />

      {/* Navbar - Mobile Friendly */}
      <nav className="bg-school-900 text-white shadow-lg sticky top-0 z-50 print:hidden transition-all">
        <div className="max-w-4xl mx-auto px-4 py-2 md:py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm relative">
              <FileText className="w-5 h-5 text-white" />
              {!isOnline && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                  <WifiOff className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold leading-tight">Sổ Trực Ban</h1>
                {!isOnline && <span className="text-[8px] bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded-full border border-red-500/30 uppercase font-black">Offline</span>}
              </div>
              <p className="text-[10px] md:text-xs text-school-100 opacity-80 hidden md:block">THCS Phượng Sơn Số 2</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setShowThemeSettings(true)}
              className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"
              title="Giao diện"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowStatistics(true)}
              className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors relative"
              title="Thống kê"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors relative"
              title="Lịch sử"
            >
              <History className="w-5 h-5" />
            </button>
            <button 
              onClick={handleExportPdfClick}
              className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"
              title="In / Xuất PDF"
            >
              <FileDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-3 md:p-8 print:p-0 print:max-w-none">
        {/* Printable Header */}
        <div className="text-center mb-6 md:mb-8 border-b-2 border-school-100 pb-6 print:border-none print:pb-2">
          <h2 className="text-base md:text-lg font-bold text-school-900 uppercase tracking-wide">{SCHOOL_NAME}</h2>
          <p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">Năm học: {SCHOOL_YEAR}</p>
          <h1 className="text-xl md:text-3xl font-extrabold text-school-600 mt-2 md:mt-4 mb-2 uppercase">{REPORT_TITLE}</h1>
          <p className="text-gray-400 text-[10px] italic print:hidden">Mẫu báo cáo trực tuyến chuẩn hóa</p>
        </div>

        {/* Input Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 mb-6 print:shadow-none print:border-none print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Giáo viên trực ban</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 print:hidden" />
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => { setTeacherName(e.target.value); setHasUnsavedChanges(true); }}
                    placeholder="Nhập họ tên..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-500 focus:border-transparent outline-none transition-all print:pl-0 print:bg-transparent print:border-none print:text-lg print:font-bold print:p-0 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
               <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Ngày trực</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 print:hidden" />
                  <input
                    type="date"
                    value={dutyDate}
                    onChange={(e) => { setDutyDate(e.target.value); setHasUnsavedChanges(true); }}
                    className="w-full pl-10 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-500 focus:border-transparent outline-none transition-all print:hidden text-sm md:text-base"
                  />
                  {/* Print only date display */}
                  <div className="hidden print:block text-black font-medium text-lg">
                    {currentDateDisplay}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Buổi</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 print:hidden">
                    {session === 'Sáng' ? <Sun className="w-4 h-4 text-amber-500"/> : <Moon className="w-4 h-4 text-indigo-500"/>}
                  </div>
                  <select
                    value={session}
                    onChange={(e) => { setSession(e.target.value as 'Sáng' | 'Chiều'); setHasUnsavedChanges(true); }}
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-school-500 outline-none transition-all print:hidden text-sm md:text-base"
                  >
                    <option value="Sáng">Buổi Sáng</option>
                    <option value="Chiều">Buổi Chiều</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none print:hidden" />
                  <div className="hidden print:block text-black font-medium text-lg">
                    {session}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={!printConfig.includeStats ? 'print:hidden' : ''}>
          <StatsSummary records={records} />
        </div>

        {/* Main List / Table */}
        <div className={`mb-8 ${!printConfig.includeClassList ? 'print:hidden' : ''}`}>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2 print:hidden">
             <ListFilter className="w-3 h-3" />
             Danh sách lớp
           </h3>

           {/* Mobile View: Cards (Hidden on Desktop, Hidden on Print) */}
           <div className="space-y-3 md:hidden print:hidden">
             {sortedRecords.map((record) => (
               <MobileClassCard 
                 key={record.id}
                 record={record}
                 onChange={handleRecordChange}
               />
             ))}
           </div>

           {/* Desktop/Print View: Table (Hidden on Mobile, Visible on Print) */}
           <div className="hidden md:block print:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-black print:rounded-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-school-50 text-school-900 text-xs uppercase tracking-wider print:bg-gray-100 print:text-black">
                    <th className="p-3 font-bold border-b border-school-100 w-12 text-center print:border-black">STT</th>
                    
                    {/* Sortable Headers */}
                    <th 
                      className="p-3 font-bold border-b border-school-100 w-16 print:border-black cursor-pointer group hover:bg-school-100/50 transition-colors"
                      onClick={() => handleSort('className')}
                      title="Sắp xếp theo tên lớp"
                    >
                      <div className="flex items-center gap-1">
                        Lớp {getSortIcon('className')}
                      </div>
                    </th>
                    
                    <th 
                      className="p-3 font-bold border-b border-school-100 w-20 text-center print:border-black cursor-pointer group hover:bg-school-100/50 transition-colors"
                      onClick={() => handleSort('totalStudents')}
                      title="Sắp xếp theo sĩ số"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Sĩ số {getSortIcon('totalStudents')}
                      </div>
                    </th>
                    
                    <th 
                      className="p-3 font-bold border-b border-school-100 w-20 text-center print:border-black cursor-pointer group hover:bg-school-100/50 transition-colors"
                      onClick={() => handleSort('absentCount')}
                      title="Sắp xếp theo số lượng vắng"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Vắng {getSortIcon('absentCount')}
                      </div>
                    </th>
                    
                    <th className="p-3 font-bold border-b border-school-100 min-w-[150px] print:border-black">Lý do</th>
                    <th className="p-3 font-bold border-b border-school-100 min-w-[120px] print:border-black">GVCN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 print:divide-black">
                  {sortedRecords.map((record, index) => (
                    <ClassRow 
                      key={record.id} 
                      record={record} 
                      index={index} 
                      onChange={handleRecordChange} 
                    />
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-50 font-bold print:bg-transparent print:border-t-2 print:border-black">
                    <td colSpan={2} className="p-3 text-right uppercase text-xs text-gray-500 print:text-black">Tổng cộng</td>
                    <td className="p-3 text-center text-school-700 print:text-black">
                      {records.reduce((sum, r) => sum + (Number(r.totalStudents) || 0), 0)}
                    </td>
                    <td className="p-3 text-center text-red-600 print:text-black">
                      {records.reduce((sum, r) => sum + (Number(r.absentCount) || 0), 0)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activities Text Areas */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          
          <div className={`bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 ${!printConfig.includeTeacherActivities ? 'print:hidden' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-school-800 uppercase flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full inline-block"></span>
                1. Hoạt động giáo viên
              </h3>
              <button 
                onClick={() => handleRefineText('teacher')}
                disabled={refiningField !== null || !teacherActivities.trim() || !isOnline}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all print:hidden ${
                  !isOnline 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : refiningField === 'teacher' 
                      ? 'bg-indigo-100 text-indigo-700 cursor-wait' 
                      : teacherActivities.trim() 
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
                title={isOnline ? "Sử dụng AI để viết lại văn phong sư phạm hơn" : "Cần mạng để dùng AI"}
              >
                {refiningField === 'teacher' ? (
                  <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                <span>{refiningField === 'teacher' ? 'Đang viết...' : 'Viết lại'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={teacherActivities}
              onChange={(e) => { setTeacherActivities(e.target.value); setHasUnsavedChanges(true); }}
              placeholder="Ghi nhận hoạt động giảng dạy, công tác chủ nhiệm..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-500 outline-none text-base md:text-sm leading-relaxed print:bg-transparent print:border-none print:p-0 print:resize-none"
            ></textarea>
            
            {/* Image Manager for Section 1 */}
            <ImageManager 
              images={teacherImages} 
              onImagesChange={(imgs) => { setTeacherImages(imgs); setHasUnsavedChanges(true); }} 
              label="Hoạt động giáo viên"
            />

            {/* Dotted lines for print simulation if empty */}
            <div className="hidden print:block text-gray-400 mt-2 leading-8">
              {!teacherActivities && "......................................................................................................................................................................................................................................................................................."}
            </div>
          </div>

          <div className={`bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 ${!printConfig.includeStudentActivities ? 'print:hidden' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-school-800 uppercase flex items-center gap-2">
                <span className="w-1 h-4 bg-school-500 rounded-full inline-block"></span>
                2. Hoạt động của học sinh
              </h3>
              <button 
                onClick={() => handleRefineText('student')}
                disabled={refiningField !== null || !studentActivities.trim() || !isOnline}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all print:hidden ${
                  !isOnline 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : refiningField === 'student' 
                      ? 'bg-indigo-100 text-indigo-700 cursor-wait' 
                      : studentActivities.trim() 
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
                title={isOnline ? "Sử dụng AI để viết lại văn phong sư phạm hơn" : "Cần mạng để dùng AI"}
              >
                {refiningField === 'student' ? (
                  <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                <span>{refiningField === 'student' ? 'Đang viết...' : 'Viết lại'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={studentActivities}
              onChange={(e) => { setStudentActivities(e.target.value); setHasUnsavedChanges(true); }}
              placeholder="Ghi nhận tình hình nề nếp, vệ sinh, học tập..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-500 outline-none text-base md:text-sm leading-relaxed print:bg-transparent print:border-none print:p-0 print:resize-none"
            ></textarea>

            {/* Image Manager for Section 2 */}
            <ImageManager 
              images={studentImages} 
              onImagesChange={(imgs) => { setStudentImages(imgs); setHasUnsavedChanges(true); }} 
              label="Hoạt động học sinh"
            />

            {/* Dotted lines for print simulation if empty */}
            <div className="hidden print:block text-gray-400 mt-2 leading-8">
              {!studentActivities && "......................................................................................................................................................................................................................................................................................."}
            </div>
          </div>

          <div className={`bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 ${!printConfig.includeOtherActivities ? 'print:hidden' : ''}`}>
             <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-school-800 uppercase flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded-full inline-block"></span>
                3. Hoạt động khác / Sự cố
              </h3>
              <button 
                onClick={() => handleRefineText('other')}
                disabled={refiningField !== null || !otherActivities.trim() || !isOnline}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all print:hidden ${
                  !isOnline 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : refiningField === 'other' 
                      ? 'bg-indigo-100 text-indigo-700 cursor-wait' 
                      : otherActivities.trim() 
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
                title={isOnline ? "Sử dụng AI để viết lại văn phong sư phạm hơn" : "Cần mạng để dùng AI"}
              >
                {refiningField === 'other' ? (
                  <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                <span>{refiningField === 'other' ? 'Đang viết...' : 'Viết lại'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={otherActivities}
              onChange={(e) => { setOtherActivities(e.target.value); setHasUnsavedChanges(true); }}
              placeholder="Ghi nhận các vấn đề khác nếu có..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-500 outline-none text-base md:text-sm leading-relaxed print:bg-transparent print:border-none print:p-0 print:resize-none"
            ></textarea>

            {/* Image Manager for Section 3 */}
            <ImageManager 
              images={otherImages} 
              onImagesChange={(imgs) => { setOtherImages(imgs); setHasUnsavedChanges(true); }} 
              label="Hoạt động khác"
            />

            <div className="hidden print:block text-gray-400 mt-2 leading-8">
               {!otherActivities && "......................................................................................................................................................................................................................................................................................."}
            </div>
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className={`mb-8 ${!printConfig.includeAiSummary ? 'print:hidden' : 'print:mb-4'}`}>
           <div className="flex justify-between items-center mb-2 px-1">
             <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 print:hidden" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider print:hidden">
                  Trợ lý AI tổng hợp
                </h3>
                {!isOnline && <span className="text-[10px] text-red-500 font-bold ml-1 print:hidden">(Yêu cầu mạng)</span>}
             </div>
             <button 
                onClick={() => setShowAiSettings(true)}
                className="p-1.5 text-gray-400 hover:text-school-600 hover:bg-school-50 rounded-lg transition-all print:hidden"
                title="Cấu hình chỉ dẫn AI"
             >
               <Settings className="w-4 h-4" />
             </button>
           </div>
           
           {summaryStatus === SummaryStatus.SUCCESS && aiSummary && (
             <div className="bg-school-50/50 border border-school-100 rounded-xl p-5 mb-4 animate-fade-in print:bg-white print:border-gray-200 print:shadow-none print:p-0 print:border-none">
               <h3 className="text-school-800 font-bold text-sm mb-2 flex items-center gap-2 print:text-black print:uppercase print:mb-1">
                 <Sparkles className="w-4 h-4 print:hidden text-school-500" />
                 Báo cáo tổng hợp từ AI
               </h3>
               <div className="text-sm text-school-900 whitespace-pre-line leading-relaxed print:text-black print:text-sm">
                 {aiSummary}
               </div>
             </div>
           )}
        </div>

        {/* Signatures for Print */}
        <div className={`hidden print:flex justify-between mt-12 px-8 ${!printConfig.includeSignatures ? 'print:hidden' : ''}`}>
           <div className="text-center">
             <p className="italic text-sm text-gray-600">.........., ngày......tháng......năm......</p>
             <p className="font-bold mt-2 uppercase text-sm">Người lập báo cáo</p>
             <p className="mt-16 text-sm">{teacherName}</p>
           </div>
           <div className="text-center">
             <p className="font-bold mt-8 uppercase text-sm">Ban Giám Hiệu</p>
           </div>
        </div>

        {/* Action Buttons (Sticky Bottom on Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-2 justify-center z-40 print:hidden md:static md:bg-transparent md:border-none md:shadow-none md:p-0 md:justify-end md:gap-3 safe-area-bottom">
          
          <button
            onClick={handleAiSummary}
            disabled={summaryStatus === SummaryStatus.LOADING || !isOnline}
            className={`flex items-center gap-2 px-3 py-3 border rounded-xl font-bold transition-all active:scale-95 md:px-5 flex-1 md:flex-none justify-center ${
              !isOnline 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-700'
            }`}
          >
             {summaryStatus === SummaryStatus.LOADING ? (
               <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
             ) : (
               <Sparkles className="w-5 h-5" />
             )}
             <span className="hidden md:inline">AI Tổng hợp</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-3 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-all active:scale-95 md:px-5 flex-1 md:flex-none justify-center"
            title="Xuất tệp Excel (CSV)"
          >
             <FileSpreadsheet className="w-5 h-5" />
             <span className="hidden md:inline">Xuất Excel</span>
          </button>

          <button
            onClick={handleSendZalo}
            className="flex items-center gap-2 px-3 py-3 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-all active:scale-95 md:px-5 flex-1 md:flex-none justify-center"
            title="Gửi nội dung qua Zalo"
          >
             <Share2 className="w-5 h-5" />
             <span className="hidden md:inline">Gửi Zalo</span>
          </button>

          <button 
            id="save-btn"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold shadow-sm transition-all active:scale-95 md:px-5 flex-1 md:flex-none justify-center"
          >
            <Save className="w-5 h-5" />
            <span className="hidden md:inline">Lưu Offline</span>
          </button>

          <button 
            onClick={handleExportPdfClick}
            className="flex items-center gap-2 px-4 py-3 bg-school-600 hover:bg-school-700 text-white rounded-xl font-bold shadow-lg shadow-school-200 transition-all active:scale-95 md:px-5 flex-1 md:flex-none justify-center"
          >
            <FileDown className="w-5 h-5" />
            <span className="md:inline">Xuất PDF</span>
          </button>
        </div>
        
        {/* Spacer for sticky bottom nav on mobile */}
        <div className="h-24 md:hidden print:hidden"></div>

        {/* Statistics Modal */}
        <StatisticsModal 
          isOpen={showStatistics}
          onClose={() => setShowStatistics(false)}
        />

        {/* History Modal */}
        <HistoryModal 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
          reports={historyReports} 
          onSelect={handleLoadHistory}
          onDelete={handleDeleteHistory}
        />

        {/* Print Settings Modal */}
        <PrintSettingsModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          onConfirm={handleConfirmPrint}
          config={printConfig}
          setConfig={setPrintConfig}
        />

        {/* AI Prompt Settings Modal */}
        <AiPromptSettingsModal 
          isOpen={showAiSettings}
          onClose={() => setShowAiSettings(false)}
          instruction={aiInstruction}
          onSave={handleSaveAiInstruction}
        />

        {/* Theme Settings Modal */}
        <ThemeSettingsModal
          isOpen={showThemeSettings}
          onClose={() => setShowThemeSettings(false)}
          onThemeChange={setCurrentThemeColor}
        />

      </main>
    </div>
  );
};

export default App;
