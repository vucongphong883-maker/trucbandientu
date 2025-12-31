import { DutyReport, SavedReport } from '../types';

const STORAGE_KEY = 'duty_report_history';

// Generate a simple unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const saveReportToHistory = (report: DutyReport): SavedReport => {
  const history = getReportHistory();
  const newReport: SavedReport = {
    ...report,
    id: generateId(),
    createdAt: Date.now(),
  };
  
  // Add to beginning of array
  const updatedHistory = [newReport, ...history];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Local storage full or disabled", e);
    // Optionally handle quota exceeded
  }
  
  return newReport;
};

export const getReportHistory = (): SavedReport[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const deleteReportFromHistory = (id: string): SavedReport[] => {
  const history = getReportHistory();
  const updatedHistory = history.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
};