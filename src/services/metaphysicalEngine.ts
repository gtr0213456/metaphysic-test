import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化 API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface MetaphysicResult {
  personal: {
    bazi: { pillars: string[]; analysis: string; elements: string };
    humanDesign: { type: string; authority: string; strategy: string; profile: string };
    tzolkin: { kin: string; totem: string; energy: string };
    numerology: { 
      lifeNum: number; 
      grid: number[];
      arrows: string[];
      name81: { strokes: number; luck: string; analysis: string };
      luckyColor: string 
    };
  };
  relationship?: {
    syncScore: number;
    harmony: string;
    advice: string;
    peakTime: string;
  };
  dailyAdvice: string;
}

export class MetaphysicalEngine {
  static async getFullAnalysis(
    user: { name: string; birthday: string }, 
    partner?: { name: string; birthday: string }
  ): Promise<MetaphysicResult> {
    
    // 🔥 關鍵修正點：強制指定 v1beta 接口
    // 同時使用 Google AI Studio 建議的預覽版模型名稱
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" }, 
      { apiVersion: "v1beta" }
    );

    const isRel = !!partner?.name;
    
    // 生成 Prompt
    const prompt = `你是一位玄學大師。請分析姓名 ${user.name} 生日 ${user.birthday}。
    回傳 JSON 格式：
    {
      "personal": {
        "bazi": { "pillars": ["年","月","日","時"], "analysis": "解析", "elements": "五行" },
        "humanDesign": { "type": "類型", "authority": "權威", "strategy": "策略", "profile": "角色" },
        "tzolkin": { "kin": "KIN", "totem": "圖騰", "energy": "關鍵字" },
        "numerology": { "lifeNum": 5, "grid": [0,1,0,0,0,1,0,0,0,0], "arrows": [], "name81": { "strokes": 20, "luck": "吉", "analysis": "詳解" }, "luckyColor": "金" }
      },
      "dailyAdvice": "今日建議"
    }`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      throw new Error(`宇宙能量連結中斷: ${error.message}`);
    }
  }
}
