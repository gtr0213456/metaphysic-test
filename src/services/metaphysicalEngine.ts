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
    
    try {
      // 💡 呼叫 Vercel 的後端路由
      const response = await fetch("/api/metaphysics", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ user, partner })
      });

      // 檢查 HTTP 狀態碼
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // 如果是 404，代表連到了錯誤的路徑；如果是 5xx，代表 Google API 噴錯
        throw new Error(errorData.error || `維度連結失敗 (Status: ${response.status})`);
      }

      const data = await response.json();

      // 🛑 額外防護：確保回傳的 JSON 包含必要的結構，防止前端讀取時崩潰
      if (!data || !data.personal || !data.luckyIndicators) {
        console.error("回傳數據格式不完整:", data);
        throw new Error("天機暫時無法讀取，請稍後重試");
      }

      return data as MetaphysicResult;

    } catch (error: any) {
  console.error("MetaphysicalEngine Error:", error);
  const errorMsg = error.message || JSON.stringify(error) || "未知錯誤，請檢查連線";
  throw new Error(errorMsg);  // 讓 alert 顯示完整訊息
}
  }
}
