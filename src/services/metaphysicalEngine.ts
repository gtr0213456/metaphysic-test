/**
 * 🛠️ 2026 算命仙等級引擎 (終極完整版)
 * 整合：東方命理、西方數理、關係共振、綜合決策
 * 安全性：已加入錯誤攔截，防止 404/400 報錯時洩漏 API Key
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
    
    // 1. 環境變數預檢
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("找不到 API Key，請檢查 Vercel Environment Variables 是否設定為 VITE_GEMINI_API_KEY");
    }

    const MODEL_ID = "gemini-1.5-flash"; 
    // 確保路徑格式完全正確：models/模型名:方法名
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;
    const isRel = !!(partner && partner.name);
    
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
          generationConfig: { 
            response_mime_type: "application/json", 
            temperature: 0.75 
          }
        })
      });

      // 2. 核心防禦：如果回應不正常，手動拋出錯誤訊息，攔截原始物件防止瀏覽器噴出 URL
      if (!response.ok) {
        // 如果是 404，極有可能是 Key 失效或模型權限問題
        const errorMsg = response.status === 404 
          ? "無法連結至 AI 核心 (404)。這通常代表您的 API Key 已失效或路徑錯誤。" 
          : `維度連結失敗 (${response.status})`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("宇宙回傳了無效數據。");
      }

      const rawText = data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText) as MetaphysicResult;

    } catch (e: any) {
      // 3. 終極捕捉：控制台只印出文字訊息，不會顯示帶有 Key 的原始網址
      console.error("Metaphysical Engine Critical Halt:", e.message);
      throw e; 
    }
  }
}
