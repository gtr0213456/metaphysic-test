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
  static async getFullAnalysis(user: { name: string; birthday: string }, partner?: any): Promise<MetaphysicResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    /**
     * 🔥 核心修正說明：
     * 1. 使用 'gemini-1.5-flash-latest' 以確保獲取該系列最新且穩定的版本。
     * 2. 如果你想換成截圖中看到的 Gemini 3，請將其改為 'gemini-3-flash-preview'。
     */
    const MODEL_ID = "gemini-1.5-flash-latest"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

    const prompt = `你是一位精通玄學與大數據分析的 AI 導師 Aetheris。
    請針對姓名：${user.name}，生日：${user.birthday} 進行深度解析。
    
    輸出要求：
    1. 必須嚴格遵守 JSON 格式。
    2. 包含八字、人類圖、生命靈數九宮格、姓名學 81 數解析。
    
    JSON 範例結構：
    {
      "personal": {
        "bazi": { "pillars": ["年", "月", "日", "時"], "analysis": "解析內容", "elements": "五行分佈" },
        "humanDesign": { "type": "類型", "authority": "權威", "strategy": "策略", "profile": "角色" },
        "tzolkin": { "kin": "KIN碼", "totem": "圖騰", "energy": "關鍵能量" },
        "numerology": { "lifeNum": 5, "grid": [1,0,1,0,1,0,1,0,1], "arrows": ["1-5-9"], "name81": { "strokes": 24, "luck": "吉", "analysis": "詳解" }, "luckyColor": "顏色" }
      },
      "dailyAdvice": "今日宇宙指引"
    }`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const status = response.status;
        const msg = errorData.error?.message || '未知錯誤';
        
        // 針對 404 的精準診斷
        if (status === 404) {
          throw new Error(`[維度錯誤 404] 找不到模型 ${MODEL_ID}。請嘗試在代碼中將 MODEL_ID 更換為 'gemini-1.5-pro' 或 'gemini-3-flash-preview'。`);
        }
        throw new Error(`[API 異常 ${status}] ${msg}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("宇宙一片沈默，請稍後再試。");
      }
      
      const rawText = data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText) as MetaphysicResult;

    } catch (e: any) {
      console.error("Metaphysical Engine Critical Error:", e);
      throw e;
    }
  }
}
