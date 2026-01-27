import { GoogleGenerativeAI } from "@google/generative-ai";
import { Language } from "../types";

// 初始化 Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface MetaphysicResult {
  personal: {
    bazi: { pillars: string[]; analysis: string; elements: string };
    humanDesign: { type: string; authority: string; strategy: string; profile: string };
    tzolkin: { kin: string; totem: string; energy: string };
    numerology: { 
      lifeNum: number; 
      grid: number[];      // 生命靈數九宮格
      arrows: string[];    // 力量線
      name81: {            // 修正：將 81 靈動數結構化
        strokes: number;
        luck: string;
        analysis: string;
      };
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
  
  /**
   * 核心引擎：本地運算 + AI 深度解析
   */
  static async getFullAnalysis(
    user: { name: string; birthday: string }, 
    partner?: { name: string; birthday: string }
  ): Promise<MetaphysicResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const isRel = !!partner?.name;

    // 1. 本地硬核計算
    const userNum = this.calculateNumerology(user.birthday);
    const userStrokes = this.calculate81Strokes(user.name);
    
    // 2. 構建 Prompt
    const prompt = `
      你是一位精通全球玄學與能量系統的大師 Aetheris。
      
      ## 精確運算數據 (不可更改)
      - 使用者：${user.name} (生日: ${user.birthday})
      - 生命靈數：${userNum.lifePathNum}
      - 生命靈數九宮格分佈：${JSON.stringify(userNum.grid)}
      - 姓名總格筆劃：${userStrokes} (請根據此筆劃進行81靈動數吉凶解析)
      ${isRel ? `- 合盤對象：${partner?.name} (生日: ${partner?.birthday})` : ''}

      ## 任務要求
      請根據以上數據進行深度解析（包含八字、人類圖、卓爾金曆、81靈動數解析）。
      請嚴格按照以下 JSON 格式回覆，不要有任何解釋文字：

      {
        "personal": {
          "bazi": { "pillars": ["年柱", "月柱", "日柱", "時柱"], "analysis": "格局解析", "elements": "五行強弱" },
          "humanDesign": { "type": "類型", "authority": "內在權威", "strategy": "策略", "profile": "人生角色" },
          "tzolkin": { "kin": "KIN編號", "totem": "圖騰名稱", "energy": "能量關鍵字" },
          "numerology": { 
            "lifeNum": ${userNum.lifePathNum}, 
            "grid": ${JSON.stringify(userNum.grid)},
            "arrows": ${JSON.stringify(userNum.lines)},
            "name81": {
              "strokes": ${userStrokes},
              "luck": "吉/凶/平",
              "analysis": "針對${userStrokes}劃的靈動數解析"
            },
            "luckyColor": "幸運色" 
          }
        },
        "relationship": ${isRel ? '{ "syncScore": 85, "harmony": "共振描述", "advice": "相處建議", "peakTime": "今日最佳互動時機" }' : 'null'},
        "dailyAdvice": "今日綜合能量指引(150字內)"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson) as MetaphysicResult;
    } catch (error) {
      console.error("宇宙能量鏈接中斷:", error);
      throw new Error("API 連結失敗，請檢查網路或金鑰。");
    }
  }

  // --- 硬核邏輯運算區 ---

  static calculateNumerology(birthday: string) {
    const digits = birthday.replace(/\D/g, '');
    const grid = new Array(10).fill(0);
    digits.split('').forEach(d => {
      const num = parseInt(d);
      if (num > 0) grid[num]++;
    });

    const reduce = (numStr: string): number => {
      const sum = numStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      if (sum === 11 || sum === 22 || sum === 33) return sum;
      return sum > 9 ? reduce(sum.toString()) : sum;
    };

    const lines = [];
    const check = (a: number, b: number, c: number) => grid[a] > 0 && grid[b] > 0 && grid[c] > 0;
    if (check(1, 2, 3)) lines.push('123-體能線');
    if (check(4, 5, 6)) lines.push('456-情緒線');
    if (check(7, 8, 9)) lines.push('789-行動線');
    if (check(1, 5, 9)) lines.push('159-意志線');
    if (check(3, 5, 7)) lines.push('357-人緣線');

    return { lifePathNum: reduce(digits), grid, lines };
  }

  static calculate81Strokes(name: string): number {
    if (!name) return 0;
    // 這裡先採簡單模擬邏輯，未來建議接繁體筆劃資料庫
    const base = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) % 10) + 1, 0);
    return (base % 81) || 81;
  }
}
