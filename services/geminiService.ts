import { GoogleGenAI } from "@google/genai";
import { Camera, Recorder } from '../types';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    genAI = new GoogleGenAI({ apiKey });
  }
};

export const analyzeSystem = async (
  query: string, 
  cameras: Camera[], 
  recorders: Recorder[]
): Promise<string> => {
  if (!genAI) {
      initializeGemini();
      if (!genAI) return "Error: API Key not found. Please set REACT_APP_GEMINI_API_KEY.";
  }

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
    return "Sorry, I encountered an error analyzing your system.";
  }
};