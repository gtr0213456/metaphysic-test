/**
 * 🛠️ 2026 算命仙等級引擎
 * 整合：東方命理、西方數理、關係共振、綜合決策
 */

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
    const MODEL_ID = "gemini-3-flash-preview"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

    const isRel = !!(partner && partner.name);
    
    // 注入「算命仙」級別的深度 Prompt
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

      if (!response.ok) throw new Error(`維度連結中斷 (${response.status})`);
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text) as MetaphysicResult;
    } catch (e: any) {
      console.error("Engine Critical Error:", e);
      throw e;
    }
  }
}
