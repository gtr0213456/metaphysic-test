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
    
    // 💡 這裡不再呼叫 Google，而是呼叫你自己專案的 API 路由
    const response = await fetch("/api/metaphysics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, partner })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "維度連結失敗，請檢查網路或金鑰配置");
    }

    return await response.json() as MetaphysicResult;
  }
}
