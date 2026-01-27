/**
 * 🛠️ 2026 核心修正：
 * 1. 介面端點：強制使用 v1beta 以對接最新功能。
 * 2. 模型標識：鎖定 gemini-3-flash-preview (或 gemini-1.5-flash-latest)。
 * 3. 輸出控制：啟用 response_mime_type: "application/json" 確保數據結構。
 */

export interface MetaphysicResult {
  personal: {
    bazi: { pillars: string[]; analysis: string; elements: string };
    humanDesign: { type: string; authority: string; strategy: string; profile: string };
    tzolkin: { kin: string; totem: string; energy: string };
    numerology: { 
      lifeNum: number; grid: number[]; arrows: string[];
      name81: { strokes: number; luck: string; analysis: string };
      luckyColor: string 
    };
  };
  relationship?: any;
  dailyAdvice: string;
}

export class MetaphysicalEngine {
  static async getFullAnalysis(
    user: { name: string; birthday: string }, 
    partner?: { name: string; birthday: string }
  ): Promise<MetaphysicResult> {
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // 🔥 重要：這是目前 v1beta 最穩定的模型名稱標記
    const MODEL_ID = "gemini-3-flash-preview"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

    const isRel = !!(partner && partner.name);
    const prompt = `你是一位精通玄學的 AI Aetheris。
    請分析姓名：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner?.name}，生日：${partner?.birthday}。` : ""}
    
    要求：
    1. 輸出為純 JSON。
    2. 包含八字、人類圖、生命靈數、姓名學。
    
    JSON 結構：
    {"personal":{"bazi":{"pillars":["","","",""],"analysis":"","elements":""},"humanDesign":{"type":"","authority":"","strategy":"","profile":""},"tzolkin":{"kin":"","totem":"","energy":""},"numerology":{"lifeNum":5,"grid":[0,1,0,0,0,1,0,0,0,0],"arrows":[],"name81":{"strokes":20,"luck":"吉","analysis":""},"luckyColor":""}},"dailyAdvice":""}`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.8
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`[API Error ${response.status}] ${errorData.error?.message}`);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      // 直接解析 Google 傳回的乾淨 JSON 字串
      return JSON.parse(rawText) as MetaphysicResult;

    } catch (e: any) {
      console.error("玄學引擎運行異常:", e);
      throw e;
    }
  }
}
