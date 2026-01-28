export interface MetaphysicResult {
  personal: {
    eastern: {
      bazi: { pillars: string[]; strength: string; favorable: string; analysis: string };
      ziwei: { mainStars: string; palace: string; luck: string };
      nameAnalysis: { 
        strokes: number; 
        fiveGrids: { heaven: number; man: number; earth: number; out: number; total: number };
        luck81: string;
        threeTalents: string;
      };
    };
    western: {
      humanDesign: { type: string; authority: string; strategy: string; profile: string; channels: string[] };
      numerology: { lifeNum: number; grid: number[]; arrows: string[]; personalYear: string };
      tzolkin: { kin: string; totem: string; tone: string; wave: string };
    };
  };
  relationship?: {
    syncScore: number;
    harmony: string;
    advice: string;
    warning: string;
    communicationTone: string;
  };
  dailyAdvice: string;
  luckyIndicators: { color: string; direction: string; action: string[] };
}

export class MetaphysicalEngine {
  static async getFullAnalysis(
    user: { name: string; birthday: string }, 
    partner?: { name: string; birthday: string }
  ): Promise<MetaphysicResult> {
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("環境變數 VITE_GEMINI_API_KEY 未配置");

    // 💡 嘗試最穩定的模型順序
    const MODEL_CANDIDATES = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash-exp"];
    const isRel = !!(partner && partner.name);
    
    const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner?.name}，生日：${partner?.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。`;

    let lastError = "";

    for (const modelId of MODEL_CANDIDATES) {
      try {
        // 固定使用 v1beta，因為只有它支援 responseMimeType
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
              responseMimeType: "application/json", // 必須是小駝峰
              temperature: 0.8 
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates[0].content.parts[0].text;
          return JSON.parse(rawText) as MetaphysicResult;
        }

        const errorData = await response.json().catch(() => ({}));
        lastError = errorData.error?.message || `Status ${response.status}`;
        
        // 如果是 404 則嘗試下一個模型 ID
        if (response.status === 404) continue;
        else break; 

      } catch (e: any) {
        lastError = e.message;
      }
    }

    // 🔴 攔截報錯，保護 API Key 不被瀏覽器噴出
    console.error("Engine Safe Error:", lastError);
    throw new Error(`維度連結中斷: ${lastError}`);
  }
}
