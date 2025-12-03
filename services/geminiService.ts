import { GoogleGenAI } from "@google/genai";
import { Camera, Recorder } from '../types';

let genAI: GoogleGenAI | null = null;
const STORAGE_KEY = 'gemini_api_key';

export const saveApiKey = (key: string) => {
  localStorage.setItem(STORAGE_KEY, key);
};

export const getStoredApiKey = () => {
  return localStorage.getItem(STORAGE_KEY);
};

export const hasApiKey = () => {
  return !!(process.env.API_KEY || getStoredApiKey());
}

export const initializeGemini = () => {
  // Prioritize Local Storage Key (User input), then Env Var (Build time)
  const storedKey = getStoredApiKey();
  const envKey = process.env.API_KEY;
  const finalKey = storedKey || envKey;

  if (finalKey) {
    genAI = new GoogleGenAI({ apiKey: finalKey });
    return true;
  }
  return false;
};

export const analyzeSystem = async (
  query: string, 
  cameras: Camera[], 
  recorders: Recorder[]
): Promise<string> => {
  // Ensure initialization attempts to load key
  if (!genAI) {
      const success = initializeGemini();
      if (!success) return "Vui lòng nhập Google API Key để sử dụng tính năng AI. (F5 lại trang nếu bạn vừa nhập)";
  }

  if (!genAI) return "Lỗi: Chưa cấu hình API Key.";

  const model = genAI.models;
  
  // Prepare context data
  const systemContext = `
    You are an expert Security System Administrator assistant.
    You have access to the following system data in JSON format:
    
    Recorders: ${JSON.stringify(recorders.map(r => ({ name: r.name, ip: r.ip, location: r.location })))}
    Cameras: ${JSON.stringify(cameras.map(c => ({ name: c.name, status: c.status, location: c.location, installDate: c.installDate, type: c.type, ip: c.ip })))}
    
    Answer the user's question based strictly on this data. 
    If you suggest technical actions, keep them brief.
    Format the response in Markdown.
    If the user asks for a summary, provide a breakdown by status and location.
  `;

  try {
    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: 'user', parts: [{ text: systemContext }] },
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Low latency for chat
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, tôi gặp lỗi khi phân tích hệ thống. Vui lòng kiểm tra lại API Key.";
  }
};