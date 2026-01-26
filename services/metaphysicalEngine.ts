// src/services/metaphysicalEngine.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- 定義數據規格 ---
export interface MetaphysicResult {
  personal: {
    bazi: { pillars: string[]; analysis: string; elements: string };
    humanDesign: { type: string; authority: string; strategy: string; profile: string };
    tzolkin: { kin: string; totem: string; energy: string };
    numerology: { lifeNum: number; name81: string; luckyColor: string };
  };
  relationship?: {
    syncScore: number;
    harmony: string;
    advice: string;
    peakTime: string;
  };
  dailyAdvice: string;
}

// 初始化 Gemini AI
// 注意：請確保你的環境變數名稱與 Vercel 後台一致
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export class MetaphysicalEngine {
  
  /**
   * 核心數據引擎：一次獲取所有命盤與分析資料
   * 修正了截圖中的模型路徑問題
   */
  static async getFullAnalysis(user: { name: string; birthday: string }, partner?: { name: string; birthday: string }): Promise<MetaphysicResult> {
    // 修正模型名稱為 gemini-1.5-flash 以符合 v1beta 規範
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const isRel = !!partner?.name;

    const prompt = `
      你是一位精通全球玄學與能量系統的大師 Aetheris。
      
      ## 請求對象數據
      - 使用者：${user.name} (生日: ${user.birthday})
      ${isRel ? `- 合盤對象：${partner?.name} (生日: ${partner?.birthday})` : ''}

      ## 任務要求
      請根據以上數據進行深度運算（包含八字、人類圖、卓爾金曆、81靈動數）。
      請嚴格按照以下 JSON 格式回覆，不要有任何 Markdown 標籤或解釋文字：

      {
        "personal": {
          "bazi": { "pillars": ["年柱", "月柱", "日柱", "時柱"], "analysis": "格局解析", "elements": "五行強弱" },
          "humanDesign": { "type": "類型", "authority": "內在權威", "strategy": "策略", "profile": "人生角色" },
          "tzolkin": { "kin": "KIN編號", "totem": "圖騰名稱", "energy": "能量關鍵字" },
          "numerology": { "lifeNum": 數字, "name81": "姓名81數吉凶", "luckyColor": "幸運色" }
        },
        "relationship": ${isRel ? '{ "syncScore": 85, "harmony": "共振描述", "advice": "相處建議", "peakTime": "今日最佳互動時機" }' : 'null'},
        "dailyAdvice": "今日綜合能量指引(150字內)"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 乾淨地解析 JSON，過濾掉 AI 可能加上的代碼塊標籤
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson) as MetaphysicResult;
      
    } catch (error) {
      console.error("引擎數據獲取失敗:", error);
      // 回傳一個基礎錯誤結構防止 UI 崩潰
      throw new Error("宇宙能量鏈接中斷，請確認 API Key 是否正確設定。");
    }
  }

  // --- 以下為本地輔助計算工具（可選擇性保留或用於 AI 驗證） ---

  static calculateLifePath(birthday: string): number {
    const digits = birthday.replace(/\D/g, '');
    if (!digits) return 0;
    const reduce = (numStr: string): number => {
      const sum = numStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      return sum > 9 ? reduce(sum.toString()) : sum;
    };
    return reduce(digits);
  }

  static calculate81Strokes(name: string): number {
    if (!name) return 0;
    // 這裡可以使用更精準的筆劃庫，目前先採簡單模擬邏輯
    const base = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) % 10) + 1, 0);
    return (base % 81) || 81;
  }
}
