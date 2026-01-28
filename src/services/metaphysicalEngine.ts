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
    const MODEL_ID = "gemini-1.5-flash"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;
    const isRel = !!(partner && partner.name);
    
    // 防禦：如果沒讀到 Key 提早報錯，不發起請求
    if (!apiKey) throw new Error("環境變數配置失效 (API KEY MISSING)");

    const prompt = `你是一位精通東西方玄學的核心 AI Aetheris，目前時間是 2026 年。
    請對以下對象進行「算命仙」等級的深度解析：
    用戶：${user.name}，生日：${user.birthday}。
    ${isRel ? `合盤對象：${partner?.name}，生日：${partner?.birthday}。` : ""}

    要求：
    1. 嚴格輸出 JSON 格式。
    2. 東方：包含八字日主強弱與喜用神、姓名學五格計算（康熙筆畫）、81靈動數、三才配置。
    3. 西方：包含人類圖特定通道、生命靈數九宮格連線、卓爾金曆波符。
    4. 關係：計算兩人能量共振、通訊語氣建議、衝突雷區預警。
    5. 決策：提供今日宜忌、幸運色、方位。

    JSON 結構必須精確如下：
    {
      "personal": {
        "eastern": {
          "bazi": { "pillars": ["年","月","日","時"], "strength": "", "favorable": "", "analysis": "" },
          "ziwei": { "mainStars": "", "palace": "", "luck": "" },
          "nameAnalysis": { "strokes": 0, "fiveGrids": {"heaven":0,"man":0,"earth":0,"out":0,"total":0}, "luck81": "", "threeTalents": "" }
        },
        "western": {
          "humanDesign": { "type": "", "authority": "", "strategy": "", "profile": "", "channels": [] },
          "numerology": { "lifeNum": 0, "grid": [0,0,0,0,0,0,0,0,0], "arrows": [], "personalYear": "" },
          "tzolkin": { "kin": "", "totem": "", "tone": "", "wave": "" }
        }
      },
      "relationship": { "syncScore": 0, "harmony": "", "advice": "", "warning": "", "communicationTone": "" },
      "dailyAdvice": "",
      "luckyIndicators": { "color": "", "direction": "", "action": [] }
    }`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json", temperature: 0.75 }
        })
      });

      if (!response.ok) {
        // 自定義錯誤拋出，防止瀏覽器在 console 噴出帶 Key 的原始報錯網址
        throw new Error(`維度連結中斷 (Status: ${response.status})`);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText) as MetaphysicResult;
    } catch (e: any) {
      // 僅印出 message，不印出整個錯誤對象以防洩漏
      console.error("Engine Safe Error Handler:", e.message);
      throw e;
    }
  }
}
