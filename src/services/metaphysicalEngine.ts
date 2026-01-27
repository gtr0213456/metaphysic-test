import { GoogleGenerativeAI } from "@google/generative-ai";

// 修正：明確指向 v1beta 節點
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
    
    // 修正：明確在獲取模型時指定 apiVersion 為 'v1beta'
    // 這裡使用 gemini-2.0-flash 或 gemini-1.5-flash 作為目前最穩定的節點
    // 如果你想嚐鮮 gemini-3，請確保你的 API Key 權限已開通
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" }, 
      { apiVersion: 'v1beta' } 
    );
    
    const isRel = !!partner?.name;
    const userNum = this.calculateNumerology(user.birthday);
    const userStrokes = this.calculate81Strokes(user.name);
    
    const prompt = `
      你是一位精通全球玄學與能量系統的大師 Aetheris。
      請根據以下數據進行深度解析：
      - 使用者：${user.name} (生日: ${user.birthday})
      - 生命靈數：${userNum.lifePathNum}
      - 姓名總格筆劃：${userStrokes}
      ${isRel ? `- 合盤對象：${partner?.name} (生日: ${partner?.birthday})` : ''}

      請嚴格按照以下 JSON 格式回覆，不含解釋：
      {
        "personal": {
          "bazi": { "pillars": ["年柱", "月柱", "日柱", "時柱"], "analysis": "格局解析", "elements": "五行" },
          "humanDesign": { "type": "類型", "authority": "權威", "strategy": "策略", "profile": "角色" },
          "tzolkin": { "kin": "KIN", "totem": "圖騰", "energy": "關鍵字" },
          "numerology": { 
            "lifeNum": ${userNum.lifePathNum}, 
            "grid": ${JSON.stringify(userNum.grid)},
            "arrows": ${JSON.stringify(userNum.lines)},
            "name81": { "strokes": ${userStrokes}, "luck": "吉/凶", "analysis": "解析" },
            "luckyColor": "顏色" 
          }
        },
        "relationship": ${isRel ? '{ "syncScore": 85, "harmony": "共振", "advice": "建議", "peakTime": "22:00" }' : 'null'},
        "dailyAdvice": "今日指引"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson) as MetaphysicResult;
    } catch (error) {
      console.error("API Error Detail:", error);
      throw new Error(`能量鏈接中斷: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  static calculateNumerology(birthday: string) {
    const digits = birthday.replace(/\D/g, '');
    const grid = new Array(10).fill(0);
    digits.split('').forEach(d => {
      const num = parseInt(d);
      if (num > 0) grid[num]++;
    });
    const reduce = (n: string): number => {
      const s = n.split('').reduce((a, d) => a + parseInt(d), 0);
      return (s > 9 && s !== 11 && s !== 22 && s !== 33) ? reduce(s.toString()) : s;
    };
    const check = (a: number, b: number, c: number) => grid[a] > 0 && grid[b] > 0 && grid[c] > 0;
    const lines = [];
    if (check(1,2,3)) lines.push('123');
    if (check(4,5,6)) lines.push('456');
    return { lifePathNum: reduce(digits), grid, lines };
  }

  static calculate81Strokes(name: string): number {
    if (!name) return 0;
    return (name.split('').reduce((a, c) => a + (c.charCodeAt(0) % 10) + 1, 0) % 81) || 81;
  }
}
