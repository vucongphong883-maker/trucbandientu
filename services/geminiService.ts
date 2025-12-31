import { GoogleGenAI } from "@google/genai";
import { DutyReport } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("Vui lòng cấu hình API Key để sử dụng tính năng này.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDutySummary = async (report: DutyReport): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Calculate basic stats for the prompt
    const totalAbsent = report.records.reduce((sum, r) => sum + Number(r.absentCount), 0);
    const classesWithAbsence = report.records.filter(r => r.absentCount > 0);
    
    const prompt = `
      Bạn là một trợ lý ảo giáo dục. Hãy viết một báo cáo tổng kết ngắn gọn, trang trọng cho ban giám hiệu dựa trên dữ liệu trực ban sau đây:
      
      Giáo viên trực: ${report.teacherName}
      Ngày: ${report.dutyDate} (${report.session})
      Tổng số học sinh vắng: ${totalAbsent}
      
      Chi tiết các lớp vắng:
      ${classesWithAbsence.map(c => `- Lớp ${c.className}: vắng ${c.absentCount} em. Lý do: ${c.absentReason || 'Không có'}`).join('\n')}
      
      Hoạt động giáo viên: ${report.teacherActivities}
      Hoạt động học sinh: ${report.studentActivities}
      Hoạt động khác: ${report.otherActivities}
      
      Yêu cầu:
      1. Viết giọng văn sư phạm, nghiêm túc.
      2. Nêu bật các vấn đề cần chú ý (lớp vắng nhiều, lý do bất thường).
      3. Kết luận ngắn gọn.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Direct response preferred for speed
      }
    });

    return response.text || "Không thể tạo báo cáo lúc này.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.";
  }
};