import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 核心介面定義：確保前端與後端數據結構一致
 */
export interface MetaphysicResult {
  personal: {
    bazi: { 
      pillars: string[]; 
      analysis: string; 
      elements: string 
    };
    humanDesign: { 
      type: string; 
      authority: string; 
      strategy: string; 
      profile: string 
    };
    tzolkin: { 
      kin: string; 
      totem: string; 
      energy: string 
    };
    numerology: { 
      lifeNum: number; 
      grid: number[];
      arrows: string[];
      name81: { 
        strokes: number; 
        luck: string; 
        analysis: string 
      };
      luckyColor: string 
    };
  };
  relationship?: {
    syncScore: number;
    harmony: string;
    advice: string;
    peakTime: string;
  } | null;
  dailyAdvice: string;
}

// 初始化 API 實體
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export class MetaphysicalEngine {
  /**
   * 獲取完整玄學分析報告
   * @param user 使用者資料
   * @param partner 對象資料 (選填)
   */
  static async getFullAnalysis(
    user: { name: string; birthday: string }, 
    partner?: { name: string; birthday: string }
  ): Promise<MetaphysicResult> {
    
    // ✨ 關鍵修正點：強制指定 v1beta 接口
    // 這裡使用 gemini-1.5-flash，若要嘗試 gemini-3 可改為 "gemini-3-flash-preview"
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" }, 
      { apiVersion: "v1beta" }
    );

    const isRel = !!(partner && partner.name && partner.birthday);

    // 構建精準 Prompt，強制模型回傳結構化 JSON
    const prompt = `
      你是一位精通東方八字、姓名學、西方生命靈數、人類圖及瑪雅曆的玄學大師 Aetheris。
      請針對以下對象進行深度能量解析：
      
      使用者姓名：${user.name}
      使用者生日：${user.birthday}
      ${isRel ? `合盤對象：${partner?.name} (生日: ${partner?.birthday})` : ""}

      請嚴格按照以下 JSON 格式回覆，不要包含任何 Markdown 標籤或解釋性文字：
      {
        "personal": {
          "bazi": { 
            "pillars": ["年柱", "月柱", "日柱", "時柱"], 
            "analysis": "命格特點深度解析", 
            "elements": "五行平衡描述" 
          },
          "humanDesign": { 
            "type": "類型", 
            "authority": "權威", 
            "strategy": "策略", 
            "profile": "角色比率" 
          },
          "tzolkin": { 
            "kin": "KIN碼", 
            "totem": "圖騰名稱", 
            "energy": "宇宙頻率關鍵字" 
          },
          "numerology": { 
            "lifeNum": 1到9的整數, 
            "grid": [0,0,0,0,0,0,0,0,0,0], // 基於生日的九宮格數字出現次數
            "arrows": ["123", "456"], // 九宮格連線
            "name81": { 
              "strokes": 總筆劃數, 
              "luck": "吉/凶", 
              "analysis": "姓名靈動解析" 
            },
            "luckyColor": "開運顏色" 
          }
        },
        "relationship": ${isRel ? `{ 
          "syncScore": 0-100的整數, 
          "harmony": "共振解析", 
          "advice": "相處指引", 
          "peakTime": "能量高峰時間" 
        }` : "null"},
        "dailyAdvice": "給使用者的今日宇宙指引"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 清理可能出現的 JSON 代碼塊標籤
      const cleanJson = text.replace(/```json|```/g, "").trim();
      
      const parsedData = JSON.parse(cleanJson);

      // 如果是個人模式，確保 relationship 為 null
      if (!isRel) parsedData.relationship = null;

      return parsedData as MetaphysicResult;
    } catch (error: any) {
      console.error("Metaphysical Engine Error:", error);
      // 捕獲特定錯誤並重新拋出
      if (error.message?.includes("404")) {
        throw new Error("宇宙通道未開啟 (404)：請確保 API 版本設定為 v1beta。");
      }
      throw new Error(`能量連結異常: ${error.message}`);
    }
  }
}
