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

    const MODEL_ID = "gemini-1.5-flash";
    const isRel = !!(partner && partner.name);
    
    // 💡 備選路徑方案：有些新 Key 在 v1beta 會報 404，但在 v1 卻正常
    const apiVersions = ['v1beta', 'v1'];
    let lastError = "";

    const prompt = `你是一位精通東西方玄學的核心 AI Aetheris。
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner?.name}，生日：${partner?.birthday}。` : ""}
    要求：嚴格輸出 JSON 格式，包含八字、紫微、姓名學、人類圖、生命靈數、卓爾金曆、關係合盤與今日宜忌。`;

    for (const version of apiVersions) {
      try {
        const API_URL = `https://generativelanguage.googleapis.com/${version}/models/${MODEL_ID}:generateContent?key=${apiKey}`;
        
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json", temperature: 0.75 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates[0].content.parts[0].text;
          return JSON.parse(rawText) as MetaphysicResult;
        }

        // 捕捉 404，嘗試下一個版本
        const errorData = await response.json().catch(() => ({}));
        lastError = errorData.error?.message || `Status ${response.status}`;
        
      } catch (e: any) {
        lastError = e.message;
      }
    }

    // 如果所有版本都失敗，統一拋出錯誤，且「絕對不印出」包含 Key 的原始 Error
    console.error("Engine Blocked a potential leak. Error info:", lastError);
    throw new Error(`維度連結中斷: ${lastError}。請確認 Google AI Studio 專案已啟用且 Key 有效。`);
  }
}
