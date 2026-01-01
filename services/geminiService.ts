import { GoogleGenAI } from "@google/genai";
import { DutyReport } from "../types";

export const DEFAULT_AI_INSTRUCTION = `Bạn là một trợ lý ảo giáo dục. Hãy viết một báo cáo tổng kết ngắn gọn, trang trọng cho ban giám hiệu dựa trên dữ liệu trực ban được cung cấp.

Yêu cầu:
1. Viết giọng văn sư phạm, nghiêm túc.
2. Nêu bật các vấn đề cần chú ý (lớp vắng nhiều, lý do bất thường).
3. Kết luận ngắn gọn.`;

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("Vui lòng cấu hình API Key để sử dụng tính năng này.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDutySummary = async (report: DutyReport, systemInstruction: string = DEFAULT_AI_INSTRUCTION): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Calculate basic stats for the prompt
    const totalAbsent = report.records.reduce((sum, r) => sum + Number(r.absentCount), 0);
    const classesWithAbsence = report.records.filter(r => r.absentCount > 0);
    
    const dataContext = `
      DỮ LIỆU BÁO CÁO:
      - Giáo viên trực: ${report.teacherName}
      - Ngày: ${report.dutyDate} (${report.session})
      - Tổng số học sinh vắng: ${totalAbsent}
      - Chi tiết vắng:
      ${classesWithAbsence.map(c => `  + Lớp ${c.className}: vắng ${c.absentCount} (Lý do: ${c.absentReason || 'Không có'}). Ghi chú: ${c.notes || 'Không có'}`).join('\n')}
      
      - Hoạt động giáo viên: ${report.teacherActivities}
      - Hoạt động học sinh: ${report.studentActivities}
      - Hoạt động khác: ${report.otherActivities}
    `;

    const finalPrompt = `${systemInstruction}\n\n${dataContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: finalPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Không thể tạo báo cáo lúc này.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.";
  }
};

export const refineSectionText = async (text: string, sectionName: string): Promise<string> => {
  if (!text.trim()) return "";
  
  try {
    const ai = getAiClient();
    const prompt = `
      Hãy viết lại nội dung sau đây cho mục "${sectionName}" trong Sổ Trực Ban của trường học.
      
      Nội dung gốc: "${text}"
      
      Yêu cầu:
      1. Sử dụng văn phong sư phạm, trang trọng, nghiêm túc.
      2. Súc tích, ngắn gọn, sửa lỗi chính tả và diễn đạt (nếu có).
      3. Chỉ trả về nội dung đã chỉnh sửa, không thêm lời dẫn hay giải thích.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error refining text:", error);
    throw error;
  }
};