export interface ClassRecord {
  id: string;
  className: string;
  totalStudents: number; // Sĩ số
  absentCount: number; // Học sinh vắng
  absentReason: string; // Lý do
  homeroomTeacher: string; // GVCN
}

export interface DutyReport {
  teacherName: string;
  dutyDate: string;
  session: 'Sáng' | 'Chiều';
  records: ClassRecord[];
  teacherActivities: string; // Hoạt động giáo viên
  studentActivities: string;
  otherActivities: string;
}

export interface SavedReport extends DutyReport {
  id: string;
  createdAt: number;
}

export enum SummaryStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}